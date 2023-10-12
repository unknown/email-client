import path from "node:path";
import { app, BrowserWindow, ipcMain } from "electron";
import { gmail_v1 } from "googleapis";

import { authorize, createGmailClient, listLabels, listThreads } from "./utils/gmail";

let _gmailClient: gmail_v1.Gmail;

async function getGmailClient() {
  if (!_gmailClient) {
    _gmailClient = await authorize().then(createGmailClient);
  }
  return _gmailClient;
}

async function getLabels() {
  return getGmailClient().then(listLabels).catch(console.error);
}

async function getThreads(labelIds: string[]) {
  return getGmailClient()
    .then((client) => listThreads(client, labelIds))
    .catch(console.error);
}

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
  ipcMain.handle("gmail/get-labels", getLabels);
  ipcMain.handle("gmail/get-threads", async (_, ...args) => {
    return getThreads(args);
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
