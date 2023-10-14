type Schema$Label = import("googleapis").gmail_v1.Schema$Label;
type Schema$Thread = import("googleapis").gmail_v1.Schema$Thread;

export interface IGmailAPI {
  listLabels: () => Promise<Schema$Label[] | undefined>;
  listThreads: (labelIds: string[]) => Promise<Schema$Thread[] | undefined>;
  getThread: (id: string) => Promise<Schema$Thread | undefined>;
}

declare global {
  interface Window {
    gmail: IGmailAPI;
  }
}
