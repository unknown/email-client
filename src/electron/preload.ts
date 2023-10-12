import { contextBridge, ipcRenderer } from "electron";

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    const version = process.versions[dependency];
    if (version) {
      replaceText(`${dependency}-version`, version);
    }
  }
});

contextBridge.exposeInMainWorld("gmail", {
  getLabels: () => ipcRenderer.invoke("get-labels"),
});
