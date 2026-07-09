import { pgTable, serial, timestamp, integer, text, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { swapRequestsTable } from "./swapRequests";

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  swapRequestId: integer("swap_request_id").notNull().references(() => swapRequestsTable.id),
  senderId: integer("sender_id").notNull().references(() => usersTable.id),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messagesTable).omit({
  id: true,
  createdAt: true,
  isRead: true,
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;
