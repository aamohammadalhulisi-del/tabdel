import { pgTable, serial, timestamp, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").notNull().references(() => usersTable.id),
  targetType: text("target_type").notNull(), // listing | user
  targetId: integer("target_id").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending | resolved | dismissed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({
  id: true,
  createdAt: true,
  status: true,
});
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
