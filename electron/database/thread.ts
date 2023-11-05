import { desc, eq } from "drizzle-orm";

import { EmailThread } from "../gmail/types";
import { db } from "./db";
import { insertMessage, updateMessage } from "./message";
import { threads as threadsTable } from "./schema";

export type Thread = typeof threadsTable.$inferSelect;

export function getAllThreads() {
  return db.query.threads.findMany({
    with: { messages: true },
    orderBy: [desc(threadsTable.latestMessageDate)],
  });
}

export function getThreadByServerId(serverId: string) {
  return db.query.threads.findFirst({
    where: eq(threadsTable.serverId, serverId),
  });
}

export function getThreadWithFullMessages(serverId: string) {
  return db.query.threads.findFirst({
    where: eq(threadsTable.serverId, serverId),
    with: {
      messages: {
        with: { messageContents: true },
      },
    },
  });
}

export function insertThread(thread: EmailThread) {
  return db.transaction(async (tx) => {
    const insertedThread = await db
      .insert(threadsTable)
      .values({
        serverId: thread.id,
        historyId: thread.historyId,
        latestMessageDate: thread.messages.at(-1)?.internalDate,
      })
      .returning({ id: threadsTable.id });

    const threadId = insertedThread[0]?.id;

    if (!threadId) {
      tx.rollback();
      return;
    }

    for (const message of thread.messages) {
      await insertMessage(message, threadId);
    }
  });
}

export function updateThread(thread: EmailThread) {
  return db.transaction(async (tx) => {
    if (!thread.id || !thread.historyId) {
      return;
    }

    await db
      .update(threadsTable)
      .set({
        historyId: thread.historyId,
        latestMessageDate: thread.messages.at(-1)?.internalDate,
      })
      .where(eq(threadsTable.serverId, thread.id));

    for (const message of thread.messages) {
      if (!message.id || !message.historyId) {
        tx.rollback();
        return;
      }

      await updateMessage(message);
    }
  });
}
