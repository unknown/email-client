import { desc, eq } from "drizzle-orm";

import { EmailMessage } from "../gmail/types";
import { db } from "./db";
import { messageContents as messageContentsTable, messages as messagesTable } from "./schema";

export type Message = typeof messagesTable.$inferSelect;

export function getAllMessages() {
  return db.select().from(messagesTable).all();
}

export function getMostRecentMessage() {
  return db.query.messages.findFirst({
    orderBy: [desc(messagesTable.historyId)],
  });
}

function getLabels(labelIds: string[]) {
  return {
    isUnread: labelIds.includes("UNREAD"),
  };
}

export function insertMessage(message: EmailMessage, threadId: number) {
  return db.transaction(async (tx) => {
    const insertedMessage = await db
      .insert(messagesTable)
      .values({
        threadId,
        historyId: message.historyId,
        serverId: message.id,
        internalDate: message.internalDate,
        from: message.decodedPayload.headers["From"],
        to: message.decodedPayload.headers["To"],
        subject: message.decodedPayload.headers["Subject"],
        snippet: message.snippet,
        ...getLabels(message.labelIds ?? []),
      })
      .returning({ id: messagesTable.id });

    const messageId = insertedMessage[0]?.id;
    if (!messageId) {
      tx.rollback();
      return;
    }

    await db.insert(messageContentsTable).values({
      messageId,
      bodyHtml: message.decodedPayload.html,
      bodyText: message.decodedPayload.text,
    });
  });
}

export function updateMessage(message: EmailMessage) {
  if (!message.id || !message.historyId) {
    return;
  }

  return db
    .update(messagesTable)
    .set({ historyId: message.historyId, isUnread: message.labelIds?.includes("UNREAD") })
    .where(eq(messagesTable.serverId, message.id));
}

export function updateMessageLabels(serverId: string, labelIds: string[]) {
  return db
    .update(messagesTable)
    .set(getLabels(labelIds))
    .where(eq(messagesTable.serverId, serverId));
}

export function addMessageLabels(serverId: string, labelIds: string[]) {
  const labels = getLabels(labelIds);

  const filtered: Partial<typeof labels> = {};
  for (const [key, value] of Object.entries(labels)) {
    if (value) {
      filtered[key as keyof typeof labels] = true;
    }
  }

  return db.update(messagesTable).set(filtered).where(eq(messagesTable.serverId, serverId));
}

export function removeMessageLabels(serverId: string, labelIds: string[]) {
  const labels = getLabels(labelIds);

  const filtered: Partial<typeof labels> = {};
  for (const [key, value] of Object.entries(labels)) {
    if (!value) {
      filtered[key as keyof typeof labels] = false;
    }
  }

  return db.update(messagesTable).set(filtered).where(eq(messagesTable.serverId, serverId));
}
