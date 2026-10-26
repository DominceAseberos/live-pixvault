import { XMLParser } from "fast-xml-parser";
import type { ApiRequest, ApiResponse } from "../lib/api.js";
import { asRecord, errorMessage, queryString, setReadOnlyHeaders } from "../lib/api.js";
import { getRedis, REDIS_KEYS } from "../lib/redis.js";

const CRAWLER_TTL_SECONDS = 3600;

interface FeedItem {
  id?: string | number;
  title: string;
  link: string;
  thumbnail?: string;
  pubDate: string;
  description: string;
  source: string;
  points?: number;
  categories?: string[];
}

interface InspirationPayload {
  source: string;
  updatedAt: string;
  items: FeedItem[];
  fallback?: boolean;
}

interface StackExchangeResponse {
  items?: Array<{
    question_id?: number;
    title?: string;
    link?: string;
    creation_date?: number;
    score?: number;
    answer_count?: number;
    tags?: string[];
    owner?: { profile_image?: string };
  }>;
}

interface HackerNewsResponse {
  hits?: Array<{
    objectID?: string;
    title?: string;
    url?: string;
    created_at?: string;
    points?: number;
    story_text?: string;
  }>;
}

interface GitHubResponse {
  items?: Array<{
    id?: number;
    full_name?: string;
    html_url?: string;
    description?: string | null;
    updated_at?: string;
    stargazers_count?: number;
    topics?: string[];
    owner?: { avatar_url?: string };
  }>;
}

const RSS_FEEDS: Record<string, { url: string; label: string }> = {
  "css-tricks": { url: "https://css-tricks.com/feed/", label: "CSS-Tricks" },
  smashing: { url: "https://www.smashingmagazine.com/feed/", label: "Smashing Magazine" },
  awwwards: { url: "https://www.awwwards.com/blog/feed/", label: "Awwwards" },
  codrops: { url: "https://tympanus.net/codrops/feed/", label: "Codrops" },
  devto: { url: "https://dev.to/feed/tag/webdev", label: "Dev.to UI/UX" },
  webdev: { url: "https://web.dev/feed.xml", label: "web.dev" },
  alistapart: { url: "https://alistapart.com/main/feed/", label: "A List Apart" },
  uxcollective: { url: "https://uxdesign.cc/feed", label: "UX Collective" },
};

const decodeEntities = (value: string) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@" });
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : value == null ? [] : [value]);
const textValue = (value: unknown): string => {
  if (typeof value === "string" || typeof value === "number") return String(value);
  const record = asRecord(value);
  const text = record["#text"] ?? record._text ?? record.cdata;
  return typeof text === "string" || typeof text === "number" ? String(text) : "";
};

const linkValue = (value: unknown): string => {
  for (const candidate of asArray(value)) {
    if (typeof candidate === "string" && candidate.startsWith("http")) return candidate;
    const record = asRecord(candidate);
    const href = record["@href"];
    if (typeof href === "string" && href.startsWith("http")) return href;
  }
  return "";
};

const categoryValues = (value: unknown): string[] =>
  asArray(value)
    .map((entry) => {
      if (typeof entry === "string") return entry;
      const record = asRecord(entry);
      const term = record["@term"];
      return typeof term === "string" ? term : textValue(entry);
    })
    .filter(Boolean);

// Reddit RSS bypasses Cloudflare/Vercel JSON blocking
async function fetchRedditRss(subreddit: string): Promise<FeedItem[]> {
  const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/.rss?sort=hot`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) throw new Error(`Reddit RSS returned status ${response.status}`);

  const text = await response.text();
  const parsed = asRecord(xmlParser.parse(text));
  const feed = asRecord(parsed.feed);
  const entries = asArray(feed.entry);

  return entries.slice(0, 15).map((entry) => {
    const item = asRecord(entry);
    const title = decodeEntities(textValue(item.title) || "Untitled Reddit Post");
    const link = linkValue(item.link) || `https://reddit.com/r/${subreddit}`;
    const content = textValue(item.content);
    // Extract thumbnail or img src if present
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    const thumbnail = imgMatch ? decodeEntities(imgMatch[1]) : "";
    const cleanDesc = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);

    return {
      title,
      link,
      thumbnail,
      pubDate: textValue(item.updated) || textValue(item.published) || new Date().toISOString(),
      description: cleanDesc || `Trending discussion in r/${subreddit}`,
      source: `r/${subreddit}`,
      points: 100,
      categories: ["reddit", subreddit],
    };
  }).filter((item) => item.title && item.link);
}

async function fetchReddit(source: string): Promise<FeedItem[]> {
  const subreddit = source.replace("reddit-", "") || "webdev";
  try {
    return await fetchRedditRss(subreddit);
  } catch (rssError) {
    console.warn(`Reddit RSS failed for r/${subreddit}, trying fallback:`, rssError);
    return getFallbackItems(source);
  }
}

async function fetchStackOverflow(): Promise<FeedItem[]> {
  // Use 'frontend' or 'css' tag to ensure ample hot results
  const response = await fetch(
    "https://api.stackexchange.com/2.3/questions?order=desc&sort=hot&tagged=css&site=stackoverflow&pagesize=15",
    {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    },
  );
  if (!response.ok) throw new Error(`Stack Overflow returned ${response.status}`);

  const json = (await response.json()) as StackExchangeResponse;
  return (json.items ?? [])
    .filter((item) => item.title && item.link)
    .map((item) => ({
      id: item.question_id,
      title: decodeEntities(item.title ?? "Untitled"),
      link: item.link ?? "https://stackoverflow.com",
      thumbnail: item.owner?.profile_image ?? "",
      pubDate: new Date((item.creation_date ?? Date.now() / 1000) * 1000).toISOString(),
      points: item.score ?? 0,
      source: "Stack Overflow",
      description: `Score: ${item.score ?? 0} · Answers: ${item.answer_count ?? 0} · Tags: ${(item.tags ?? []).join(", ")}`,
      categories: item.tags ?? ["stackoverflow"],
    }));
}

async function fetchHackerNews(): Promise<FeedItem[]> {
  const response = await fetch(
    "https://hn.algolia.com/api/v1/search?tags=story&query=web+design+UI+UX+frontend&hitsPerPage=15",
    { signal: AbortSignal.timeout(8_000) },
  );
  if (!response.ok) throw new Error(`Hacker News returned ${response.status}`);
  const json = (await response.json()) as HackerNewsResponse;
  return (json.hits ?? [])
    .filter((hit) => hit.title && (hit.url || hit.objectID))
    .map((hit) => ({
      id: hit.objectID,
      title: hit.title ?? "Untitled",
      link: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      pubDate: hit.created_at ?? new Date().toISOString(),
      points: hit.points ?? 0,
      source: "Hacker News",
      description: hit.story_text?.replace(/<[^>]+>/g, "").slice(0, 180) ?? "",
      categories: ["hackernews"],
    }));
}

async function fetchGitHub(): Promise<FeedItem[]> {
  const response = await fetch(
    "https://api.github.com/search/repositories?q=topic:frontend+topic:ui+stars:>200&sort=stars&order=desc&per_page=15",
    {
      headers: { "User-Agent": "PIXVAULT-Crawler", Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(8_000),
    },
  );
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  const json = (await response.json()) as GitHubResponse;
  return (json.items ?? [])
    .filter((repo) => repo.full_name && repo.html_url)
    .map((repo) => ({
      id: repo.id,
      title: repo.full_name ?? "Untitled repository",
      link: repo.html_url ?? "https://github.com",
      description: repo.description ?? "",
      pubDate: repo.updated_at ?? new Date().toISOString(),
      points: repo.stargazers_count ?? 0,
      source: "GitHub UI",
      thumbnail: repo.owner?.avatar_url ?? "",
      categories: repo.topics ?? ["github"],
    }));
}

async function fetchRss(source: string, feed: { url: string; label: string }): Promise<FeedItem[]> {
  const response = await fetch(feed.url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5",
    },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`${feed.label} feed returned ${response.status}`);

  const parsed = asRecord(xmlParser.parse(await response.text()));
  const rss = asRecord(parsed.rss);
  const channel = asRecord(rss.channel);
  const atom = asRecord(parsed.feed);
  const entries = channel.item ? asArray(channel.item) : asArray(atom.entry);
  const feedTitle = textValue(channel.title) || textValue(atom.title) || feed.label;

  return entries
    .slice(0, 15)
    .map((entry) => {
      const item = asRecord(entry);
      const title = textValue(item.title) || "Untitled";
      const link = linkValue(item.link) || textValue(item.link) || feed.url;
      const description = textValue(item.description) || textValue(item.summary) || textValue(item.content) || "";
      const enclosure = asRecord(item.enclosure);
      const mediaThumbnail = asRecord(item["media:thumbnail"]);
      const mediaContent = asRecord(item["media:content"]);
      const thumbnail =
        [mediaThumbnail["@url"], mediaContent["@url"], enclosure["@url"]].find(
          (value): value is string => typeof value === "string" && value.startsWith("http"),
        ) ?? "";

      return {
        title: decodeEntities(title),
        link,
        thumbnail,
        pubDate:
          textValue(item.pubDate) || textValue(item.published) || textValue(item.updated) || new Date().toISOString(),
        description: decodeEntities(description.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 180)),
        source: feedTitle,
        categories: categoryValues(item.category).length ? categoryValues(item.category) : [source],
      };
    })
    .filter((item) => item.title && item.link);
}

function getFallbackItems(source: string): FeedItem[] {
  const now = new Date().toISOString();
  return [
    {
      id: "curated_1",
      title: "Modern Fluid Typography and Responsive Layout Systems with CSS Clamp",
      link: "https://css-tricks.com",
      description: "A deep dive into fluid scales, dynamic modular grids, and proportional typography in modern frontend design.",
      pubDate: now,
      source: "Design Digest",
      points: 245,
      categories: ["css", "frontend"],
    },
    {
      id: "curated_2",
      title: "Building Micro-Interactions with Tailwind CSS and Framer Motion",
      link: "https://tympanus.net/codrops",
      description: "Tactile feedback patterns, physics-based springs, and accessible gesture design for web apps.",
      pubDate: now,
      source: "Codrops",
      points: 189,
      categories: ["ui", "animation"],
    },
    {
      id: "curated_3",
      title: "Designing Accessible Color Contrast Ratios for Dark Mode Interfaces",
      link: "https://smashingmagazine.com",
      description: "Guidelines and perceptual contrast algorithms (APCA) for accessible, strain-free dark interfaces.",
      pubDate: now,
      source: "Smashing Magazine",
      points: 312,
      categories: ["accessibility", "design"],
    },
    {
      id: "curated_4",
      title: "10 Principles for Crafting Delightful Dashboard Visualizations",
      link: "https://dev.to",
      description: "Clear data hierarchies, progressive disclosure, and chart typography for high-density dashboards.",
      pubDate: now,
      source: "Dev Community",
      points: 156,
      categories: ["dashboard", "ux"],
    },
  ];
}

async function fetchSource(source: string): Promise<FeedItem[]> {
  if (source.startsWith("reddit-") || source === "reddit") return fetchReddit(source);
  if (source === "stackoverflow" || source === "so") return fetchStackOverflow();
  if (source === "hn" || source === "hackernews") return fetchHackerNews();
  if (source === "github") return fetchGitHub();
  if (RSS_FEEDS[source]) return fetchRss(source, RSS_FEEDS[source]);
  return getFallbackItems(source);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setReadOnlyHeaders(res, 300);
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const source = queryString(req, "source", "hn").toLowerCase();
  const cacheKey = REDIS_KEYS.crawler(source);

  // Safe Redis access: does not crash the function if Redis is absent or unreachable
  let redis = null;
  try {
    redis = getRedis();
    const cached = await redis.get<InspirationPayload>(cacheKey);
    if (cached?.items?.length) return res.status(200).json({ cached: true, data: cached });
  } catch {
    // Redis unavailable or failed - proceed to live fetch without throwing 502
  }

  try {
    const items = await fetchSource(source);
    const finalItems = items.length > 0 ? items : getFallbackItems(source);

    const payload: InspirationPayload = {
      source,
      updatedAt: new Date().toISOString(),
      items: finalItems,
    };

    if (redis) {
      void redis.set(cacheKey, payload, { ex: CRAWLER_TTL_SECONDS }).catch(() => {});
    }

    return res.status(200).json({ cached: false, data: payload });
  } catch (error) {
    console.warn(`API /api/inspiration?source=${source} live fetch failed, serving curated fallback:`, error);
    const fallbackPayload: InspirationPayload = {
      source,
      updatedAt: new Date().toISOString(),
      items: getFallbackItems(source),
      fallback: true,
    };
    return res.status(200).json({ cached: false, fallback: true, data: fallbackPayload });
  }
}
