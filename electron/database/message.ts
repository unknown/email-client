import { EmailMessage } from "../gmail/types";
import { db } from "./db";
import { messageContents as messageContentsTable, messages as messagesTable } from "./schema";

export type Message = typeof messagesTable.$inferSelect;

export function getAllMessages() {
  return db.select().from(messagesTable).all();
}

export async function insertMessage(message: EmailMessage, threadId: number) {
  await db.transaction(async (tx) => {
    const insertedMessage = await db
      .insert(messagesTable)
      .values({
        threadId,
        historyId: message.historyId,
        serverId: message.id,
        from: message.decodedPayload.headers["From"],
        to: message.decodedPayload.headers["To"],
        subject: message.decodedPayload.headers["Subject"],
        snippet: message.snippet,
        isUnread: message.labelIds?.includes("UNREAD"),
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
