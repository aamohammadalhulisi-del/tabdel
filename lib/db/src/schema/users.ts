import { pgTable, text, serial, timestamp, boolean, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone").notNull().default(""),
  city: text("city").notNull().default(""),
  avatarUrl: text("avatar_url"),
  rating: real("rating").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  isAdmin: boolean("is_admin").notNull().default(false),
  isBanned: boolean("is_banned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  rating: true,
  ratingCount: true,
  isAdmin: true,
  isBanned: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
