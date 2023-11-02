import { eq } from "drizzle-orm";

import { EmailThread } from "../gmail/types";
import { db } from "./db";
import { insertMessageContentRecords, insertMessageRecords } from "./message";
import { threads as threadsTable } from "./schema";

export type Thread = typeof threadsTable.$inferSelect;

export function getAllThreads() {
  return db.query.threads.findMany({
    with: { messages: true },
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

export async function insertThreadRecord(thread: EmailThread) {
  if (!thread.id) {
    return null;
  }

  const insertedThread = await db
    .insert(threadsTable)
    .values({ serverId: thread.id })
    .returning({ insertedId: threadsTable.id });

  return insertedThread[0]?.insertedId ?? null;
}

export async function insertThread(thread: EmailThread) {
  return db.transaction(async (tx) => {
    const insertedThreadId = await insertThreadRecord(thread);
    if (insertedThreadId === null) {
      tx.rollback();
      return;
    }

    const messagesWithIds = await insertMessageRecords(thread.messages, insertedThreadId);
    if (messagesWithIds === null) {
      tx.rollback();
      return;
    }

    await insertMessageContentRecords(messagesWithIds);
  });
}
