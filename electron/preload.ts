import { contextBridge, ipcRenderer } from "electron";

import { IBrowserAPI, IGmailAPI } from "./renderer";
import { gmail_v1 } from "googleapis";

const gmailApi: IGmailAPI = {
  listInbox: () => ipcRenderer.invoke("gmail/list-inbox"),
  getThread: (id: string) => ipcRenderer.invoke("gmail/get-thread", id),
  modifyThread: (id: string, options: gmail_v1.Schema$ModifyThreadRequest) =>
    ipcRenderer.invoke("gmail/modify-thread", id, options),
};
contextBridge.exposeInMainWorld("gmail", gmailApi);

const browserApi: IBrowserAPI = {
  openUrl: (url: string) => ipcRenderer.invoke("browser/open-url", url),
};
contextBridge.exposeInMainWorld("browser", browserApi);
