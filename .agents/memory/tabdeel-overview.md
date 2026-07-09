---
name: Tabdeel platform overview
description: Stack, auth, DB, image upload, and security decisions for the Tabdeel barter platform.
---

## Stack
- Frontend: React + Vite (`artifacts/tabdeel`), preview at `/`
- Backend: Express 5 (`artifacts/api-server`), port 8080
- DB: PostgreSQL + Drizzle ORM (`lib/db`)
- OpenAPI spec → codegen → hooks (`lib/api-client-react`) + Zod schemas (`lib/api-zod`)

## Auth
- Session-based (bcryptjs + express-session + connect-pg-simple, table: `sessions`)
- SESSION_SECRET must be set or server refuses to start (no hardcoded fallback)
- `requireAuth` / `requireAdmin` in `artifacts/api-server/src/lib/auth.ts` revalidate user from DB on every protected request (catches ban/admin changes)

## DB Schema
- Tables: users, categories, listings, swapRequests, messages, ratings, reports, notifications, sessions
- Seeded: 9 categories, 1 admin (admin@tabdeel.jo), 3 users, 6 listings

## Image upload
- POST /api/upload: base64 JSON → validated (MIME detect + magic bytes + 5MB limit) → `/tmp/tabdeel-uploads`
- GET /api/uploads/:filename: path-traversal safe, sets correct Content-Type

## CORS
- Allows localhost and *.replit.dev / *.repl.co / *.replit.app patterns with credentials
- Rejects all other origins

## Key quirk
- After adding schema tables to `lib/db/src/schema/`, run `pnpm run typecheck:libs` (`tsc --build`) before building the API server or the new exports won't be visible.
