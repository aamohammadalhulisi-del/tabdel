import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, reportsTable, usersTable } from "@workspace/db";
import { CreateReportBody, GetAdminReportsQueryParams, ResolveReportBody } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.post("/reports", requireAuth, async (req, res): Promise<void> => {
  const reporterId = (req.session as any).userId as number;
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  await db.insert(reportsTable).values({
    reporterId,
    targetType: parsed.data.targetType,
    targetId: parsed.data.targetId,
    reason: parsed.data.reason,
  });

  res.sendStatus(201);
});

// Admin routes for reports
router.get("/admin/reports", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = GetAdminReportsQueryParams.safeParse(req.query);
  const { status } = params.success ? params.data : {} as any;

  let rows = await db.select().from(reportsTable);
  if (status) rows = rows.filter(r => r.status === status);

  const result = await Promise.all(rows.map(async (r) => {
    const [reporter] = await db.select({
      id: usersTable.id, name: usersTable.name, city: usersTable.city,
      avatarUrl: usersTable.avatarUrl, rating: usersTable.rating, ratingCount: usersTable.ratingCount,
      createdAt: usersTable.createdAt,
    }).from(usersTable).where(eq(usersTable.id, r.reporterId));
    return {
      id: r.id,
      reporter: { ...reporter, listingsCount: 0 },
      targetType: r.targetType,
      targetId: r.targetId,
      reason: r.reason,
      status: r.status,
      createdAt: r.createdAt,
    };
  }));

  res.json(result);
});

router.patch("/admin/reports/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const parsed = ResolveReportBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [report] = await db.update(reportsTable).set({ status: parsed.data.status }).where(eq(reportsTable.id, id)).returning();
  if (!report) { res.status(404).json({ error: "Not found" }); return; }

  const [reporter] = await db.select({
    id: usersTable.id, name: usersTable.name, city: usersTable.city,
    avatarUrl: usersTable.avatarUrl, rating: usersTable.rating, ratingCount: usersTable.ratingCount,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.id, report.reporterId));

  res.json({ id: report.id, reporter: { ...reporter, listingsCount: 0 }, targetType: report.targetType, targetId: report.targetId, reason: report.reason, status: report.status, createdAt: report.createdAt });
});

export default router;
