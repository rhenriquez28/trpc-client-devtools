import { ContentScriptMessage, DevtoolsMessage, PortMessage } from "../types";

interface TabPorts {
  devtools?: chrome.runtime.Port;
  panel?: chrome.runtime.Port;
}
const tabPorts = new Map<number, TabPorts>();

const isMessageFromContentScript = (
  message: PortMessage
): message is ContentScriptMessage => message.source === "contentScript";

// Receive message from content script and relay to the devTools page for the
// current tab
/*
 * agent -> content-script.js -> **background.js** -> dev tools
 */
chrome.runtime.onMessage.addListener((message: PortMessage, sender) => {
  let ports: TabPorts | undefined;
  if (sender?.tab?.id) {
    ports = tabPorts.get(sender.tab.id);
    if (isMessageFromContentScript(message)) {
      ports?.devtools?.postMessage(message);
      return;
    }
    ports?.panel?.postMessage(message);
  }
});

/*
 * agent <- content-script.js <- **background.js** <- dev tools
 */
chrome.runtime.onConnect.addListener((port) => {
  let tabId: number;
  port.onMessage.addListener((message: DevtoolsMessage) => {
    if (message.message === "set-port") {
      if (!tabId) {
        tabId = message.payload!.tabId;
      }
      if (tabPorts.has(tabId)) {
        tabPorts.set(tabId, { ...tabPorts.get(tabId), [message.source]: port });
        return;
      }
      tabPorts.set(tabId, { [message.source]: port });
      return;
    }

    if (message.source === "devtools" && tabPorts.has(tabId)) {
      chrome.tabs.sendMessage(tabId, message);
    }
  });

  port.onDisconnect.addListener(() => {
    tabPorts.delete(tabId);
  });
});
