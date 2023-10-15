export interface IGmailAPI {
  listInbox: () => Promise<import("./gmail/types").EmailThread[]>;
  getThread: (id: string) => Promise<import("googleapis").gmail_v1.Schema$Thread | undefined>;
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
