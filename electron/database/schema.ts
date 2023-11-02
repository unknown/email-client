import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const threads = sqliteTable("threads", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  serverId: text("serverId").notNull(),
});

export const threadsRelations = relations(threads, ({ many }) => ({
  messages: many(messages),
}));

export const messages = sqliteTable("messages", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  threadId: integer("threadId")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  historyId: text("historyId").notNull(),
  serverId: text("serverId").notNull(),
  from: text("from").notNull(),
  subject: text("subject").notNull(),
  snippet: text("snippet").notNull(),
  isUnread: integer("isUnread", { mode: "boolean" }).notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  thread: one(threads, { fields: [messages.threadId], references: [threads.id] }),
  messageContents: one(messageContents, {
    fields: [messages.id],
    references: [messageContents.messageId],
  }),
}));

export const messageContents = sqliteTable("messageContents", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  messageId: integer("messageId")
    .notNull()
    .references(() => messages.id, {
      onDelete: "cascade",
    }),
  bodyHtml: text("bodyHtml"),
  bodyText: text("bodyText"),
  to: text("to").notNull(),
});
