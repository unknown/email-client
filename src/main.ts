import path from "node:path";
import { app, BrowserWindow, ipcMain } from "electron";

import { authorize, createGmailClient, listLabels } from "./utils/gmail";

async function getLabels() {
  return authorize().then(createGmailClient).then(listLabels).catch(console.error);
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(__dirname, "../../index.html"));
};

app.whenReady().then(() => {
  ipcMain.handle("get-labels", getLabels);

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
