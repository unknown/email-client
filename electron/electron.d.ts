interface Window {
  gmail: {
    listLabels: () => Promise<import("googleapis").gmail_v1.Schema$Label[] | undefined>;
    listThreads: (
      labelIds: string[],
    ) => Promise<import("googleapis").gmail_v1.Schema$Thread[] | undefined>;
    getThread: (id: string) => Promise<import("googleapis").gmail_v1.Schema$Thread | undefined>;
  };
}
