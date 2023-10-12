interface Window {
  gmail: {
    getLabels: () => Promise<import("googleapis").gmail_v1.Schema$Label[] | undefined>;
    getThreads: (
      labelIds: string[],
    ) => Promise<import("googleapis").gmail_v1.Schema$Thread[] | undefined>;
  };
}
