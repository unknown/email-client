import { desc, eq } from "drizzle-orm";

import { EmailThread } from "../gmail/types";
import { db } from "./db";
import { insertMessage } from "./message";
import { threads as threadsTable } from "./schema";

export type Thread = typeof threadsTable.$inferSelect;

export function getAllThreads() {
  return db.query.threads.findMany({
    with: { messages: true },
    orderBy: [desc(threadsTable.historyId)],
  });
}

export function getThreadByServerId(serverId: string) {
  return db.query.threads.findFirst({
    where: eq(threadsTable.serverId, serverId),
  });
}

export async function getThreadWithFullMessages(threadId: string) {
  return db.query.threads.findFirst({
    where: eq(threadsTable.serverId, threadId),
    with: {
      messages: {
        with: { messageContents: true },
      },
    },
  });
}

export async function insertThread(thread: EmailThread) {
  return db.transaction(async (tx) => {
    const insertedThread = await db
      .insert(threadsTable)
      .values({
        serverId: thread.id,
        historyId: thread.historyId,
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
