import fs from "fs/promises";
import { gmail_v1 } from "googleapis";
import path from "node:path";

import { getGmailClient } from "./auth";
import { decodeEmailThread } from "./decoder";
import { EmailThread } from "./types";

const INBOX_PATH = path.join(process.cwd(), "inbox.json");

export async function getThread(id: string) {
  const gmail = await getGmailClient();
  const res = await gmail.users.threads.get({
    id,
    userId: "me",
    format: "full",
  });
  return decodeEmailThread(res.data);
}

export async function modifyThread(
  id: string,
  options: gmail_v1.Schema$ModifyThreadRequest,
): Promise<EmailThread> {
  const gmail = await getGmailClient();
  await gmail.users.threads.modify({
    id,
    userId: "me",
    requestBody: options,
  });
  // TODO: save this
  return getThread(id);
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
          return await getThread(id);
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
