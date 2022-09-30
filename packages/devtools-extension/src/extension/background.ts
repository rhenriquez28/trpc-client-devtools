import { DevtoolsPanelMessage, PortMessage } from "../types";

const tabPorts = new Map<number, chrome.runtime.Port>();
// Receive message from content script and relay to the devTools page for the
// current tab
/*
 * agent -> content-script.js -> **background.js** -> dev tools
 */
chrome.runtime.onMessage.addListener((message: PortMessage, sender) => {
  const port = sender?.tab?.id && tabPorts.get(sender.tab.id);
  if (port) {
    port.postMessage(message);
  }
});

/*
 * agent <- content-script.js <- **background.js** <- dev tools
 */
chrome.runtime.onConnect.addListener((port) => {
  let tabId: number;
  port.onMessage.addListener((message: DevtoolsPanelMessage) => {
    if (
      message.source === "devtoolsPanel" &&
      message.message === "set-tab-id"
    ) {
      if (!tabId) {
        // this is a first message from devtools so let's set the tabId-port mapping
        tabId = message.payload.tabId;
        tabPorts.set(tabId, port);
      }
    }
  });

  port.onDisconnect.addListener(() => {
    tabPorts.delete(tabId);
  });
});
