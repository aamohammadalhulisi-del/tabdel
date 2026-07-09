import { Router, type IRouter } from "express";
import { eq, ilike, and, desc, sql, or, count } from "drizzle-orm";
import {
  db,
  listingsTable,
  usersTable,
  categoriesTable,
  swapRequestsTable,
} from "@workspace/db";
import {
  CreateListingBody,
  UpdateListingBody,
  GetListingParams,
  GetListingsQueryParams,
  GetAdminListingsQueryParams,
  UpdateListingParams,
  DeleteListingParams,
  FeatureListingParams,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

async function buildListingRow(listing: typeof listingsTable.$inferSelect) {
  const [owner] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      city: usersTable.city,
      avatarUrl: usersTable.avatarUrl,
      rating: usersTable.rating,
      ratingCount: usersTable.ratingCount,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, listing.userId));

  const [category] = await db
    .select({ id: categoriesTable.id, name: categoriesTable.name, slug: categoriesTable.slug, icon: categoriesTable.icon })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, listing.categoryId));

  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    condition: listing.condition,
    wantsInExchange: listing.wantsInExchange,
    city: listing.city,
    images: listing.images,
    isFeatured: listing.isFeatured,
    isActive: listing.isActive,
    createdAt: listing.createdAt,
    category: { ...category, listingsCount: 0 },
    owner: { ...owner, listingsCount: 0 },
  };
}

router.get("/listings", async (req, res): Promise<void> => {
  const params = GetListingsQueryParams.safeParse(req.query);
  const { q, category, city, condition, featured, page = 1, limit = 20 } = params.success ? params.data : {} as any;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(50, Math.max(1, Number(limit) || 20));
  const offset = (pageNum - 1) * limitNum;

  const conditions: any[] = [eq(listingsTable.isActive, true)];
  if (q) conditions.push(ilike(listingsTable.title, `%${q}%`));
  if (city) conditions.push(ilike(listingsTable.city, `%${city}%`));
  if (condition) conditions.push(eq(listingsTable.condition, condition));
  if (featured === true || featured === "true") conditions.push(eq(listingsTable.isFeatured, true));

  let catFilter: any = undefined;
  if (category) {
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, category));
    if (cat) catFilter = cat.id;
  }
  if (catFilter) conditions.push(eq(listingsTable.categoryId, catFilter));

  const [{ total }] = await db
    .select({ total: count() })
    .from(listingsTable)
    .where(conditions.length ? and(...conditions) : undefined);

  const rows = await db
    .select()
    .from(listingsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(listingsTable.isFeatured), desc(listingsTable.createdAt))
    .limit(limitNum)
    .offset(offset);

  const listings = await Promise.all(rows.map(buildListingRow));
  res.json({ listings, total: Number(total), page: pageNum, totalPages: Math.ceil(Number(total) / limitNum) });
});

router.post("/listings", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId as number;
  const parsed = CreateListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { title, description, condition, wantsInExchange, categoryId, city, images } = parsed.data;

  const [listing] = await db.insert(listingsTable).values({
    title,
    description: description || "",
    condition: condition || "used",
    wantsInExchange: wantsInExchange || "",
    categoryId,
    city: city || "",
    images: images || [],
    userId,
  }).returning();

  const result = await buildListingRow(listing);
  res.status(201).json(result);
});

router.get("/listings/featured", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(listingsTable)
    .where(and(eq(listingsTable.isFeatured, true), eq(listingsTable.isActive, true)))
    .orderBy(desc(listingsTable.createdAt))
    .limit(10);

  const listings = await Promise.all(rows.map(buildListingRow));
  res.json(listings);
});

router.get("/listings/stats", async (req, res): Promise<void> => {
  const [{ total }] = await db.select({ total: count() }).from(listingsTable).where(eq(listingsTable.isActive, true));
  const [{ featured }] = await db.select({ featured: count() }).from(listingsTable).where(and(eq(listingsTable.isFeatured, true), eq(listingsTable.isActive, true)));

  const byCat = await db
    .select({
      categoryId: categoriesTable.id,
      name: categoriesTable.name,
      count: sql<number>`count(${listingsTable.id})::int`,
    })
    .from(categoriesTable)
    .leftJoin(listingsTable, and(eq(listingsTable.categoryId, categoriesTable.id), eq(listingsTable.isActive, true)))
    .groupBy(categoriesTable.id, categoriesTable.name);

  res.json({ total: Number(total), featured: Number(featured), byCategory: byCat });
});

router.get("/listings/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id));
  if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }

  const base = await buildListingRow(listing);
  const [{ swapRequestCount }] = await db
    .select({ swapRequestCount: count() })
    .from(swapRequestsTable)
    .where(eq(swapRequestsTable.listingId, id));

  res.json({ ...base, swapRequestCount: Number(swapRequestCount) });
});

router.patch("/listings/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId as number;
  const isAdmin = (req.session as any).isAdmin;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id));
  if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }
  if (listing.userId !== userId && !isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const parsed = UpdateListingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [updated] = await db.update(listingsTable).set(parsed.data as any).where(eq(listingsTable.id, id)).returning();
  const result = await buildListingRow(updated);
  res.json(result);
});

router.delete("/listings/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId as number;
  const isAdmin = (req.session as any).isAdmin;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id));
  if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }
  if (listing.userId !== userId && !isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  await db.delete(listingsTable).where(eq(listingsTable.id, id));
  res.sendStatus(204);
});

router.post("/listings/:id/feature", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [listing] = await db.update(listingsTable).set({ isFeatured: true }).where(eq(listingsTable.id, id)).returning();
  if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }

  const result = await buildListingRow(listing);
  res.json(result);
});

export default router;
