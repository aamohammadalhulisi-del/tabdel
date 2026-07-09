import { Router, type IRouter } from "express";
import { eq, count, gte, and } from "drizzle-orm";
import { db, usersTable, listingsTable, swapRequestsTable, reportsTable } from "@workspace/db";
import { BanUserBody, GetAdminUsersQueryParams, GetAdminListingsQueryParams } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../lib/auth";
import { buildListingRow } from "./listings-helper";
import { ilike } from "drizzle-orm";

const router: IRouter = Router();

router.get("/admin/stats", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(usersTable);
  const [{ totalListings }] = await db.select({ totalListings: count() }).from(listingsTable);
  const [{ totalSwaps }] = await db.select({ totalSwaps: count() }).from(swapRequestsTable);
  const [{ totalReports }] = await db.select({ totalReports: count() }).from(reportsTable);
  const [{ newUsersThisWeek }] = await db.select({ newUsersThisWeek: count() }).from(usersTable).where(gte(usersTable.createdAt, oneWeekAgo));
  const [{ newListingsThisWeek }] = await db.select({ newListingsThisWeek: count() }).from(listingsTable).where(gte(listingsTable.createdAt, oneWeekAgo));

  res.json({
    totalUsers: Number(totalUsers),
    totalListings: Number(totalListings),
    totalSwaps: Number(totalSwaps),
    totalReports: Number(totalReports),
    newUsersThisWeek: Number(newUsersThisWeek),
    newListingsThisWeek: Number(newListingsThisWeek),
  });
});

router.get("/admin/users", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = GetAdminUsersQueryParams.safeParse(req.query);
  const { q, page = 1 } = params.success ? params.data : {} as any;
  const pageNum = Math.max(1, Number(page) || 1);
  const limit = 20;
  const offset = (pageNum - 1) * limit;

  let rows: typeof usersTable.$inferSelect[];
  let total: number;

  if (q) {
    const all = await db.select().from(usersTable).where(ilike(usersTable.name, `%${q}%`));
    total = all.length;
    rows = all.slice(offset, offset + limit);
  } else {
    const [{ cnt }] = await db.select({ cnt: count() }).from(usersTable);
    total = Number(cnt);
    rows = await db.select().from(usersTable).limit(limit).offset(offset).orderBy(usersTable.createdAt);
  }

  const users = rows.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    city: u.city,
    avatarUrl: u.avatarUrl,
    rating: u.rating,
    ratingCount: u.ratingCount,
    isAdmin: u.isAdmin,
    isBanned: u.isBanned,
    createdAt: u.createdAt,
  }));

  res.json({ users, total, page: pageNum, totalPages: Math.ceil(total / limit) });
});

router.patch("/admin/users/:id/ban", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const parsed = BanUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  await db.update(usersTable).set({ isBanned: parsed.data.banned }).where(eq(usersTable.id, id));
  res.json({ ok: true });
});

router.get("/admin/listings", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = GetAdminListingsQueryParams.safeParse(req.query);
  const { page = 1 } = params.success ? params.data : {} as any;
  const pageNum = Math.max(1, Number(page) || 1);
  const limit = 20;
  const offset = (pageNum - 1) * limit;

  const [{ total }] = await db.select({ total: count() }).from(listingsTable);
  const rows = await db.select().from(listingsTable).limit(limit).offset(offset).orderBy(listingsTable.createdAt);

  const listings = await Promise.all(rows.map(buildListingRow));
  res.json({ listings, total: Number(total), page: pageNum, totalPages: Math.ceil(Number(total) / limit) });
});

router.delete("/admin/listings/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(listingsTable).where(eq(listingsTable.id, id));
  res.sendStatus(204);
});

export default router;
