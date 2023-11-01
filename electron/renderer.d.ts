export interface IGmailAPI {
  listInbox: () => Promise<import("./gmail/types").EmailThread[] | void>;
  getThread: (id: string) => Promise<import("./gmail/types").EmailThread | void>;
  modifyThread: (
    id: string,
    options: import("googleapis").gmail_v1.Schema$ModifyThreadRequest,
  ) => Promise<import("./gmail/types").EmailThread | void>;
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
