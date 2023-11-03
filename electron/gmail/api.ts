import { gmail_v1 } from "googleapis";

import { getGmailClient } from "./auth";
import { decodeEmailThread } from "./decoder";
import { EmailThread } from "./types";

async function getThread(id: string) {
  const gmail = await getGmailClient();
  const res = await gmail.users.threads.get({
    id,
    userId: "me",
    format: "full",
  });
  return decodeEmailThread(res.data);
}

export async function listInboxThreads(maxThreads: number = 100): Promise<EmailThread[]> {
  const gmail = await getGmailClient();
  let nextPageToken: string | null = null;
  const threads: EmailThread[] = [];

  while (threads.length < maxThreads) {
    const res = await gmail.users.threads.list({
      labelIds: ["INBOX"],
      pageToken: nextPageToken ?? undefined,
      maxResults: 20,
      userId: "me",
    });

    const resThreads = res.data.threads ?? [];
    const decodedThreads = await Promise.all(
      resThreads.map(async (thread) => {
        if (thread.id) {
          return await getThread(thread.id);
        }
      }),
    ).then((threads) => threads.filter((thread): thread is EmailThread => thread !== undefined));
    threads.push(...decodedThreads);

    nextPageToken = (res.data.nextPageToken ?? null) as string | null;

    if (nextPageToken === null) {
      break;
    }
  }

  return threads;
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
