import { pgTable, serial, timestamp, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { listingsTable } from "./listings";

export const swapRequestsTable = pgTable("swap_requests", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => listingsTable.id),
  requesterId: integer("requester_id").notNull().references(() => usersTable.id),
  ownerId: integer("owner_id").notNull().references(() => usersTable.id),
  message: text("message"),
  status: text("status").notNull().default("pending"), // pending | accepted | rejected | completed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSwapRequestSchema = createInsertSchema(swapRequestsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});
export type InsertSwapRequest = z.infer<typeof insertSwapRequestSchema>;
export type SwapRequest = typeof swapRequestsTable.$inferSelect;
