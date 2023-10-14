type Schema$Thread = import("googleapis").gmail_v1.Schema$Thread;

export interface IGmailAPI {
  listInbox: () => Promise<Schema$Thread[]>;
  getThread: (id: string) => Promise<Schema$Thread | undefined>;
}

export interface IBrowserAPI {
  openUrl: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    gmail: IGmailAPI;
    browser: IBrowserAPI;
  }
}
