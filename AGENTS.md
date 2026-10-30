<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project notes (DIT205 RBAC)
- Follows melivecode.com/th/article/dit205/06-rbac-mysql. MySQL = CAMPP (port 3307, phpMyAdmin :8080), DB `dit205_rbac_db`, schema in `database.sql`.
- `next.config.mjs` is intentionally empty: create-next-app's default `cacheComponents` broke the build on `/news/[id]/edit` (useParams outside Suspense).
- Test users (password1234): karnyong@me.com admin, somchai@me.com staff, somsri@me.com student.
- Exercises done: `teacher` role (post only); `news.author_id` ownership — staff edits own news only, admin has `news:update:any`. Schema changes in `migration_exercises.sql` (run after `database.sql`).
- E2E: `npm run test:e2e` (Playwright, uses the running dev server; creates teacher@me.com and cleans up its own posts).
- Not done by choice: exercise 1 (deploy to Vercel/TiDB) — user wants local only.
