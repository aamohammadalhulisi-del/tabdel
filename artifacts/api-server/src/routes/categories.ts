import { Router, type IRouter } from "express";
import { db, categoriesTable, listingsTable } from "@workspace/db";
import { eq, sql, count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/categories", async (req, res): Promise<void> => {
  const rows = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      icon: categoriesTable.icon,
      listingsCount: sql<number>`count(${listingsTable.id})::int`,
    })
    .from(categoriesTable)
    .leftJoin(listingsTable, eq(listingsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id)
    .orderBy(categoriesTable.id);

  res.json(rows);
});

export default router;
