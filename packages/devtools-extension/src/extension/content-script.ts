/*
 * devtoolsLink -> **content-script.js** -> background.js -> dev tools
 */
window.addEventListener("message", (event) => {
  // Only accept messages from the same frame
  if (event.source !== window) {
    return;
  }

  var message = event.data;

  // Only accept messages that we know are ours
  if (
    typeof message !== "object" ||
    message === null ||
    message.source !== "trpcDevtoolsLink"
  ) {
    return;
  }

  if (chrome.runtime && !!chrome.runtime.getManifest()) {
    chrome.runtime.sendMessage(message);
  } else {
    console.log(
      "Cannot send the message because of the Chrome Runtime manifest not available"
    );
  }
});
