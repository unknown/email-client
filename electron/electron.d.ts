interface Window {
  gmail: {
    getLabels: () => Promise<string[] | undefined>;
  };
}
