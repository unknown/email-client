import { getAllThreads, getThreadWithFullMessages, insertThread } from "../database/thread";
import * as api from "./api";
import { EmailThread } from "./types";

async function fullSync() {
  const threads = await api.listInboxThreads(20);
  for (const thread of threads) {
    await insertThread(thread);
  }
  return threads;
}

export async function listThreads(): Promise<EmailThread[]> {
  const savedThreads: EmailThread[] = (await getAllThreads()).map((thread) => ({
    id: thread.serverId,
    historyId: null,
    // TODO fix these messages
    messages: thread.messages.map((message) => ({
      id: message.serverId,
      historyId: null,
      internalDate: null,
      labelIds: null,
      decodedPayload: {
        html: message.messageContents.bodyHtml,
        text: message.messageContents.bodyText,
        headers: {
          From: message.from,
          To: message.to,
          Subject: message.subject,
        },
      },
      snippet: thread.messages.at(-1)?.snippet ?? null,
      threadId: thread.serverId,
    })),
  }));

  if (savedThreads.length === 0) {
    return await fullSync();
  }

  // TODO: implement partial sync

  return savedThreads;
}

export async function getMessageContents(threadId: string): Promise<EmailThread | null> {
  const thread = await getThreadWithFullMessages(threadId);

  if (!thread) {
    return null;
  }

  return {
    id: thread.serverId,
    historyId: null,
    // TODO fix these messages
    messages: thread.messages.map((message) => ({
      id: message.serverId,
      historyId: null,
      internalDate: null,
      labelIds: null,
      decodedPayload: {
        html: message.messageContents.bodyHtml,
        text: message.messageContents.bodyText,
        headers: {},
      },
      snippet: thread.messages.at(-1)?.snippet ?? null,
      threadId: thread.serverId,
    })),
  };
}
