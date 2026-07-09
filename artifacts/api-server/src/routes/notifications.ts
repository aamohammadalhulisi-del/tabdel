import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId as number;
  const rows = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(notificationsTable.createdAt);

  res.json(rows.reverse().map(n => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    isRead: n.isRead,
    relatedId: n.relatedId,
    createdAt: n.createdAt,
  })));
});

router.patch("/notifications/read-all", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId as number;
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, userId));
  res.json({ ok: true });
});

router.patch("/notifications/:id/read", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId as number;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.update(notificationsTable).set({ isRead: true })
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, userId)));
  res.json({ ok: true });
});

export default router;
