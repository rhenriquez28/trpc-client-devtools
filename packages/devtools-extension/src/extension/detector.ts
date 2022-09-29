import { DetectorMessage } from "../types";

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
      window.postMessage(
        { source: "detector", message: "trpc-client-found" } as DetectorMessage,
        "*"
      );
    }
  }

  interval = window.setInterval(initializeDevtoolsPanel, 1000);
  initializeDevtoolsPanel();
}

findClient();
