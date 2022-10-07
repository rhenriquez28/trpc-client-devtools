export interface ContentScriptMessage {
  source: "contentScript";
  message: "create-devtools-panel";
}

export interface DetectorMessage {
  source: "detector";
  message: "trpc-client-found";
}

export interface DevtoolsPanelMessage {
  source: "devtoolsPanel";
  message: "set-tab-id" | "devtools-panel-created";
  payload?: {
    tabId: number;
  };
}

export interface LinkMessage {
  source: "trpcDevtoolsLink";
  payload: string;
}

export type PortMessage = LinkMessage | ContentScriptMessage;
