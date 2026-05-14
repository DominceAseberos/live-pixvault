# PIXVAULT — Project Documentation

**Version:** 1.0.0
**Status:** Live
**Live URL:** [live-pixvault.vercel.app](https://live-pixvault.vercel.app)
**Repository:** [github.com/DominceAseberos/live-pixvault](https://github.com/DominceAseberos/live-pixvault)
**Author:** Domince Aseberos
**Last Updated:** May 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Solution](#3-solution)
4. [Features](#4-features)
5. [System Architecture](#5-system-architecture)
6. [Technology Stack](#6-technology-stack)
7. [External APIs & Data Sources](#7-external-apis--data-sources)
8. [Application Flow](#8-application-flow)
9. [Component Breakdown](#9-component-breakdown)
10. [Known Limitations](#10-known-limitations)
11. [Future Improvements](#11-future-improvements)
12. [Lessons Learned](#12-lessons-learned)

---

## 1. Project Overview

**PIXVAULT** is a free, open-source web application that aggregates design resources from multiple public APIs into a single, unified interface. It provides designers and frontend developers with instant access to trending GIFs, copy-paste UI components, SVG icons, stock photography, and curated design articles — all without requiring an account, API key, or payment.

The application is built as a Single Page Application (SPA) using React and TypeScript, deployed on Vercel, and powered entirely by free public APIs.

> **Core Principle:** Everything in PIXVAULT is free, live, and requires zero setup from the user.

---

## 2. Problem Statement

Designers and developers frequently need access to a variety of resources during their workflow:

- Animated GIFs for mockups, presentations, or UI feedback states
- Ready-made UI components to prototype quickly
- SVG icons that match their design system
- Stock photography for layouts and wireframes
- Design articles and inspiration to stay current

The problem is that these resources are **scattered across dozens of different platforms**, many of which require account registration, API keys, or paid subscriptions. Switching between tools breaks focus and slows down the creative process.

**PIXVAULT solves this by consolidating everything into one place.**

---

## 3. Solution

PIXVAULT acts as a **resource aggregator** — it does not store any content itself. Instead, it fetches data in real time from trusted public APIs and presents it through a clean, consistent interface.

Key design decisions:

- **No backend required** — all data is fetched client-side from public APIs
- **No authentication** — users can access everything immediately
- **No storage** — content is fetched live; session-level caching reduces redundant requests
- **No cost** — the application and all its data sources are free

---

## 4. Features

### 4.1 GIF Library
- Fetches trending GIFs live from Reddit's public JSON API
- Supports search across multiple subreddits (`r/gifs`, `r/reactiongifs`, `r/HighQualityGifs`, `r/animatedpixelart`)
- Masonry grid layout with lazy loading
- One-click URL copy and bookmark functionality
- Pagination with "Load More" support
- Debounced search input (500ms) to reduce API calls

### 4.2 UI Component Library
- 35+ hand-crafted CSS/HTML components across 12 categories
- Categories: Buttons, Cards, Inputs, Loaders, Checkboxes, Toggles, Badges, Alerts, Avatars, Tooltips, Progress
- Live interactive previews rendered in sandboxed iframes
- One-click HTML copy
- Code view toggle (preview ↔ source)
- Real-time search by component name or category
- Result count indicator

### 4.3 Icon Search
- Searches 200,000+ icons across 150+ icon sets via the Iconify API
- Supported sets: Lucide, Material Design Icons, Heroicons, Tabler, Phosphor, Feather
- Quick-tag shortcuts for common searches
- Copy SVG source to clipboard
- Download SVG file directly
- Debounced search with set filtering

### 4.4 Photo Gallery
- Fetches high-quality stock photos from Lorem Picsum (Unsplash photographers)
- Masonry layout with responsive columns
- Shuffle button for random collections
- Copy image URL (full resolution 1920×1080)
- Download image directly
- Pagination with "Load More"
- No attribution required

### 4.5 Inspiration Feed
- Aggregates articles from 10 sources:
  - CSS-Tricks
  - Smashing Magazine
  - Awwwards
  - Codrops
  - Dev.to (Web Dev tag)
  - web.dev (Google)
  - A List Apart
  - UX Collective
  - Hacker News (Design/Frontend stories via Algolia)
  - GitHub Trending (Frontend/UI repositories)
- Featured article card with full-width layout
- Article type classification (Tutorial, Showcase, Article)
- Relative timestamps ("2h ago", "Yesterday")
- Bookmark/save articles locally
- Session-level caching (6-hour TTL) to avoid rate limits

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    React SPA (Vite)                       │  │
│  │                                                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │  │
│  │  │   GIF    │  │   UI     │  │  Icons   │  │ Photos  │  │  │
│  │  │ Showcase │  │Components│  │ Showcase │  │ Gallery │  │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘  │  │
│  │       │             │             │              │        │  │
│  │  ┌────▼─────────────▼─────────────▼──────────────▼────┐  │  │
│  │  │              Session Cache (sessionStorage)         │  │  │
│  │  └────┬─────────────┬─────────────┬──────────────┬────┘  │  │
│  └───────┼─────────────┼─────────────┼──────────────┼───────┘  │
└──────────┼─────────────┼─────────────┼──────────────┼──────────┘
           │             │             │              │
    ┌──────▼──┐   ┌──────▼──┐  ┌──────▼──┐   ┌──────▼──────┐
    │ Reddit  │   │Iconify  │  │ Picsum  │   │ RSS2JSON /  │
    │  API    │   │  API    │  │  API    │   │ HN Algolia  │
    └─────────┘   └─────────┘  └─────────┘   └─────────────┘
```

### Data Flow

1. User opens the application in a browser
2. React renders the UI shell immediately (no loading delay)
3. Each section fetches its data independently on mount
4. Session cache is checked first — if valid data exists, no API call is made
5. Fetched data is rendered progressively with skeleton loaders during fetch
6. User interactions (search, filter, paginate) trigger new fetches with debouncing

---

## 6. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| UI Framework | React | 18.3.1 | Component-based UI |
| Language | TypeScript | 5.8.3 | Type safety |
| Build Tool | Vite | 5.4.19 | Fast dev server & bundler |
| Styling | Tailwind CSS | 3.4.17 | Utility-first CSS |
| UI Primitives | Radix UI / shadcn | Various | Accessible components |
| State Management | React useState / useMemo | — | Local component state |
| Server State | TanStack Query | 5.83.0 | (Available, not yet used for all fetches) |
| Animations | Framer Motion | 12.35.1 | Page and component animations |
| Routing | React Router | 6.30.1 | Client-side routing |
| Icons | Lucide React | 0.462.0 | UI icons |
| Notifications | Sonner | 1.7.4 | Toast notifications |
| Testing | Vitest + Testing Library | 3.2.4 | Unit tests |
| Deployment | Vercel | — | Hosting & CI/CD |

---

## 7. External APIs & Data Sources

All APIs used are free and require no authentication key from the end user.

### 7.1 Reddit JSON API
- **Endpoint:** `https://www.reddit.com/r/{subreddit}/hot.json`
- **Used for:** GIF Library
- **Auth required:** No
- **Rate limit:** ~60 requests/minute per IP (unauthenticated)
- **Notes:** Reddit's public JSON API is unofficial and subject to change. No API key needed for read-only access.

### 7.2 Iconify API
- **Endpoint:** `https://api.iconify.design/search?query={q}`
- **Used for:** Icon Search
- **Auth required:** No
- **Rate limit:** Not publicly documented; generous for normal usage
- **Notes:** Returns icon metadata. SVG files are fetched individually per icon on demand.

### 7.3 Lorem Picsum
- **Endpoint:** `https://picsum.photos/v2/list?page={n}&limit={n}`
- **Used for:** Photo Gallery
- **Auth required:** No
- **Rate limit:** None documented
- **Notes:** Photos are sourced from Unsplash photographers. No attribution required per Picsum's terms.

### 7.4 RSS2JSON
- **Endpoint:** `https://api.rss2json.com/v1/api.json?rss_url={url}`
- **Used for:** Inspiration Feed (RSS sources)
- **Auth required:** No (free tier)
- **Rate limit:** 10,000 requests/day on free tier
- **Notes:** Converts RSS/Atom feeds to JSON. Free tier has a daily request cap.

### 7.5 HN Algolia API
- **Endpoint:** `https://hn.algolia.com/api/v1/search?tags=story&query={q}`
- **Used for:** Inspiration Feed (Hacker News tab)
- **Auth required:** No
- **Rate limit:** Not publicly documented; generous
- **Notes:** Official Hacker News search API provided by Algolia.

### 7.6 GitHub REST API
- **Endpoint:** `https://api.github.com/search/repositories?q=topic:frontend`
- **Used for:** Inspiration Feed (GitHub Trending tab)
- **Auth required:** No (public endpoints)
- **Rate limit:** 60 requests/hour (unauthenticated)
- **Notes:** Returns public repository data. Rate limit is per IP address.

---

## 8. Application Flow

### Initial Load
```
Browser opens URL
       ↓
Vite serves index.html + JS bundle
       ↓
React mounts App component
       ↓
Providers initialize (QueryClient, TooltipProvider, Router)
       ↓
Index page renders all section components
       ↓
Each component fires its own useEffect → fetch data
       ↓
Skeleton loaders shown during fetch
       ↓
Data renders progressively as each fetch completes
```

### Search Flow (GIF / Icon)
```
User types in search input
       ↓
Debounce timer starts (400–500ms)
       ↓
Timer resets on each keystroke
       ↓
Timer completes → API call fires
       ↓
Loading state shown
       ↓
Results replace current content
```

### Caching Flow (Inspiration Feed)
```
User clicks a source tab
       ↓
Check sessionStorage for cached data
       ↓
Cache hit (< 6 hours old) → render immediately
Cache miss → fetch from API → store in sessionStorage → render
```

---

## 9. Component Breakdown

| Component | File | Data Source | Key Features |
|-----------|------|-------------|--------------|
| Navbar | `Navbar.tsx` | Static | Responsive, mobile menu, smooth scroll links |
| HeroSection | `HeroSection.tsx` | Static | Animated entrance, CTA buttons, background effects |
| StatsBar | `StatsBar.tsx` | Static | Animated counters on scroll |
| GifShowcase | `GifShowcase.tsx` | Reddit API | Search, subreddit tabs, masonry grid, pagination |
| UIComponents | `UIComponents.tsx` | Static (embedded) | Search, category filter, iframe previews, code copy |
| IconShowcase | `IconShowcase.tsx` | Iconify API | Search, set filter, SVG copy/download |
| IllustrationGallery | `IllustrationGallery.tsx` | Picsum API | Masonry grid, shuffle, URL copy, download |
| InspirationFeed | `InspirationFeed.tsx` | RSS2JSON / HN / GitHub | 10 sources, session cache, bookmarks |
| Footer | `Footer.tsx` | Static | API credits, GitHub link |

---

## 10. Known Limitations

### API Constraints

| Limitation | Impact | Affected Feature |
|------------|--------|-----------------|
| Reddit API is unofficial and unauthenticated | May break without notice; rate limited at ~60 req/min | GIF Library |
| RSS2JSON free tier caps at 10,000 req/day | High traffic could exhaust the daily quota | Inspiration Feed |
| GitHub API limited to 60 req/hour (unauthenticated) | Frequent page refreshes may hit the limit | GitHub Trending tab |
| Iconify SVG fetches are per-icon | Loading 48 icons = 48 individual HTTP requests | Icon Search |
| Lorem Picsum has no search/filter | Cannot search photos by keyword or category | Photo Gallery |

### Application Constraints

- **No user accounts** — bookmarks and saved items are stored in component state only and are lost on page refresh
- **No persistent storage** — session cache clears when the browser tab is closed
- **No offline support** — the application requires an active internet connection for all content
- **CORS dependency** — all API calls are made client-side; any API that blocks browser CORS requests will fail silently
- **Single page** — all content loads on one route; deep linking to specific sections is not supported
- **No dark/light mode toggle** — the application is dark-mode only by design

### Content Constraints

- GIF content is sourced from Reddit and is not moderated by PIXVAULT
- Inspiration feed articles are fetched as-is from third-party RSS feeds; content accuracy is not guaranteed
- Stock photos are served by Lorem Picsum; availability depends on their uptime

---

## 11. Future Improvements

The following features are identified as high-value additions for future versions:

### Short Term
- [ ] Persist bookmarks to `localStorage` so they survive page refresh
- [ ] Add a "Saved" tab that shows all bookmarked items across sections
- [ ] Add keyword search to the Photo Gallery using a different API (e.g., Pexels)
- [ ] Add copy-as-React and copy-as-Tailwind options to UI Components
- [ ] Improve mobile layout for the Inspiration Feed

### Medium Term
- [ ] Add user authentication (optional) to sync bookmarks across devices
- [ ] Add a "Collections" feature to group saved resources
- [ ] Integrate Pexels or Pixabay API for searchable stock photos
- [ ] Add more UI component categories (Navigation, Modals, Tables, Forms)
- [ ] Add a color palette generator section

### Long Term
- [ ] Backend API to proxy third-party requests and handle rate limiting centrally
- [ ] User-submitted components with moderation
- [ ] Browser extension for saving resources from any website
- [ ] Export saved resources as a ZIP file

---

## 12. Lessons Learned

### Technical

**Client-side API aggregation is powerful but fragile.** Relying on multiple third-party APIs means any one of them can change, go down, or rate-limit the application. A backend proxy layer would make the application more resilient and allow for centralized caching and rate limit management.

**Session caching significantly improves perceived performance.** Storing API responses in `sessionStorage` with a TTL reduced redundant network requests and made tab switching between inspiration sources feel instant.

**Debouncing is essential for search inputs.** Without debouncing, every keystroke would fire an API request. A 400–500ms debounce window reduced API calls by approximately 80% during typical search usage.

**Sandboxed iframes are the right approach for live component previews.** Rendering third-party HTML/CSS inside the main React DOM would cause style conflicts. Using `sandbox="allow-scripts"` iframes isolates each component preview safely.

### Design

**A consistent dark design system reduces cognitive load.** Using a single color palette with defined semantic roles (primary, secondary, accent) made it easy to maintain visual consistency across all sections without per-component style decisions.

**Progressive loading with skeleton screens is better than a single loading spinner.** Each section loads independently, so users can interact with loaded sections while others are still fetching.

---

## Appendix A — Project File Structure

```
live-pixvault/
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui primitives (48 components)
│   │   ├── Navbar.tsx
│   │   ├── HeroSection.tsx
│   │   ├── StatsBar.tsx
│   │   ├── GifShowcase.tsx
│   │   ├── UIComponents.tsx
│   │   ├── IconShowcase.tsx
│   │   ├── IllustrationGallery.tsx
│   │   ├── InspirationFeed.tsx
│   │   ├── NavLink.tsx
│   │   └── Footer.tsx
│   ├── hooks/
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── DOCUMENTATION.md               # This file
├── README.md                      # Project overview
├── SKILLS.md                      # Design system reference
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Appendix B — API Rate Limit Summary

| API | Rate Limit | Reset Period | Caching Strategy |
|-----|-----------|--------------|-----------------|
| Reddit JSON | ~60 req/min | Per minute | None (live) |
| Iconify Search | Generous | — | None (live) |
| Iconify SVG | Generous | — | In-memory per session |
| Lorem Picsum | None | — | None (live) |
| RSS2JSON | 10,000 req/day | Daily | sessionStorage, 6h TTL |
| HN Algolia | Generous | — | sessionStorage, 6h TTL |
| GitHub REST | 60 req/hour | Hourly | sessionStorage, 6h TTL |

---

*This document was written as part of the PIXVAULT project portfolio submission.*
*© 2026 Domince Aseberos — Open source under the MIT License.*
