import type { Operation, OperationResponse } from "@trpc/client";
import type { AnyRouter } from "@trpc/server";
import { useEffect, useState } from "react";
import { JSONTree } from "react-json-tree";
import superjson from "superjson";
import Nav from "./components/Nav";
import "./PanelApp.css";
import { NavTabType } from "./types";

type DevtoolsMessage = {
  source: "trpcDevtoolsLink";
  payload: string;
};

type TRPCOperation = Operation & {
  /**
   * Request result
   */
  result?: OperationResponse<AnyRouter>;
  elapsedMs?: number;
};

type FilteredOperations = {
  [TKey in NavTabType]: TRPCOperation[];
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

function App() {
  const [operations, setOperations] = useState<TRPCOperation[]>([]);
  const [selectedOperation, setSelectedOperation] = useState<
    TRPCOperation | undefined
  >(undefined);
  const [currentTab, setCurrentTab] = useState<NavTabType>("queries");
  const filterOperationByType = (operationType: TRPCOperation["type"]) =>
    operations.filter((operation) => operation.type === operationType);
  const filteredOperations: FilteredOperations = {
    queries: filterOperationByType("query"),
    mutations: filterOperationByType("mutation"),
  };

  const messageListener = (message: DevtoolsMessage) => {
    const payload = superjson.parse<TRPCOperation>(message.payload);
    const operationIndex = operations.findIndex(
      (operation) => operation.id === payload.id
    );
    if (operationIndex !== -1) {
      operations[operationIndex] = {
        ...operations[operationIndex],
        ...payload,
      };
      setOperations([...operations]);
    } else {
      setOperations([...operations, payload]);
    }
  };

  useEffect(() => {
    const port = chrome.runtime.connect({ name: "panel" });
    port.postMessage({
      name: "init",
      tabId: chrome.devtools.inspectedWindow.tabId,
    });
    port.onMessage.addListener(messageListener);
    chrome.devtools.panels.create(
      "tRPC",
      "",
      "src/extension/devtools/panel.html"
    );
    return () => {
      port.onMessage.removeListener(messageListener);
    };
  }, [operations]);

  return (
    <div className="text-white bg-neutral-900 h-full flex flex-col md:flex-row">
      <div className="min-w-[306px]">
        <Nav
          queriesCount={filteredOperations.queries.length}
          mutationsCount={filteredOperations.mutations.length}
          onTabChange={(selectedTab) => setCurrentTab(selectedTab)}
        />
        <div className="mt-1 h-72 overflow-y-auto">
          {filteredOperations[currentTab].map((operation) => {
            return (
              <div
                className="p-4 hover:bg-neutral-700"
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
