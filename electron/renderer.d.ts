type Schema$Thread = import("googleapis").gmail_v1.Schema$Thread;
type EmailThread = import("./gmail/types").EmailThread;

export interface IGmailAPI {
  listInbox: () => Promise<EmailThread[]>;
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
