# AGENTS.md

Guidance for AI coding agents working in **DreksZone** — an Indonesian news portal (Kompas-style). Next.js 16 (App Router) + Supabase (PostgreSQL terkelola). The web app runs in Docker; the database is hosted on Supabase.

Full project docs, API reference, and design decisions: see [README.md](./README.md) — **link to it, don't duplicate it**.

## Commands

```bash
cd web
npm run dev        # Next.js dev server on :3000 (needs a running DB)
npm run build      # production build (Turbopack) — the primary verification step
npm run seed       # node scripts/seed.mjs — idempotent seed (9 categories, 57+ articles) via Supabase API
npx tsc --noEmit   # typecheck without building

# Full stack (from repo root):
docker compose up --build        # web on :3000 (DB = Supabase cloud, no local db container)
docker compose down             # stop services (DB data lives in Supabase)
```

There are **no lint or test scripts** — run `npm run build` (or `npx tsc --noEmit`) to verify changes.

## Architecture

```
Browser → Next.js Server Components (web/src/app/*/page.tsx)
        → web/src/lib/api.ts (fetch, absolute URL + ISR revalidate: 30)
        → Route Handlers (web/src/app/api/**/route.ts)
        → web/src/lib/db.ts (Supabase client, server-only)
        → Supabase (PostgREST API + PostgreSQL terkelola)
```

- There is **no separate API service** — the REST API is Next.js Route Handlers under `web/src/app/api/` (categories, articles, headlines, trending, related, search, health, auth).
- Schema DDL lives in `web/scripts/schema.sql` (tables categories/articles/users/authors/sessions, migrations, `increment_article_views` function) — single source of truth: run it once in the Supabase SQL editor, **or** seed.mjs applies it automatically when `DATABASE_URL` is set. `web/scripts/seed.mjs` seeds data via the Supabase REST API (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, service role bypasses RLS). The Dockerfile runs it before starting the server, so it runs on **every container start** (idempotent). It (re)creates the `authors` table of authorized writers (seeds `fathandwipayana@gmail.com` + any emails in the `AUTHOR_EMAILS` env, comma-separated) and creates `users` + `sessions` tables. Old password-based `users` rows (pre-OAuth) are deleted by the migration (`DELETE FROM users WHERE email IS NULL`).
- Types (`Category`, `Article`, `ArticleList`) are centralized in `web/src/lib/types.ts`; shared helpers live in `web/src/lib/articles.ts` (`ARTICLE_FIELDS` PostgREST select string, `flattenArticle` (embeds `categories (...)` → flat `category_*` columns), `parseLimit`, `localizeArticle`, `incrementArticleViews`).

## Conventions

- **All user-facing strings are Indonesian** — UI text, `aria-label`s, and API errors (`'Terjadi kesalahan pada server'`, `'Artikel tidak ditemukan'`). Code comments may be EN or ID.
- **Server components by default** (async `export default`). Add `'use client'` only when hooks are needed (ThemeToggle, MobileMenu, SearchBox, ShareButtons).
- **Styling**: single plain-CSS file `web/src/app/globals.css` with CSS custom properties (`--accent: #b3261e`, `--ink`, `--surface`, etc.). Dark mode = `.dark` class on `<html>` + `localStorage['kn-theme']`. Dynamic category colors via inline `style={{ ['--cat-color' as string]: c.color }}`. Don't introduce CSS-in-JS.
- **Auth**: **Google OAuth only** (no passwords). `web/src/lib/auth.ts` (server-only) is the single auth entry point — session cookie `kn_session` (httpOnly, SameSite=Lax, 7 days), SHA-256-hashed session tokens in DB. `getSessionUser()` for reads, `requireUser()` redirects to `/masuk`, `destroySession()` for logout, `authorizeGoogleUser()` checks the `authors` table (allowlist of writer emails) and upserts the Google user into `users`. OAuth plumbing (auth URL, token exchange, userinfo fetch) lives in `web/src/lib/oauth.ts` (server-only, no npm deps — uses Node's `https` module with `family: 4`, **not** global `fetch`/undici, which fails with `ETIMEDOUT` in this environment). Flow: `/masuk` → `GoogleLoginButton` → `GET /api/auth/google` (sets one-time `kn_oauth_state` cookie + redirects to Google) → `GET /api/auth/google/callback` (CSRF state check → exchange code → verify email against `authors` → create session → redirect `/tulis`). Env: `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (required; `/masuk?error=missing_config` otherwise) and `AUTHOR_EMAILS` (extra writers).
- **Route Handlers**: every route has `export const dynamic = 'force-dynamic';` and an async `GET` wrapped in try/catch → `NextResponse.json({ error: ... }, { status: 500 })`. **`POST /api/articles` requires login** (401 `'Silakan masuk terlebih dahulu'`); auth routes are google/google-callback/logout/me under `/api/auth/`.
- **Pages**: `generateMetadata` + `notFound()`, `export const dynamic = 'force-dynamic'` (or ISR via fetch revalidation). `/tulis` calls `await requireUser()` first; `/masuk` redirects to `/tulis` when already logged in.

## Pitfalls

- **`db.ts` is `server-only`** — the Supabase client (service role key) cannot be imported into client components. Same for `lib/auth.ts`. `getSupabase()` is lazy (not at module load) so `docker build` (no env) doesn't crash on import; it throws only when actually used. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- **`cookies()` is async** (Next 16) — always `await`; `store.set()` only works in Route Handlers/Server Actions, not arbitrary server components.
- **`redirect()` inside a server component** streams as `NEXT_REDIRECT` embedded in the shell (200 + template) when inside the `loading.tsx` Suspense boundary — the browser still navigates; don't rely on HTTP 307 in curl for `/tulis`.
- **`requireUser()` uses `redirect()`** — never wrap it in try/catch (swallows `NEXT_REDIRECT`).
- **Login rate limiter is gone** — with Google OAuth there is no password guessing; rate limiting is delegated to Google. (The old in-memory limiter in `auth.ts` was removed.)
- **Google OAuth redirect URI** is `${NEXT_PUBLIC_APP_URL}/api/auth/google/callback` — it must be registered in Google Cloud Console *and* match `NEXT_PUBLIC_APP_URL` in `.env`, or Google rejects the login with `redirect_uri_mismatch`.
- **`users` table is Google-identity only** (`email` NOT NULL + unique index `idx_users_email`); there is no `username`/`password_hash` anymore. `GET /api/auth/me` now returns `{ id, email, name, avatar_url }`.
- **`api.ts` requires an absolute URL** built from `NEXT_PUBLIC_APP_URL` (fallback `http://localhost:3000`). Relative URLs throw `ERR_INVALID_URL` during static generation.
- **`GET /api/articles/[slug]` increments `views`** — a side effect inside a GET, done via `supabase.rpc('increment_article_views', …)` (atomic SQL function in `schema.sql`; falls back to read-then-update if the function is missing). `api.article()` uses `cache: 'no-store'`; don't wrap article detail fetches in ISR caching.
- **`sitemap.ts` queries the DB at prerender time** — during `docker build` there is no DB, so the queries are wrapped in try/catch: the build falls back to a homepage-only sitemap and ISR (`revalidate: 3600`) regenerates the full version at runtime. Don't remove the try/catch or move DB access to build-time top-level.
- **Seed is idempotent but asymmetric**: existing articles (by slug) only get their `*_en` columns backfilled (Indonesian fields, `published_at`, `views`, `featured` are preserved — fetched slug list first, then `UPDATE` vs `INSERT` per article); new articles are inserted full. Categories use full upsert (`onConflict: 'slug'`).
- **Next 16**: `params`/`searchParams` are Promises — always `await` them.
- **Node ≥ 20.9** required (Next 16); Dockerfile uses `node:20-alpine`.
- **Database is Supabase-hosted** — there is no local `db`/`adminer` container and no `pgdata` volume anymore. The app talks to Supabase via the REST API: `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (env required; service role bypasses RLS). `DATABASE_URL` (Transaction pooler, port 6543) is **optional** — only used by seed.mjs to auto-apply `schema.sql`; without it, paste `schema.sql` into the Supabase SQL editor once. SSL is auto-enabled for `*.supabase.co`/`*.supabase.com` hosts when pg is used (seed.mjs). Adminer is gone — use the Supabase SQL editor instead.
