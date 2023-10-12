import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("gmail", {
  getLabels: () => ipcRenderer.invoke("gmail/get-labels"),
  getThreads: (labelIds: string[]) => ipcRenderer.invoke("gmail/get-threads", labelIds),
});
