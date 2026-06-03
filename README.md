# Cutterbar — URL Shortener

A reliable, self-hostable URL shortener with click analytics. A single Next.js
app (App Router, TypeScript) talks to Postgres via Drizzle ORM.

- **Create** short links from any `http`/`https` URL (with validation + SSRF guard).
- **Redirect** `GET /:code` → original URL (302), logging each click without blocking the redirect.
- **Analytics** per link: total click count + recent click events.
- **Health** endpoint for uptime checks.

Built with Next.js 16, React 19, Drizzle ORM (Postgres), Zod, Vitest, and Playwright.

## Prerequisites

- **Node.js** 20+
- A **Postgres** database. This project is configured for a cloud Postgres
  (e.g. [Supabase](https://supabase.com)); any Postgres 14+ works.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#   - set DATABASE_URL to your Postgres connection string
#   - set IP_HASH_SALT to a long random string
```

### `DATABASE_URL` notes (cloud Postgres / Supabase)

- **Percent-encode special characters** in the password. For example a literal
  `@` must be written as `%40`, otherwise URL parsers mistake it for the
  user/host separator.
- For Supabase (and other providers using a self-signed root chain), append
  **`?sslmode=no-verify`** so the `pg` driver connects over TLS without
  rejecting the chain against Node's default CA bundle.

Example:

```
DATABASE_URL=postgresql://postgres:p%40ssword@db.<ref>.supabase.co:5432/postgres?sslmode=no-verify
```

### Apply the schema

```bash
npm run db:migrate     # creates the `links` and `clicks` tables
```

Other DB scripts: `npm run db:generate` (generate a migration after editing
`src/db/schema.ts`), `npm run db:studio` (open Drizzle Studio).

## Run

```bash
npm run dev            # http://localhost:3000
```

For production:

```bash
npm run build
npm run start
```

## Testing

```bash
npm test               # unit + integration (Vitest) — needs DATABASE_URL reachable
npm run test:e2e       # Playwright end-to-end (builds + starts the app)
```

> Integration tests `TRUNCATE` the `links`/`clicks` tables between cases and run
> serially (a single shared database), so point `DATABASE_URL` at a database you
> are comfortable wiping.

## Deploying to Vercel

The app lives at the repo root, so Vercel auto-detects Next.js.

1. Import this repo in Vercel (or run `vercel link` from the project directory).
2. Set environment variables for the **Production** environment
   (Project Settings → Environment Variables):

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Supabase **transaction pooler** string (see below) |
   | `IP_HASH_SALT` | a long random string |
   | `NEXT_PUBLIC_BASE_URL` | your production URL, e.g. `https://your-app.vercel.app` |

3. Deploy: `vercel deploy --prod` (or push to the connected Git branch).

### Use the connection pooler, not the direct connection

Vercel's serverless runtime **cannot reach Supabase's direct connection**
(`db.<ref>.supabase.co:5432`) — it is IPv6-only and Vercel functions can't route
to it, so every query fails and `GET /api/health` reports `db: "down"`. Use the
**Transaction pooler** instead (Supabase dashboard → **Connect** →
**Transaction pooler**). It is IPv4 and built for serverless:

```
postgresql://postgres.<ref>:<password>@aws-1-<region>.pooler.supabase.com:6543/postgres?sslmode=no-verify
```

- The host prefix may be `aws-1-` (newer projects) or `aws-0-` — copy the exact
  host shown in your dashboard.
- Percent-encode special characters in the password (`@` → `%40`).
- `?sslmode=no-verify` lets `pg` connect over TLS without rejecting Supabase's
  self-signed certificate chain.

For **local development** the direct connection (`:5432`) works fine; the pooler
is only required on serverless.

## API

Base URL defaults to `http://localhost:3000` (`NEXT_PUBLIC_BASE_URL`).

### `POST /api/links`

Create a short link.

```bash
curl -X POST http://localhost:3000/api/links \
  -H 'content-type: application/json' \
  -d '{"url":"https://example.com/some/very/long/path"}'
```

`201`:

```json
{
  "shortCode": "aZ09bYx",
  "shortUrl": "http://localhost:3000/aZ09bYx",
  "originalUrl": "https://example.com/some/very/long/path"
}
```

Errors return a JSON envelope `{ "error": { "code", "message" } }`:
`400 invalid_url`, `400 invalid_body`, `429 rate_limited` (with `Retry-After`),
`500 server_error`.

### `GET /:code`

Redirects (`302`) to the original URL and records a click. Returns `404` for an
unknown or malformed code.

```bash
curl -i http://localhost:3000/aZ09bYx
```

### `GET /api/links/:code/stats`

```bash
curl http://localhost:3000/api/links/aZ09bYx/stats
```

`200`:

```json
{
  "shortCode": "aZ09bYx",
  "originalUrl": "https://example.com/some/very/long/path",
  "clickCount": 3,
  "createdAt": "2026-06-03T12:00:00.000Z",
  "recent": [
    { "clickedAt": "...", "referrer": "...", "userAgent": "..." }
  ]
}
```

`404 not_found` for an unknown code.

### `GET /api/health`

```bash
curl http://localhost:3000/api/health
# {"status":"ok","db":"up"}   (503 with db:"down" when unreachable)
```

## Project layout

```
src/
  app/
    page.tsx                      # home: create form + recent links
    ShortenForm.tsx               # client form component
    [code]/route.ts               # GET /:code redirect resolver
    api/
      links/route.ts              # POST /api/links
      links/[code]/stats/route.ts # GET stats
      health/route.ts             # GET health
  db/
    schema.ts                     # Drizzle tables (links, clicks)
    client.ts                     # pooled Drizzle client
    queries.ts                    # data-access functions
  lib/
    codes.ts                      # base62 short-code generation
    validate-url.ts               # URL validation + SSRF guard
    rate-limit.ts                 # in-memory token-bucket limiter
    request.ts                    # client IP + IP hashing
    http.ts                       # JSON error envelope
  tests/db-setup.ts               # integration reset helper
e2e/shorten.spec.ts               # Playwright happy path
drizzle/                          # generated migrations
```

## Privacy & security notes

- Visitor IPs are **hashed** (SHA-256 + salt) before storage; raw IPs are never persisted.
- Link creation is rate-limited per IP (`RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS`).
- Submitted URLs are validated and blocked from pointing at loopback / private /
  link-local addresses (SSRF guard).
