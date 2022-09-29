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

function App() {
  const [operations, setOperations] = useState<Operations>({
    query: [],
    mutation: [],
    subscription: [],
  });
  const [selectedOperation, setSelectedOperation] = useState<
    TRPCOperation | undefined
  >(undefined);
  const [currentTab, setCurrentTab] = useState<OperationType>("query");
  const port = useRef(chrome.runtime.connect({ name: "panel" }));

  const handleLinkMessage = (message: LinkMessage) => {
    const payload = superjson.parse<TRPCOperation>(message.payload);
    const operationTypeList = operations[payload.type];
    const operationIndex = operationTypeList.findIndex(
      (operation) => operation.id === payload.id
    );
    if (operationIndex !== -1) {
      operationTypeList[operationIndex] = {
        ...operationTypeList,
        ...payload,
      };
    } else {
      operationTypeList.push(payload);
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
    <div className="text-white bg-neutral-900 h-full flex flex-col md:flex-row">
      <div className="min-w-max">
        <Nav
          queriesCount={operations.query.length}
          mutationsCount={operations.mutation.length}
          subscriptionsCount={operations.subscription.length}
          onTabChange={onTabChange}
        />
        <div className="mt-1 h-72 overflow-y-auto">
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
      <div className="flex flex-col md:flex-row gap-3 h-full w-full bg-[#1f1e1f] px-4 py-2">
        <OperationViewer title="Input" jsonData={selectedOperation?.input} />
        <OperationViewer
          title="Result"
          jsonData={selectedOperation?.result}
          elapsedTime={selectedOperation?.elapsedMs}
        />
      </div>
    </div>
  );
}

export default App;

type PortMessageListener = (
  message: LinkMessage | ContentScriptMessage
) => void;

type TRPCOperation = Operation & {
  /**
   * Request result
   */
  result?: OperationResponse<AnyRouter>;
  elapsedMs?: number;
};

type Operations = {
  [TKey in OperationType]: TRPCOperation[];
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
    <div className="w-full overflow-auto">
      <div className="flex items-center justify-between">
        <div className="text-lg">{title}</div>
        {elapsedTime !== undefined ? (
          <div className="bg-sky-400 text-zinc-100 rounded-sm px-1">
            {elapsedTime} ms
          </div>
        ) : null}
      </div>
      <JSONTree data={jsonData} theme={treeTheme} />
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
