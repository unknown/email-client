import path from "node:path";
import electron, { app, BrowserWindow, ipcMain, shell } from "electron";

import * as client from "./gmail/client";

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    // TODO: fix this
    win.loadFile(path.join(__dirname, "../index.html"));
  }

  // open all external URL links in user browser
  win.webContents.on("will-navigate", (event) => {
    if (event.initiator?.url === event.url) {
      return;
    }
    event.preventDefault();
    shell.openExternal(event.url);
  });
}

app.whenReady().then(() => {
  ipcMain.handle("gmail/list-inbox", function ipcListInbox() {
    return client.listThreads();
  });
  ipcMain.handle("gmail/get-thread", function ipcGetThread(_, id) {
    return client.getThread(id);
  });
  ipcMain.handle("gmail/modify-thread", function ipcModifyThread(_, id, options) {
    return client.modifyThread(id, options);
  });
  ipcMain.handle("gmail/sync", function ipcSync() {
    return client.sync();
  });
  ipcMain.handle("browser/open-url", function ipcOpenUrl(_, url) {
    return electron.shell.openExternal(url);
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
