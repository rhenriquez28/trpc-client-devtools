chrome.devtools.panels.create(
  "tRPC",
  "src/panel-icon-16.png",
  "src/extension/devtools/panel.html",
  (panel) => {
    if (chrome.runtime.lastError) console.error(chrome.runtime.lastError);
    console.log("panel", panel);
  }
);

export {};
