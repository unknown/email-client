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

interface SavedInbox {
  lastUpdated: number;
  threads: EmailThread[];
}

async function loadSavedInboxIfExist() {
  try {
    // TODO: better type-checking
    const content = await fs.readFile(INBOX_PATH, { encoding: "utf-8" });
    const inbox = JSON.parse(content) as SavedInbox;
    return inbox;
  } catch (err) {
    return null;
  }
}

async function saveInbox(inbox: SavedInbox) {
  const payload = JSON.stringify(inbox, null, 2);
  await fs.writeFile(INBOX_PATH, payload);
}

export async function listInbox() {
  const savedInbox = await loadSavedInboxIfExist();
  const isFirstSync = savedInbox === null;
  const threads = savedInbox?.threads ?? [];

  const gmail = await getGmailClient();
  let nextPageToken: string | null = null;
  const afterEpochSeconds = savedInbox?.lastUpdated ?? null;
  const beforeEpochSeconds = Math.ceil(Date.now() / 1000);
  const query = `${
    afterEpochSeconds ? `after:${afterEpochSeconds}` : ""
  } before:${beforeEpochSeconds}`;

  do {
    const res = await gmail.users.threads.list({
      labelIds: ["INBOX"],
      pageToken: nextPageToken ?? undefined,
      q: query ?? undefined,
      maxResults: 20,
      userId: "me",
    });

    const newThreads = res.data.threads ?? [];
    const decodedThreads = await Promise.all(
      newThreads.map(async ({ id }) => {
        if (id) {
          const thread = await getThread(id);
          return decodeEmailThread(thread);
        }
      }),
    );
    decodedThreads.forEach((thread) => thread !== undefined && threads.push(thread));

    nextPageToken = (res.data.nextPageToken ?? null) as string | null;
  } while (nextPageToken !== null && (!isFirstSync || threads.length < 20));

  threads.sort((a, b) => {
    const id1 = parseInt(a.historyId ?? "");
    const id2 = parseInt(b.historyId ?? "");
    return id2 - id1;
  });

  const threadIds = new Set();
  const uniqueThreads = threads.filter((thread) => {
    if (threadIds.has(thread.id)) {
      return false;
    }
    threadIds.add(thread.id);
    return true;
  });

  saveInbox({
    lastUpdated: beforeEpochSeconds,
    threads: uniqueThreads,
  });
  return uniqueThreads;
}
