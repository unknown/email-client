import { contextBridge, ipcRenderer } from "electron";

import { IBrowserAPI, IGmailAPI } from "./renderer";

const gmailApi: IGmailAPI = {
  listInbox: () => ipcRenderer.invoke("gmail/list-inbox"),
  getThread: (id: string) => ipcRenderer.invoke("gmail/get-thread", id),
};
contextBridge.exposeInMainWorld("gmail", gmailApi);

const browserApi: IBrowserAPI = {
  openUrl: (url: string) => ipcRenderer.invoke("browser/open-url", url),
};
contextBridge.exposeInMainWorld("browser", browserApi);
