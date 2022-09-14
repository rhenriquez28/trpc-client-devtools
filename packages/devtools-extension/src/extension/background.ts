let tabPorts: { [tabId: string]: chrome.runtime.Port } = {};
// Receive message from content script and relay to the devTools page for the
// current tab
/*
 * agent -> content-script.js -> **background.js** -> dev tools
 */
chrome.runtime.onMessage.addListener((message, sender) => {
  console.log("background->message", message);
  const port =
    sender.tab && sender.tab.id !== undefined && tabPorts[sender.tab.id];
  if (port) {
    console.log("background->port", port);
    port.postMessage(message);
  } else {
  }
  return true;
});

/*
 * agent <- content-script.js <- **background.js** <- dev tools
 */
chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
  let tabId: any;
  port.onMessage.addListener((message) => {
    if (message.name === "init") {
      if (!tabId) {
        // this is a first message from devtools so let's set the tabId-port mapping
        tabId = message.tabId;
        tabPorts[tabId] = port;
      }
    }
    if (message.name && message.name === "action" && message.data) {
      var conn = tabPorts[tabId];
      if (conn) {
        console.log("background->contentScript", message);
        chrome.tabs.sendMessage(tabId, message);
      }
    }
  });

  port.onDisconnect.addListener(() => {
    delete tabPorts[tabId];
  });
});
