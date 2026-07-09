import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ratingsTable, usersTable, notificationsTable } from "@workspace/db";
import { CreateRatingBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.post("/ratings", requireAuth, async (req, res): Promise<void> => {
  const raterId = (req.session as any).userId as number;
  const parsed = CreateRatingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { ratedId, swapRequestId, stars, comment } = parsed.data;

  const [rating] = await db.insert(ratingsTable).values({
    raterId,
    ratedId,
    swapRequestId,
    stars,
    comment: comment || null,
  }).returning();

  // Update rated user's average rating
  const allRatings = await db.select({ stars: ratingsTable.stars }).from(ratingsTable).where(eq(ratingsTable.ratedId, ratedId));
  const avg = allRatings.reduce((s, r) => s + r.stars, 0) / allRatings.length;
  await db.update(usersTable).set({ rating: Math.round(avg * 10) / 10, ratingCount: allRatings.length }).where(eq(usersTable.id, ratedId));

  // Notify rated user
  const [rater] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, raterId));
  await db.insert(notificationsTable).values({
    userId: ratedId,
    type: "rating",
    title: "تقييم جديد",
    body: `منحك ${rater.name} ${stars} نجوم`,
    relatedId: rating.id,
  });

  const [raterFull] = await db.select({
    id: usersTable.id, name: usersTable.name, city: usersTable.city,
    avatarUrl: usersTable.avatarUrl, rating: usersTable.rating, ratingCount: usersTable.ratingCount,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.id, raterId));

  const [ratedFull] = await db.select({
    id: usersTable.id, name: usersTable.name, city: usersTable.city,
    avatarUrl: usersTable.avatarUrl, rating: usersTable.rating, ratingCount: usersTable.ratingCount,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.id, ratedId));

  res.status(201).json({
    id: rating.id,
    rater: { ...raterFull, listingsCount: 0 },
    rated: { ...ratedFull, listingsCount: 0 },
    stars: rating.stars,
    comment: rating.comment,
    createdAt: rating.createdAt,
  });
});

export default router;
