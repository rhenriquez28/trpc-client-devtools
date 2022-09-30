import type { Operation, OperationResponse } from "@trpc/client";
import type { AnyRouter } from "@trpc/server";
import { useEffect, useRef, useState } from "react";
import { JSONTree } from "react-json-tree";
import superjson from "superjson";
import {
  ContentScriptMessage,
  DevtoolsPanelMessage,
  LinkMessage,
} from "../types";
import Nav from "./components/Nav";
import "./PanelApp.css";
import { OperationType } from "./types";

const inspectorBackgroundColor = "bg-[#1f1e1f]";

function App() {
  const [operations, setOperations] = useState<Operations>({
    query: [],
    mutation: [],
    subscription: [],
  });
  const [selectedOperation, setSelectedOperation] = useState<
    (TRPCOperation | undefined) & (TRPCSubscription | undefined)
  >(undefined);
  const [currentTab, setCurrentTab] = useState<OperationType>("query");
  const port = useRef(chrome.runtime.connect({ name: "panel" }));

  const handleSubscription = (
    subscriptionList: TRPCSubscription[],
    payload: TRPCOperation,
    subscriptionIndex: number
  ) => {
    if (subscriptionIndex !== -1) {
      const subscription = subscriptionList[
        subscriptionIndex
      ] as TRPCSubscription;
      subscription.results = [
        ...subscriptionList[subscriptionIndex].results!,
        { result: payload.result, elapsedMs: payload.elapsedMs },
      ];
    } else {
      subscriptionList.push({ ...payload, results: [] });
    }
  };

  const handleOperation = (
    operationList: TRPCOperation[],
    payload: TRPCOperation,
    operationIndex: number
  ) => {
    if (operationIndex !== -1) {
      operationList[operationIndex] = {
        ...operationList[operationIndex],
        ...payload,
      };
    } else {
      operationList.push(payload);
    }
  };

  const handleLinkMessage = (message: LinkMessage) => {
    const payload = superjson.parse<TRPCOperation>(message.payload);
    const operationTypeList = operations[payload.type];
    const operationIndex = operationTypeList.findIndex(
      (operation) => operation.id === payload.id
    );
    if (payload.type === "subscription") {
      handleSubscription(operationTypeList, payload, operationIndex);
    } else {
      handleOperation(operationTypeList, payload, operationIndex);
    }
    setOperations({ ...operations });
  };

  const handleContentScriptMessage = (message: ContentScriptMessage) => {
    if (message.message === "create-devtools-panel") {
      chrome.devtools.panels.create(
        "tRPC",
        "",
        "src/extension/devtools/panel.html"
      );
    }
  };

  const messageListener = (message: LinkMessage | ContentScriptMessage) => {
    if (message.source === "trpcDevtoolsLink") {
      handleLinkMessage(message);
    }
    if (message.source === "contentScript") {
      handleContentScriptMessage(message);
    }
  };

  useEffect(() => {
    port.current.postMessage({
      source: "devtoolsPanel",
      message: "set-tab-id",
      payload: { tabId: chrome.devtools.inspectedWindow.tabId },
    } as DevtoolsPanelMessage);
  }, []);

  usePortMessageListener(port.current, messageListener);

  const onTabChange = (selectedTab: OperationType) => {
    setSelectedOperation(undefined);
    setCurrentTab(selectedTab);
  };

  return (
    <div className="text-white bg-neutral-900 h-full grid grid-cols-1 grid-rows-2 md:grid-cols-12 md:grid-rows-1 overflow-hidden">
      <div className="overflow-hidden flex flex-col flex-grow min-h-0 md:col-start-1 md:col-end-5">
        <Nav
          queriesCount={operations.query.length}
          mutationsCount={operations.mutation.length}
          subscriptionsCount={operations.subscription.length}
          onTabChange={onTabChange}
        />
        <div className="mt-1 min-h-0 overflow-y-auto">
          {operations[currentTab].map((operation) => {
            return (
              <div
                key={operation.id}
                className={`p-4 hover:bg-neutral-700 ${
                  selectedOperation?.id === operation.id ? "bg-neutral-600" : ""
                }`}
                onClick={() => setSelectedOperation(operation)}
              >
                {operation.path}
              </div>
            );
          })}
        </div>
      </div>
      <div
        className={`flex flex-col md:flex-row gap-3 h-full w-full ${inspectorBackgroundColor} px-4 py-2 md:col-start-5 md:col-end-13`}
      >
        <OperationViewer title="Input" jsonData={selectedOperation?.input} />
        <OperationViewer
          title="Result"
          jsonData={
            selectedOperation?.type === "subscription"
              ? selectedOperation.results
              : selectedOperation?.result
          }
          elapsedTime={
            selectedOperation?.type === "subscription"
              ? undefined
              : selectedOperation?.elapsedMs
          }
        />
      </div>
    </div>
  );
}

export default App;

type PortMessageListener = (
  message: LinkMessage | ContentScriptMessage
) => void;

type TRPCOperationResponseInfo = {
  result?: OperationResponse<AnyRouter>;
  elapsedMs?: number;
};

type TRPCOperation = Operation & TRPCOperationResponseInfo;

type TRPCSubscription = Operation & {
  results?: TRPCOperationResponseInfo[];
};

type Operations = {
  [TKey in OperationType]: (TKey extends "subscription"
    ? TRPCSubscription
    : TRPCOperation)[];
};

const OperationViewer: React.FC<{
  title: string;
  jsonData: TRPCOperation["input"] | OperationResponse<AnyRouter>;
  elapsedTime?: number;
}> = ({ title, jsonData, elapsedTime }) => {
  const treeTheme = {
    scheme: "Ayu Light",
    author: "Khue Nguyen ",
    base00: "#FAFAFA",
    base01: "#F3F4F5",
    base02: "#F8F9FA",
    base03: "#ABB0B6",
    base04: "#828C99",
    base05: "#5C6773",
    base06: "#242936",
    base07: "#1A1F29",
    base08: "#F07178",
    base09: "#FA8D3E",
    base0A: "#F2AE49",
    base0B: "#86B300",
    base0C: "#4CBF99",
    base0D: "#36A3D9",
    base0E: "#A37ACC",
    base0F: "#E6BA7E",
  };

  return (
    <div className="w-full flex flex-col flex-grow min-h-0 relative flex-shrink-0 md:flex-shrink">
      <div
        className={`flex items-center justify-between ${inspectorBackgroundColor}`}
      >
        <div className="text-lg">{title}</div>
        {elapsedTime !== undefined ? (
          <div className="bg-sky-400 text-zinc-100 rounded-sm px-1">
            {elapsedTime} ms
          </div>
        ) : null}
      </div>
      <div className="min-h-0 overflow-auto">
        <JSONTree data={jsonData} theme={treeTheme} />
      </div>
    </div>
  );
};

const usePortMessageListener = (
  port: chrome.runtime.Port,
  callback: PortMessageListener
) => {
  const savedCallback = useRef<PortMessageListener>();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function listener(...args: Parameters<PortMessageListener>) {
      savedCallback.current!(...args);
    }
    port.onMessage.addListener(listener);
    return () => port.onMessage.removeListener(listener);
  }, []);
};
