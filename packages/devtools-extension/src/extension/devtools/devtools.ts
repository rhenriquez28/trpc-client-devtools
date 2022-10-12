import { ContentScriptMessage, DevtoolsMessage } from "../../types";

let isPanelCreated = false;

const port = chrome.runtime.connect({ name: "devtools" });

port.postMessage({
  source: "devtools",
  message: "set-port",
  payload: { tabId: chrome.devtools.inspectedWindow.tabId },
} as DevtoolsMessage);

port.postMessage({
  source: "devtools",
  message: "devtools-initialized",
} as DevtoolsMessage);

port.onMessage.addListener((message: ContentScriptMessage) => {
  if (message.message === "create-devtools-panel" && !isPanelCreated) {
    chrome.devtools.panels.create(
      "tRPC",
      "",
      "/src/extension/devtools/panel.html",
      () => {
        isPanelCreated = true;
        port.postMessage({
          source: "devtools",
          message: "devtools-panel-created",
        } as DevtoolsMessage);
      }
    );
  }
});

export {};
