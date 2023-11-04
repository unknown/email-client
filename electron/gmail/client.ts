import { getMostRecentMessage, insertMessage } from "../database/message";
import {
  getAllThreads,
  getThreadByServerId,
  getThreadWithFullMessages,
  insertThread,
} from "../database/thread";
import * as api from "./api";
import { EmailThread } from "./types";

async function fullSync() {
  // TODO: make this a generator function
  const threads = await api.listInboxThreads(20);
  for (const thread of threads) {
    await insertThread(thread);
  }
}

async function partialSync() {
  // TODO: use a different heuristic than the most recent message
  // this is fine for now, because all our operations are idempotent
  const mostRecentMessage = await getMostRecentMessage();

  if (!mostRecentMessage?.historyId) {
    return false;
  }

  const { messagesAdded } = await api.getUpdates(mostRecentMessage.historyId);
  for (const message of messagesAdded) {
    if (!message.threadId) {
      console.warn("message.threadId is null");
      continue;
    }

    const thread = await getThreadByServerId(message.threadId);

    if (!thread) {
      const newThread = await api.getThread(message.threadId);
      await insertThread(newThread);
      continue;
    }

    await insertMessage(message, thread.id);
  }

  return true;
}

export async function listThreads(): Promise<EmailThread[] | null> {
  // TODO: sync after returning original threads
  const didPartialSync = await partialSync().catch((err) => {
    console.error("Partial sync failed", err);
    return false;
  });

  if (!didPartialSync) {
    await fullSync().catch((err) => {
      console.error("Full sync failed", err);
    });
  }

  const threads = await getAllThreads().catch((err) => {
    console.error("Failed to get all threads", err);
    return null;
  });

  if (!threads) {
    return null;
  }

  const savedThreads: EmailThread[] = threads.map((thread) => ({
    id: thread.serverId,
    historyId: thread.historyId,
    messages: thread.messages.map((message) => ({
      id: message.serverId,
      historyId: message.historyId,
      internalDate: message.internalDate,
      labelIds: [message.isUnread && "UNREAD"].filter(
        (label): label is string => typeof label === "string",
      ),
      decodedPayload: {
        html: null,
        text: null,
        headers: {
          From: message.from,
          To: message.to,
          Subject: message.subject,
        },
      },
      snippet: message.snippet,
      threadId: thread.serverId,
    })),
  }));

  return savedThreads;
}

export async function getThread(threadId: string): Promise<EmailThread | null> {
  const thread = await getThreadWithFullMessages(threadId).catch((err) => {
    console.error("Failed to get thread", err);
    return null;
  });

  if (!thread) {
    return null;
  }

  // TODO: dedupe this code
  return {
    id: thread.serverId,
    historyId: null,
    messages: thread.messages.map((message) => ({
      id: message.serverId,
      historyId: message.historyId,
      internalDate: message.internalDate,
      labelIds: [message.isUnread && "UNREAD"].filter(
        (label): label is string => typeof label === "string",
      ),
      decodedPayload: {
        html: message.messageContents.bodyHtml,
        text: message.messageContents.bodyText,
        headers: {
          From: message.from,
          To: message.to,
          Subject: message.subject,
        },
      },
      snippet: message.snippet,
      threadId: thread.serverId,
    })),
  };
}
