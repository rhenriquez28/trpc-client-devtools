import { DetectorMessage, DevtoolsMessage } from "../types";

function initializeDetector() {
  let isClientPresent = false;

  /**
   * Attempt to find the client on a 1-second interval for 10 seconds max
   */
  function findClient() {
    let interval: number;
    let count = 0;

    function initializeDevtoolsPanel() {
      if (count++ > 10) {
        clearInterval(interval);
      }
      if ((window as any).__TRPC_CLIENT_HOOK__) {
        clearInterval(interval);
        isClientPresent = true;
        sendClientFoundMessage();
      }
    }

    interval = window.setInterval(initializeDevtoolsPanel, 1000);
    initializeDevtoolsPanel();
  }

  window.addEventListener("message", (event: MessageEvent<DevtoolsMessage>) => {
    if (
      event.data.source === "devtools" &&
      event.data.message === "devtools-initialized"
    ) {
      if (isClientPresent) {
        sendClientFoundMessage();
      } else {
        findClient();
      }
    }
  });

  function sendClientFoundMessage() {
    window.postMessage(
      {
        source: "detector",
        message: "trpc-client-found",
      } as DetectorMessage,
      "*"
    );
  }

  findClient();
}

initializeDetector();
