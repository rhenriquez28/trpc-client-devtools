import {
  ContentScriptMessage,
  DetectorMessage,
  DevtoolsPanelMessage,
  LinkMessage,
} from "../types";
import detector from "./detector?script&module";

let isPanelCreated = false;

/*
 * devtoolsLink -> **content-script.js** -> background.js -> dev tools
 */
window.addEventListener(
  "message",
  (event: MessageEvent<DetectorMessage | LinkMessage>) => {
    if (
      event.data.source === "detector" &&
      event.data.message === "trpc-client-found"
    ) {
      createPanel();
      return;
    }
    const isMessageNotFromCurrentTab = event.source !== window;
    const isMessageNotFromDevtoolsLink =
      typeof event.data !== "object" ||
      event.data === null ||
      event.data.source !== "trpcDevtoolsLink";

    if (isMessageNotFromCurrentTab || isMessageNotFromDevtoolsLink) {
      return;
    }

    if (chrome.runtime && !!chrome.runtime.getManifest()) {
      chrome.runtime.sendMessage(event.data);
    } else {
      console.log(
        "Cannot send the message because of the Chrome Runtime manifest not available"
      );
    }
  }
);

if (typeof document === "object" && document instanceof Document) {
  const script = document.createElement("script");
  script.setAttribute("type", "module");
  script.setAttribute("src", chrome.runtime.getURL(detector));
  const head =
    document.head ||
    document.getElementsByTagName("head")[0] ||
    document.documentElement;
  head.insertBefore(script, head.lastChild);
}

function createPanel() {
  let interval: number;

  function sendCreatePanelMessage() {
    if (isPanelCreated) {
      clearInterval(interval);
      return;
    }
    chrome.runtime.sendMessage({
      source: "contentScript",
      message: "create-devtools-panel",
    } as ContentScriptMessage);
  }

  interval = window.setInterval(sendCreatePanelMessage, 1000);
  sendCreatePanelMessage();
}

/*
 * agent <- **content-script.js** <- background.js <- dev tools
 */
chrome.runtime.onMessage.addListener((message: DevtoolsPanelMessage) => {
  isPanelCreated =
    message.source === "devtoolsPanel" &&
    message.message === "devtools-panel-created";
});
