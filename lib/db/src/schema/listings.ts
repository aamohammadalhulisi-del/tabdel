import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { categoriesTable } from "./categories";

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  condition: text("condition").notNull().default("used"), // new | used | good
  wantsInExchange: text("wants_in_exchange").notNull().default(""),
  city: text("city").notNull().default(""),
  images: text("images").array().notNull().default([]),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isFeatured: true,
  isActive: true,
});
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
