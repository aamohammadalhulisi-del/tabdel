import { Router, type IRouter } from "express";
import { eq, and, or, desc, count } from "drizzle-orm";
import rateLimit from "express-rate-limit";
import { db, messagesTable, swapRequestsTable, usersTable, listingsTable, notificationsTable } from "@workspace/db";
import { SendMessageBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { buildListingRow } from "./listings-helper";
import sanitizeHtml from "sanitize-html";
const router: IRouter = Router();
const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    error: "تم إرسال رسائل كثيرة، حاول لاحقاً"
  }
});
router.get("/conversations", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId as number;

  const swapReqs = await db.select().from(swapRequestsTable)
    .where(and(
      or(eq(swapRequestsTable.requesterId, userId), eq(swapRequestsTable.ownerId, userId))!,
      eq(swapRequestsTable.status, "accepted")
    ));

  const conversations = await Promise.all(swapReqs.map(async (sr) => {
    const otherUserId = sr.requesterId === userId ? sr.ownerId : sr.requesterId;
    const [otherUser] = await db.select({
      id: usersTable.id, name: usersTable.name, city: usersTable.city,
      avatarUrl: usersTable.avatarUrl, rating: usersTable.rating, ratingCount: usersTable.ratingCount,
      createdAt: usersTable.createdAt,
    }).from(usersTable).where(eq(usersTable.id, otherUserId));

    const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, sr.listingId));

    const messages = await db.select().from(messagesTable).where(eq(messagesTable.swapRequestId, sr.id)).orderBy(desc(messagesTable.createdAt)).limit(1);
    const lastMsg = messages[0];

    const [{ unreadCount }] = await db.select({ unreadCount: count() })
      .from(messagesTable)
      .where(and(eq(messagesTable.swapRequestId, sr.id), eq(messagesTable.isRead, false), or(eq(messagesTable.senderId, otherUserId))!));

    return {
      swapRequestId: sr.id,
      otherUser: { ...otherUser, listingsCount: 0 },
      listing: listing ? await buildListingRow(listing) : null,
      lastMessage: lastMsg?.content || null,
      unreadCount: Number(unreadCount),
      status: sr.status,
    };
  }));

  res.json(conversations);
});

router.get("/conversations/:swapRequestId/messages", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId as number;
  const raw = Array.isArray(req.params.swapRequestId) ? req.params.swapRequestId[0] : req.params.swapRequestId;
  const swapRequestId = parseInt(raw, 10);

  const [sr] = await db.select().from(swapRequestsTable).where(eq(swapRequestsTable.id, swapRequestId));
  if (!sr) { res.status(404).json({ error: "Conversation not found" }); return; }
  if (sr.requesterId !== userId && sr.ownerId !== userId) { res.status(403).json({ error: "Forbidden" }); return; }

  const rows = await db.select().from(messagesTable).where(eq(messagesTable.swapRequestId, swapRequestId)).orderBy(messagesTable.createdAt);

  const messages = await Promise.all(rows.map(async (m) => {
    const [sender] = await db.select({
      id: usersTable.id, name: usersTable.name, city: usersTable.city,
      avatarUrl: usersTable.avatarUrl, rating: usersTable.rating, ratingCount: usersTable.ratingCount,
      createdAt: usersTable.createdAt,
    }).from(usersTable).where(eq(usersTable.id, m.senderId));
    return { id: m.id, swapRequestId: m.swapRequestId, sender: { ...sender, listingsCount: 0 }, content: m.content, imageUrl: m.imageUrl, isRead: m.isRead, createdAt: m.createdAt };
  }));

  res.json(messages);
});

router.post("/conversations/:swapRequestId/messages", requireAuth, messageLimiter, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId as number;
  const raw = Array.isArray(req.params.swapRequestId) ? req.params.swapRequestId[0] : req.params.swapRequestId;
  const swapRequestId = parseInt(raw, 10);

  const [sr] = await db.select().from(swapRequestsTable).where(eq(swapRequestsTable.id, swapRequestId));
  if (!sr) { res.status(404).json({ error: "Conversation not found" }); return; }
  if (sr.requesterId !== userId && sr.ownerId !== userId) { res.status(403).json({ error: "Forbidden" }); return; }
const parsed = SendMessageBody.safeParse(req.body);
 if (!parsed.success) {
  res.status(400).json({ error: parsed.error.message });
  return;
}

const cleanContent = sanitizeHtml(parsed.data.content ?? "", {
  allowedTags: [],
  allowedAttributes: {},
}).trim();

if (!cleanContent && !parsed.data.imageUrl) {
  res.status(400).json({
    error: "لا يمكن إرسال رسالة فارغة",
  });
  return;
}

if (cleanContent.length > 1000) {
  res.status(400).json({
    error: "الرسالة طويلة جداً",
  });
  return;
}

  

  const [msg] = await db.insert(messagesTable).values({
    swapRequestId,
    senderId: userId,
   content: cleanContent,
    imageUrl: parsed.data.imageUrl || null,
  }).returning();

  // Notify other party
  const otherUserId = sr.requesterId === userId ? sr.ownerId : sr.requesterId;
  const [sender] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, userId));
  await db.insert(notificationsTable).values({
    userId: otherUserId,
    type: "new_message",
    title: "رسالة جديدة",
    body: `${sender.name}: ${cleanContent.slice(0, 50)}`,
    relatedId: swapRequestId,
  });

  const [senderFull] = await db.select({
    id: usersTable.id, name: usersTable.name, city: usersTable.city,
    avatarUrl: usersTable.avatarUrl, rating: usersTable.rating, ratingCount: usersTable.ratingCount,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.id, userId));

  res.status(201).json({ id: msg.id, swapRequestId: msg.swapRequestId, sender: { ...senderFull, listingsCount: 0 }, content: msg.content, imageUrl: msg.imageUrl, isRead: msg.isRead, createdAt: msg.createdAt });
});

router.patch("/conversations/:swapRequestId/read", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId as number;
  const raw = Array.isArray(req.params.swapRequestId) ? req.params.swapRequestId[0] : req.params.swapRequestId;
  const swapRequestId = parseInt(raw, 10);

  await db.update(messagesTable)
    .set({ isRead: true })
    .where(and(eq(messagesTable.swapRequestId, swapRequestId), eq(messagesTable.isRead, false)));

  res.json({ ok: true });
});

export default router;
