import { EmailMessage } from "../gmail/types";
import { db } from "./db";
import { messageContents as messageContentsTable, messages as messagesTable } from "./schema";

export type Message = typeof messagesTable.$inferSelect;

export function getAllMessages() {
  return db.select().from(messagesTable).all();
}

type EmailMessageWithId = EmailMessage & { messageId: number };

export async function insertMessageRecords(messages: EmailMessage[], threadId: number) {
  const insertedMessages = await db
    .insert(messagesTable)
    .values(
      messages.map((message) => ({
        threadId,
        historyId: message.historyId ?? "",
        serverId: message.id ?? "",
        from: message.decodedPayload.headers["From"] ?? "",
        subject: message.decodedPayload.headers.Subject ?? "",
        snippet: message.snippet ?? "",
        isUnread: message.labelIds?.includes("UNREAD") ?? false,
      })),
    )
    .returning({ insertedId: messagesTable.id });

  const messagesWithIds = messages
    .map((message, i) => ({
      ...message,
      messageId: insertedMessages[i]?.insertedId,
    }))
    .filter((message): message is EmailMessageWithId => message.messageId !== undefined);

  return messages.length === messagesWithIds.length ? messagesWithIds : null;
}

export async function insertMessageContentRecords(messages: EmailMessageWithId[]) {
  await db.insert(messageContentsTable).values(
    messages.map((message) => {
      return {
        messageId: message.messageId,
        bodyHtml: message.decodedPayload.html ?? "",
        bodyText: message.decodedPayload.text ?? "",
        to: message.decodedPayload.headers["To"] ?? "",
      };
    }),
  );
}
