import fs from "fs/promises";
import path from "node:path";

import { getGmailClient } from "./auth";
import { decodeEmailThread } from "./decoder";
import { EmailThread } from "./types";

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
    const threads = JSON.parse(content).threads as EmailThread[];
    return threads;
  } catch (err) {
    return null;
  }
}

async function saveInbox(threads: EmailThread[]) {
  const payload = JSON.stringify({ threads }, null, 2);
  await fs.writeFile(INBOX_PATH, payload);
}

export async function listInbox() {
  const savedThreads = await loadSavedInboxIfExist();
  if (savedThreads) {
    return savedThreads;
  }

  const gmail = await getGmailClient();
  const threads: EmailThread[] = [];
  let nextPageToken: string | null;

  do {
    const res = await gmail.users.threads.list({
      labelIds: ["INBOX"],
      maxResults: 20,
      userId: "me",
    });
    res.data.threads?.forEach(async ({ id }) => {
      if (id) {
        const thread = await getThread(id);
        threads.push(decodeEmailThread(thread));
      }
    });
    nextPageToken = res.data.nextPageToken ?? null;
    console.log(threads.length);
  } while (nextPageToken !== null && threads.length < 20);

  saveInbox(threads);
  return threads;
}
