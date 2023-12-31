import { gmail_v1 } from "googleapis";

import { getGmailClient } from "./auth";
import { decodeEmailMessage, decodeEmailThread } from "./decoder";
import { EmailThread } from "./types";

export async function getThread(threadId: string) {
  const gmail = await getGmailClient();
  return await gmail.users.threads
    .get({
      id: threadId,
      userId: "me",
      format: "full",
    })
    .then((res) => decodeEmailThread(res.data))
    .catch((err) => {
      console.error("Failed to get thread", err);
      return null;
    });
}

export async function getMessage(messageId: string) {
  const gmail = await getGmailClient();
  return await gmail.users.messages
    .get({
      id: messageId,
      userId: "me",
      format: "full",
    })
    .then((res) => decodeEmailMessage(res.data))
    .catch((err) => {
      console.error("Failed to get message", err);
      return null;
    });
}

export async function listInboxThreads(maxThreads: number = 100): Promise<EmailThread[]> {
  const gmail = await getGmailClient();
  let nextPageToken: string | null = null;
  const threads: EmailThread[] = [];

  while (threads.length < maxThreads) {
    const res = await gmail.users.threads
      .list({
        labelIds: ["INBOX"],
        pageToken: nextPageToken ?? undefined,
        maxResults: 20,
        userId: "me",
      })
      .catch((err) => {
        console.error("Failed to list threads", err);
        return null;
      });

    const resThreads = res?.data.threads ?? [];
    const decodedThreads = await Promise.all(
      resThreads.map(async (thread) => {
        if (thread.id) {
          return await getThread(thread.id);
        }
      }),
    ).then((threads) => threads.filter((thread): thread is EmailThread => thread !== undefined));
    threads.push(...decodedThreads);

    nextPageToken = (res?.data.nextPageToken ?? null) as string | null;

    if (nextPageToken === null) {
      break;
    }
  }

  return threads;
}

export async function getUpdates(startHistoryId: string) {
  const gmail = await getGmailClient();

  // TODO: only returns one page of updates
  const res = await gmail.users.history
    .list({
      startHistoryId,
      userId: "me",
    })
    .catch((err) => {
      console.error("Failed to get updates", err);
      return null;
    });

  const history = res?.data.history ?? null;

  return history;
}

export async function modifyThread(id: string, options: gmail_v1.Schema$ModifyThreadRequest) {
  const gmail = await getGmailClient();

  return await gmail.users.threads
    .modify({
      id,
      userId: "me",
      requestBody: options,
    })
    .then(() => getThread(id))
    .catch((err) => {
      console.error("Failed to modify thread", err);
      return null;
    });
}
