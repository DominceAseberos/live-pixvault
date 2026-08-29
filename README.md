# PIXVAULT

PIXVAULT is an account-free resource vault for frontend developers and designers. It combines a curated UI component library with a safely recreated community archive, live/cached GIF discovery, Iconify search, photo discovery, and a server-side inspiration crawler.

## Current architecture

```text
React + Vite SPA
      |
      | same-origin /api/*
      v
Vercel Serverless Functions
      |
      +--> Upstash Redis
      |     - component:<id>
      |     - components:index
      |     - components:category:<slug>
      |     - crawler:<source>
      |
      +--> external read sources
      |     - Hacker News
      |     - GitHub
      |     - Reddit (with local GIF fallback)
      |     - Stack Overflow
      |     - RSS / Atom feeds
      |
      +--> optional Groq AI generation
```

The browser never receives the Upstash REST token. Redis access exists only in server-side `api/*`, `lib/*`, and maintenance scripts.

## Stack

- React 18 + TypeScript
- Vite 8
- React Router 7
- Tailwind CSS + Radix/shadcn primitives
- Framer Motion
- TanStack Query
- Vercel Serverless Functions
- Upstash Redis
- `fast-xml-parser` for server-side RSS/Atom crawling
- Vitest + Testing Library

`@supabase/supabase-js` remains a **development-only migration dependency** for the legacy import script. Supabase is no longer part of the application runtime.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page and resource overview |
| `/components` | Curated + Upstash component library |
| `/gifs` | Cached Reddit GIF discovery with local fallback |
| `/icons` | Iconify search, copy, and download |
| `/photos` | Picsum photo discovery and download |
| `/inspiration` | Cached design/frontend crawler feed |
| `*` | Branded 404 recovery page |

Vercel rewrites preserve SPA deep links, so directly opening or refreshing the routes above resolves to the React app.

Use **Ctrl/Cmd + K** to open quick navigation.

## Redis model

```text
component:<id>                  -> component JSON
components:index               -> sorted set, newest-first index
components:category:<slug>     -> sorted set per category
crawler:<source>               -> normalized feed/cache payload with TTL
ratelimit:<scope>:<ip>:<bucket> -> short-lived write/generation throttling
```

The components API supports server-side pagination/search/category filters instead of downloading the entire archive on every request.

## Environment

Create `.env.local` from `.env.example`.

Required:

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Optional protected mutations:

```env
ADMIN_SECRET=
COMPONENT_WRITE_SECRET=
```

Optional AI generation:

```env
AI_DESIGNER_SECRET=
GROQ_API_KEY=
```

Never create `VITE_UPSTASH_REDIS_REST_TOKEN` or any other client-prefixed database secret.

## Local development

```bash
npm install
npm run dev
```

The Vite development plugin mounts the same `/api/components`, `/api/gifs`, `/api/inspiration`, and `/api/generate` handlers used by Vercel, so a second backend process is not required.

## Maintenance scripts

```bash
npm run typecheck
npm run redis:rebuild
npm run components:generate -- 10
npm run migrate:dry
npm run migrate:write
```

`redis:rebuild` recreates existing Redis records with executable HTML removed and rebuilds category indexes. `components:generate` is optional and requires `GROQ_API_KEY`.

The legacy Supabase migration commands are retained only for recovery. The original PIXVAULT Supabase project became unreachable during the 2026-08-29 migration; 1,000 records had already reached Upstash and were safely recreated. The remaining legacy rows cannot currently be recovered from that deleted/unreachable source.

## Safety model

New components reject:

- `<script>`, `<iframe>`, `<object>`, `<embed>`, `<meta>`, `<base>`, `<link>`, and `<applet>`
- inline `on*=` event handlers
- `javascript:` and `data:text/html` URIs
- `action`, `formaction`, and `srcdoc`
- `<style>` for newly generated/community components

Legacy records use a separate recreation path: safe legacy CSS can remain for visual compatibility while executable tags, event handlers, navigation attributes, dangerous CSS imports, and executable URI patterns are removed. Failed legacy records are quarantined rather than served.

POST, DELETE, and AI-generation endpoints fail closed when their server secret is not configured. Redis-backed rate limiting adds a second control for configured write endpoints.

## Quality gate

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm audit --omit=dev
git diff --check
```

Current migration baseline (2026-08-29):

- TypeScript application project: pass
- TypeScript server/API project: pass
- ESLint: 0 errors; 7 generated shadcn Fast Refresh warnings
- Vitest: 13/13 tests pass
- Vite production build: pass
- npm audit: 0 vulnerabilities
- live Upstash rebuilt records: 1,000
- executable patterns remaining in rebuilt Redis component HTML: 0

See [`DOCUMENTATION.md`](./DOCUMENTATION.md) for the engineering architecture, flows, state ownership, migration history, security boundaries, and maintenance model.
