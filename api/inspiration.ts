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
}

interface RedditPost {
  id?: string;
  title?: string;
  permalink?: string;
  thumbnail?: string;
  created_utc?: number;
  score?: number;
  subreddit?: string;
  selftext?: string;
  url?: string;
  stickied?: boolean;
  preview?: { images?: Array<{ source?: { url?: string } }> };
}
interface RedditListing { data?: { children?: Array<{ data?: RedditPost }> } }
interface StackExchangeResponse { items?: Array<{ question_id?: number; title?: string; link?: string; creation_date?: number; score?: number; answer_count?: number; tags?: string[]; owner?: { profile_image?: string } }> }
interface HackerNewsResponse { hits?: Array<{ objectID?: string; title?: string; url?: string; created_at?: string; points?: number; story_text?: string }> }
interface GitHubResponse { items?: Array<{ id?: number; full_name?: string; html_url?: string; description?: string | null; updated_at?: string; stargazers_count?: number; topics?: string[]; owner?: { avatar_url?: string } }> }

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

const decodeEntities = (value: string) => value
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&amp;/g, "&");

async function fetchReddit(source: string): Promise<FeedItem[]> {
  const subreddit = source.replace("reddit-", "") || "webdev";
  const response = await fetch(`https://www.reddit.com/r/${encodeURIComponent(subreddit)}/hot.json?limit=15&raw_json=1`, {
    headers: { "User-Agent": "PIXVAULT-Inspiration/1.0 (+https://live-pixvault.vercel.app)", Accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Reddit returned ${response.status}`);

  const json = await response.json() as RedditListing;
  return (json.data?.children ?? [])
    .map((child) => child.data)
    .filter((post): post is RedditPost => Boolean(post?.title && !post.stickied))
    .map((post) => ({
      id: post.id,
      title: post.title ?? "Untitled",
      link: post.permalink ? `https://reddit.com${post.permalink}` : (post.url ?? "https://reddit.com"),
      thumbnail: post.thumbnail?.startsWith("http")
        ? post.thumbnail
        : post.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, "&") ?? "",
      pubDate: new Date((post.created_utc ?? Date.now() / 1000) * 1000).toISOString(),
      points: post.score ?? 0,
      source: `r/${post.subreddit ?? subreddit}`,
      description: post.selftext?.slice(0, 180) ?? "",
      categories: ["reddit", post.subreddit ?? subreddit],
    }));
}

async function fetchStackOverflow(): Promise<FeedItem[]> {
  const response = await fetch("https://api.stackexchange.com/2.3/questions?order=desc&sort=hot&tagged=css;tailwind-css;html;frontend&site=stackoverflow&pagesize=15", {
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Stack Overflow returned ${response.status}`);

  const json = await response.json() as StackExchangeResponse;
  return (json.items ?? []).filter((item) => item.title && item.link).map((item) => ({
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
  const response = await fetch("https://hn.algolia.com/api/v1/search?tags=story&query=web+design+UI+UX+frontend&hitsPerPage=15", { signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error(`Hacker News returned ${response.status}`);
  const json = await response.json() as HackerNewsResponse;
  return (json.hits ?? []).filter((hit) => hit.title && (hit.url || hit.objectID)).map((hit) => ({
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
  const response = await fetch("https://api.github.com/search/repositories?q=topic:frontend+topic:ui+stars:>200&sort=stars&order=desc&per_page=15", {
    headers: { "User-Agent": "PIXVAULT-Crawler", Accept: "application/vnd.github+json" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  const json = await response.json() as GitHubResponse;
  return (json.items ?? []).filter((repo) => repo.full_name && repo.html_url).map((repo) => ({
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

const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@" });
const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : value == null ? [] : [value];
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
const categoryValues = (value: unknown): string[] => asArray(value)
  .map((entry) => {
    if (typeof entry === "string") return entry;
    const record = asRecord(entry);
    const term = record["@term"];
    return typeof term === "string" ? term : textValue(entry);
  })
  .filter(Boolean);

async function fetchRss(source: string, feed: { url: string; label: string }): Promise<FeedItem[]> {
  const response = await fetch(feed.url, {
    headers: { "User-Agent": "PIXVAULT-Crawler/1.0 (+https://live-pixvault.vercel.app)", Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`${feed.label} feed returned ${response.status}`);

  const parsed = asRecord(xmlParser.parse(await response.text()));
  const rss = asRecord(parsed.rss);
  const channel = asRecord(rss.channel);
  const atom = asRecord(parsed.feed);
  const entries = channel.item ? asArray(channel.item) : asArray(atom.entry);
  const feedTitle = textValue(channel.title) || textValue(atom.title) || feed.label;

  return entries.slice(0, 15).map((entry) => {
    const item = asRecord(entry);
    const title = textValue(item.title) || "Untitled";
    const link = linkValue(item.link) || textValue(item.link) || feed.url;
    const description = textValue(item.description) || textValue(item.summary) || textValue(item.content) || "";
    const enclosure = asRecord(item.enclosure);
    const mediaThumbnail = asRecord(item["media:thumbnail"]);
    const mediaContent = asRecord(item["media:content"]);
    const thumbnail = [mediaThumbnail["@url"], mediaContent["@url"], enclosure["@url"]]
      .find((value): value is string => typeof value === "string" && value.startsWith("http")) ?? "";

    return {
      title,
      link,
      thumbnail,
      pubDate: textValue(item.pubDate) || textValue(item.published) || textValue(item.updated) || new Date().toISOString(),
      description: description.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 180),
      source: feedTitle,
      categories: categoryValues(item.category).length ? categoryValues(item.category) : [source],
    };
  }).filter((item) => item.title && item.link);
}

async function fetchSource(source: string): Promise<FeedItem[]> {
  if (source.startsWith("reddit-") || source === "reddit") return fetchReddit(source);
  if (source === "stackoverflow" || source === "so") return fetchStackOverflow();
  if (source === "hn" || source === "hackernews") return fetchHackerNews();
  if (source === "github") return fetchGitHub();
  if (RSS_FEEDS[source]) return fetchRss(source, RSS_FEEDS[source]);
  throw new Error(`Unknown inspiration source "${source}"`);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setReadOnlyHeaders(res, 300);
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const source = queryString(req, "source", "hn").toLowerCase();
  const cacheKey = REDIS_KEYS.crawler(source);

  try {
    const redis = getRedis();
    const cached = await redis.get<InspirationPayload>(cacheKey);
    if (cached?.items?.length) return res.status(200).json({ cached: true, data: cached });

    const items = await fetchSource(source);
    if (items.length === 0) return res.status(404).json({ error: `Source "${source}" returned no items.` });

    const payload: InspirationPayload = { source, updatedAt: new Date().toISOString(), items };
    await redis.set(cacheKey, payload, { ex: CRAWLER_TTL_SECONDS });
    return res.status(200).json({ cached: false, data: payload });
  } catch (error) {
    console.error(`API /api/inspiration?source=${source} error:`, error);
    return res.status(502).json({ error: errorMessage(error, "Failed to fetch inspiration feed") });
  }
}
