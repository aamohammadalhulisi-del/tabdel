import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, usersTable, listingsTable, ratingsTable } from "@workspace/db";
import { UpdateUserBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { buildListingRow } from "./listings-helper";

const router: IRouter = Router();

function formatUserProfile(u: typeof usersTable.$inferSelect, listingsCount: number) {
  return {
    id: u.id,
    name: u.name,
    city: u.city,
    avatarUrl: u.avatarUrl,
    rating: u.rating,
    ratingCount: u.ratingCount,
    listingsCount,
    createdAt: u.createdAt,
  };
}

router.get("/users/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const [{ lcount }] = await db
    .select({ lcount: count() })
    .from(listingsTable)
    .where(eq(listingsTable.userId, id));

  res.json(formatUserProfile(user, Number(lcount)));
});

router.patch("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const sessionUserId = (req.session as any).userId as number;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  if (id !== sessionUserId) { res.status(403).json({ error: "Forbidden" }); return; }

  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [updated] = await db.update(usersTable).set(parsed.data as any).where(eq(usersTable.id, id)).returning();
  res.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    city: updated.city,
    avatarUrl: updated.avatarUrl,
    rating: updated.rating,
    ratingCount: updated.ratingCount,
    isAdmin: updated.isAdmin,
    isBanned: updated.isBanned,
    createdAt: updated.createdAt,
  });
});

router.get("/users/:id/listings", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const rows = await db.select().from(listingsTable).where(eq(listingsTable.userId, id));
  const listings = await Promise.all(rows.map((l) => buildListingRow(l)));
  res.json(listings);
});

router.get("/users/:id/ratings", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const rows = await db.select().from(ratingsTable).where(eq(ratingsTable.ratedId, id));

  const ratings = await Promise.all(rows.map(async (r) => {
    const [rater] = await db.select({
      id: usersTable.id, name: usersTable.name, city: usersTable.city,
      avatarUrl: usersTable.avatarUrl, rating: usersTable.rating, ratingCount: usersTable.ratingCount,
      createdAt: usersTable.createdAt,
    }).from(usersTable).where(eq(usersTable.id, r.raterId));
    const [rated] = await db.select({
      id: usersTable.id, name: usersTable.name, city: usersTable.city,
      avatarUrl: usersTable.avatarUrl, rating: usersTable.rating, ratingCount: usersTable.ratingCount,
      createdAt: usersTable.createdAt,
    }).from(usersTable).where(eq(usersTable.id, r.ratedId));
    return {
      id: r.id,
      rater: { ...rater, listingsCount: 0 },
      rated: { ...rated, listingsCount: 0 },
      stars: r.stars,
      comment: r.comment,
      createdAt: r.createdAt,
    };
  }));

  const avgRating = ratings.length ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length : 0;
  res.json({ ratings, avgRating, totalCount: ratings.length });
});

export default router;
