import { getAllThreads, getThreadWithFullMessages } from "../database/thread";
import { EmailThread } from "./types";

export async function listInboxThreads(): Promise<EmailThread[]> {
  const threads = await getAllThreads();

  return threads.map((thread) => ({
    id: thread.serverId,
    historyId: null,
    // TODO fix these messages
    messages: thread.messages.map((message) => ({
      id: message.serverId,
      historyId: null,
      internalDate: null,
      labelIds: null,
      decodedPayload: {
        html: null,
        text: null,
        headers: {},
      },
      snippet: thread.messages.at(-1)?.snippet ?? null,
      threadId: thread.serverId,
    })),
  }));
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
