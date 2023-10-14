import path from "node:path";
import { app, BrowserWindow, ipcMain } from "electron";

import { getGmailClient, getThread, listLabels, listThreads } from "./utils/gmail";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    // TODO: fix this
    win.loadFile(path.join(__dirname, "../index.html"));
  }
};

app.whenReady().then(() => {
  ipcMain.handle("gmail/list-labels", async function ipcListLabels() {
    return getGmailClient().then(listLabels).catch(console.error);
  });
  ipcMain.handle("gmail/list-threads", async function ipcListThreads(_, labelIds) {
    return getGmailClient()
      .then((client) => listThreads(client, labelIds))
      .catch(console.error);
  });
  ipcMain.handle("gmail/get-thread", async function ipcGetThread(_, id) {
    return getGmailClient()
      .then((client) => getThread(client, id))
      .catch(console.error);
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
