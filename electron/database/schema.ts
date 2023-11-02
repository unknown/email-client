import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const threads = sqliteTable("threads", {
  id: text("id").notNull().primaryKey(),
  gmailThreadId: text("gmailThreadId").notNull(),
});

export const messages = sqliteTable("messages", {
  id: text("id").notNull().primaryKey(),
  threadId: text("threadId")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  historyId: text("historyId").notNull(),
  from: text("from").notNull(),
  subject: text("subject").notNull(),
  snippet: text("snippet").notNull(),
  isUnread: integer("isUnread", { mode: "boolean" }).notNull(),
});

export const messageContents = sqliteTable("messageContents", {
  id: text("id").notNull().primaryKey(),
  messageId: text("messageId")
    .notNull()
    .references(() => messages.id, {
      onDelete: "cascade",
    }),
  bodyHtml: text("bodyHtml"),
  bodyText: text("bodyText"),
  to: text("to").notNull(),
});
