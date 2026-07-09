import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

/**
 * Verify the session has a userId AND the user exists and is not banned.
 * This prevents stale sessions from granting access after a ban.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req.session as any).userId as number | undefined;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [user] = await db.select({
    id: usersTable.id,
    isAdmin: usersTable.isAdmin,
    isBanned: usersTable.isBanned,
  }).from(usersTable).where(eq(usersTable.id, userId));

  if (!user || user.isBanned) {
    req.session.destroy(() => {});
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Keep session flags in sync with current DB state
  (req.session as any).isAdmin = user.isAdmin;

  next();
}

/**
 * Verify the session user is an admin. Must be called after requireAuth.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req.session as any).userId as number | undefined;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [user] = await db.select({
    id: usersTable.id,
    isAdmin: usersTable.isAdmin,
    isBanned: usersTable.isBanned,
  }).from(usersTable).where(eq(usersTable.id, userId));

  if (!user || user.isBanned || !user.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  next();
}
