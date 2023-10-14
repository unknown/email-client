import fs from "fs/promises";
import path from "node:path";
import { gmail_v1 } from "googleapis";

import { getGmailClient } from "./auth";

const INBOX_PATH = path.join(process.cwd(), "inbox.json");

export async function listLabels() {
  const gmail = await getGmailClient();
  const res = await gmail.users.labels.list({
    userId: "me",
  });
  return res.data.labels;
}

export async function listThreads(labelIds: string[]) {
  const gmail = await getGmailClient();
  const res = await gmail.users.threads.list({
    labelIds,
    userId: "me",
    maxResults: 5,
  });
  return res.data.threads;
}

export async function getThread(id: string) {
  const gmail = await getGmailClient();
  const res = await gmail.users.threads.get({
    id,
    userId: "me",
    format: "full",
  });
  return res.data;
}

async function loadSavedInboxIfExist() {
  try {
    // TODO: better type-checking
    const content = await fs.readFile(INBOX_PATH, { encoding: "utf-8" });
    const threads = JSON.parse(content).threads as gmail_v1.Schema$Thread[];
    return threads;
  } catch (err) {
    return null;
  }
}

async function saveInbox(threads: gmail_v1.Schema$Thread[]) {
  const payload = JSON.stringify({ threads }, null, 2);
  await fs.writeFile(INBOX_PATH, payload);
}

export async function listInbox() {
  let threads: gmail_v1.Schema$Thread[] | null = await loadSavedInboxIfExist();
  if (threads) {
    return threads;
  }

  const gmail = await getGmailClient();
  threads = [];
  let nextPageToken: string | null;

  do {
    const res = await gmail.users.threads.list({
      labelIds: ["INBOX"],
      userId: "me",
    });
    threads.push(...(res.data.threads ?? []));
    nextPageToken = res.data.nextPageToken ?? null;
    console.log(threads.length);
  } while (nextPageToken !== null && threads.length < 100);

  saveInbox(threads);
  return threads;
}
