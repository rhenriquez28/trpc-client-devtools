import type { Operation, OperationResponse } from "@trpc/client";
import type { AnyRouter } from "@trpc/server";
import { useEffect, useState } from "react";
import { JSONTree } from "react-json-tree";
import superjson from "superjson";
import Nav from "./components/Nav";
import "./PanelApp.css";

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

function App() {
  const [operations, setOperations] = useState<TRPCOperation[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<TRPCOperation | undefined>(
    undefined
  );

  const queryOperations = operations.filter((operation) => {
    return operation.type === "query";
  });

  const messageListener = (message: DevtoolsMessage) => {
    const payload = superjson.parse<TRPCOperation>(message.payload);
    const operationIndex = operations.findIndex((operation) => {
      return operation.id === payload.id;
    });
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
      "src/panel-icon-16.png",
      "src/extension/devtools/panel.html"
    );
    return () => {
      port.onMessage.removeListener(messageListener);
    };
  }, [operations]);

  return (
    <div className="text-white bg-neutral-900 h-full">
      <div className="flex flex-col md:flex-row">
        <div className="explorer">
          <Nav queriesCount={queryOperations.length} mutationsCount={0} />
          <div className="mt-1 h-96 overflow-y-auto">
            {queryOperations.map((query) => {
              return (
                <div
                  className="p-4 hover:bg-neutral-700"
                  onClick={() => setSelectedQuery(query)}
                >
                  {query.path}
                </div>
              );
            })}
          </div>
        </div>
        <div className="viewer min-h-[50vh]">
          <div>Query</div>
          <JSONTree data={selectedQuery?.input} theme={treeTheme} />
          <div>Result</div>
          <JSONTree data={selectedQuery?.result} theme={treeTheme} />
        </div>
      </div>
    </div>
  );
}

export default App;
