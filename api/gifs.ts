import type { ApiRequest, ApiResponse } from "../lib/api.js";
import { errorMessage, queryString, setReadOnlyHeaders } from "../lib/api.js";
import { getRedis, REDIS_KEYS } from "../lib/redis.js";

const CACHE_TTL_SECONDS = 1800;
const ALLOWED_SUBREDDITS = new Set(["gifs", "reactiongifs", "highqualitygifs", "animatedpixelart", "cinemagraphs", "webdev"]);

interface RedditImageSource { url?: string }
interface RedditPreviewImage {
  source?: RedditImageSource;
  resolutions?: RedditImageSource[];
  variants?: { gif?: { source?: RedditImageSource }; mp4?: { source?: RedditImageSource } };
}
interface RedditPost {
  id?: string;
  title?: string;
  url?: string;
  permalink?: string;
  subreddit?: string;
  score?: number;
  created_utc?: number;
  thumbnail?: string;
  preview?: { images?: RedditPreviewImage[] };
}
interface RedditListing { data?: { children?: Array<{ data?: RedditPost }>; after?: string | null } }
interface GifItem { id: string; title: string; url: string; gifUrl: string; previewUrl: string; subreddit: string; score: number; created: number }
interface GifPayload { items: GifItem[]; after: string | null; sub: string }

const decodeUrl = (value?: string) => value?.replace(/&amp;/g, "&") ?? "";

function extractGifUrl(post: RedditPost): string | null {
  if (post.url?.toLowerCase().endsWith(".gif")) return post.url;
  const preview = post.preview?.images?.[0];
  const gif = decodeUrl(preview?.variants?.gif?.source?.url);
  if (gif) return gif;

  const mp4 = decodeUrl(preview?.variants?.mp4?.source?.url);
  if (mp4) return mp4;

  if (post.url?.includes("imgur.com") && post.url.toLowerCase().endsWith(".gifv")) {
    return post.url.replace(/\.gifv$/i, ".gif");
  }

  if (post.url?.includes("i.redd.it") && /\.(gif|png|jpe?g)$/i.test(post.url)) return post.url;
  const source = decodeUrl(preview?.source?.url);
  if (source) return source;
  if (post.thumbnail?.startsWith("http")) return post.thumbnail;
  return null;
}

function getPreviewUrl(post: RedditPost): string {
  const resolutions = post.preview?.images?.[0]?.resolutions ?? [];
  const mid = resolutions[Math.min(2, Math.max(0, resolutions.length - 1))];
  const resolution = decodeUrl(mid?.url);
  if (resolution) return resolution;
  if (post.thumbnail?.startsWith("http")) return post.thumbnail;
  return "";
}

function fallbackPayload(sub: string): GifPayload {
  const now = Date.now() / 1000;
  return {
    sub,
    after: null,
    items: [1, 2, 3, 4].map((index) => ({
      id: `local_${index}`,
      title: `PIXVAULT curated animation ${index}`,
      url: "/gifs",
      gifUrl: `/assets/gifs/gif_${index}.gif`,
      previewUrl: `/assets/gifs/gif_${index}.gif`,
      subreddit: "pixvault",
      score: 0,
      created: now,
    })),
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setReadOnlyHeaders(res, 120);
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const requestedSub = queryString(req, "sub", "gifs");
  const normalizedSub = requestedSub.toLowerCase();
  const sub = ALLOWED_SUBREDDITS.has(normalizedSub) ? requestedSub : "gifs";
  const query = queryString(req, "q").slice(0, 80);
  const after = queryString(req, "after").slice(0, 120);
  const cacheKey = REDIS_KEYS.crawler(`gifs:${sub.toLowerCase()}:${query.toLowerCase() || "hot"}:${after || "first"}`);

  try {
    const redis = getRedis();
    const cached = await redis.get<GifPayload>(cacheKey);
    if (cached?.items?.length) return res.status(200).json({ cached: true, ...cached });

    const base = query
      ? `https://www.reddit.com/r/${encodeURIComponent(sub)}/search.json?q=${encodeURIComponent(query)}&restrict_sr=on&sort=relevance&limit=24`
      : `https://www.reddit.com/r/${encodeURIComponent(sub)}/hot.json?limit=24`;
    const endpoint = `${base}${after ? `&after=${encodeURIComponent(after)}` : ""}&raw_json=1`;

    const redditResponse = await fetch(endpoint, {
      headers: { "User-Agent": "PIXVAULT-GIF-Crawler/1.0 (+https://live-pixvault.vercel.app)", Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!redditResponse.ok) throw new Error(`Reddit returned ${redditResponse.status}`);

    const json = await redditResponse.json() as RedditListing;
    const items: GifItem[] = (json.data?.children ?? [])
      .map((child) => child.data)
      .filter((post): post is RedditPost => Boolean(post?.id && post.title))
      .map((post) => {
        const gifUrl = extractGifUrl(post);
        if (!gifUrl) return null;
        return {
          id: post.id ?? "unknown",
          title: post.title ?? "Untitled GIF",
          url: post.permalink ? `https://reddit.com${post.permalink}` : (post.url ?? "https://reddit.com"),
          gifUrl,
          previewUrl: getPreviewUrl(post) || gifUrl,
          subreddit: post.subreddit ?? sub,
          score: post.score ?? 0,
          created: post.created_utc ?? Date.now() / 1000,
        };
      })
      .filter((item): item is GifItem => item !== null);

    if (items.length === 0) throw new Error("Reddit returned no usable GIF media");

    const payload: GifPayload = { items, after: json.data?.after ?? null, sub };
    await redis.set(cacheKey, payload, { ex: CACHE_TTL_SECONDS });
    return res.status(200).json({ cached: false, ...payload });
  } catch (error) {
    console.warn(`API /api/gifs fallback for r/${sub}:`, errorMessage(error));
    return res.status(200).json({ cached: false, fallback: true, ...fallbackPayload(sub) });
  }
}
