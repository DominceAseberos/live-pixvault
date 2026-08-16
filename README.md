# PIXVAULT

PIXVAULT is a React resource vault for designers and frontend developers. It combines a curated UI-component catalog with live GIF, icon, photo, and inspiration feeds, while keeping the browsing experience account-free.

## Stack

- React 18 + TypeScript
- Vite 8
- React Router 7
- Tailwind CSS + Radix/shadcn primitives
- Framer Motion
- TanStack Query
- Supabase for the generated component catalog
- Vitest + Testing Library

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Story-driven landing page and resource overview |
| `/components` | Curated + generated UI component catalog |
| `/gifs` | Reddit GIF discovery |
| `/icons` | Iconify search, copy, and download |
| `/photos` | Picsum photo discovery and download |
| `/inspiration` | Design/frontend feeds from RSS, Hacker News, and GitHub |
| `*` | Branded 404 recovery page |

Use **Ctrl/Cmd + K** to open quick navigation.

## Local setup

```bash
npm install
npm run dev
```

Optional Supabase reads require:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The browser remains functional without those variables; generated database components simply do not load.

The `ai-designer` Supabase Edge Function is server-side only and additionally requires:

```env
GROQ_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
AI_DESIGNER_SECRET=
ALLOWED_ORIGIN=
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` or `AI_DESIGNER_SECRET` to client-side Vite variables.

## Quality gates

```bash
npx tsc --noEmit
npm run lint
npm run test -- --run
npm run build
npm audit
```

Current hardened baseline (2026-08-16): typecheck passes, tests pass, production build passes, ESLint has zero errors, and npm audit reports zero vulnerabilities. The remaining ESLint messages are non-blocking Fast Refresh warnings in generated shadcn primitive files.

## Architecture and operations

See [`DOCUMENTATION.md`](./DOCUMENTATION.md) for the route map, file structure, state ownership, data flows, Supabase schema/RLS model, security controls, UX decisions, implementation timeline, and maintenance guidance.
