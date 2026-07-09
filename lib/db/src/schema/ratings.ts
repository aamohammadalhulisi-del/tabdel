import { pgTable, serial, timestamp, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { swapRequestsTable } from "./swapRequests";

export const ratingsTable = pgTable("ratings", {
  id: serial("id").primaryKey(),
  raterId: integer("rater_id").notNull().references(() => usersTable.id),
  ratedId: integer("rated_id").notNull().references(() => usersTable.id),
  swapRequestId: integer("swap_request_id").notNull().references(() => swapRequestsTable.id),
  stars: integer("stars").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRatingSchema = createInsertSchema(ratingsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratingsTable.$inferSelect;
