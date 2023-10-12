import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("gmail", {
  getLabels: () => ipcRenderer.invoke("get-labels"),
});
