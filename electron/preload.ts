import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("gmail", {
  listLabels: () => ipcRenderer.invoke("gmail/list-labels"),
  listThreads: (labelIds: string[]) => ipcRenderer.invoke("gmail/list-threads", labelIds),
});
