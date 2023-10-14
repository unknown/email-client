import { contextBridge, ipcRenderer } from "electron";

import { IGmailAPI } from "./renderer";

const gmailAPI: IGmailAPI = {
  listLabels: () => ipcRenderer.invoke("gmail/list-labels"),
  listThreads: (labelIds: string[]) => ipcRenderer.invoke("gmail/list-threads", labelIds),
  getThread: (id: string) => ipcRenderer.invoke("gmail/get-thread", id),
};

contextBridge.exposeInMainWorld("gmail", gmailAPI);
