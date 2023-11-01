import path from "node:path";
import electron, { app, BrowserWindow, ipcMain, shell } from "electron";

import { getThread, listInbox, modifyThread } from "./gmail/api";

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

  // open all external URL links in user browser
  win.webContents.on("will-navigate", (event) => {
    if (event.initiator?.url === event.url) {
      return;
    }
    event.preventDefault();
    shell.openExternal(event.url);
  });
};

app.whenReady().then(() => {
  ipcMain.handle("gmail/list-inbox", async function ipcListInbox() {
    return listInbox().catch(console.error);
  });
  ipcMain.handle("gmail/get-thread", async function ipcGetThread(_, id) {
    return getThread(id).catch(console.error);
  });
  ipcMain.handle("gmail/modify-thread", async function ipcModifyThread(_, id, options) {
    return modifyThread(id, options).catch(console.error);
  });
  ipcMain.handle("browser/open-url", async function ipcOpenUrl(_, url) {
    electron.shell.openExternal(url);
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
