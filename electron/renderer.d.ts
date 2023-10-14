type Schema$Thread = import("googleapis").gmail_v1.Schema$Thread;

export interface IGmailAPI {
  listInbox: () => Promise<Schema$Thread[]>;
  getThread: (id: string) => Promise<Schema$Thread | undefined>;
}

declare global {
  interface Window {
    gmail: IGmailAPI;
  }
}
