import { contextBridge, ipcRenderer } from "electron";

import { IGmailAPI } from "./renderer";

const gmailAPI: IGmailAPI = {
  listInbox: () => ipcRenderer.invoke("gmail/list-inbox"),
  getThread: (id: string) => ipcRenderer.invoke("gmail/get-thread", id),
};

contextBridge.exposeInMainWorld("gmail", gmailAPI);
