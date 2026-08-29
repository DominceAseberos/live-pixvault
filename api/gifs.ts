import { redis, REDIS_KEYS } from "../lib/redis.ts";

const CACHE_TTL_SECONDS = 1800; // 30 minutes cache

const extractGifUrl = (post: any): string | null => {
  if (post.url?.endsWith(".gif")) return post.url;
  if (post.preview?.images?.[0]?.variants?.gif?.source?.url) {
    return post.preview.images[0].variants.gif.source.url.replace(/&amp;/g, "&");
  }
  if (post.preview?.images?.[0]?.variants?.mp4?.source?.url) {
    return post.preview.images[0].variants.mp4.source.url.replace(/&amp;/g, "&");
  }
  if (post.url?.includes("imgur.com") && post.url?.endsWith(".gifv")) {
    return post.url.replace(".gifv", ".gif");
  }
  if (post.url?.includes("i.redd.it") && (post.url?.endsWith(".gif") || post.url?.endsWith(".png") || post.url?.endsWith(".jpg"))) {
    return post.url;
  }
  if (post.preview?.images?.[0]?.source?.url) {
    return post.preview.images[0].source.url.replace(/&amp;/g, "&");
  }
  if (post.thumbnail && post.thumbnail.startsWith("http")) {
    return post.thumbnail;
  }
  return null;
};

const getPreviewUrl = (post: any): string => {
  if (post.preview?.images?.[0]?.resolutions) {
    const resolutions = post.preview.images[0].resolutions;
    const mid = resolutions[Math.min(2, resolutions.length - 1)];
    if (mid?.url) return mid.url.replace(/&amp;/g, "&");
  }
  if (post.thumbnail && post.thumbnail.startsWith("http")) return post.thumbnail;
  return "";
};

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sub = typeof req.query?.sub === "string" && req.query.sub.trim() ? req.query.sub.trim() : "gifs";
  const query = typeof req.query?.q === "string" ? req.query.q.trim() : "";
  const after = typeof req.query?.after === "string" ? req.query.after.trim() : "";

  const cacheKey = `crawler:gifs:${sub}:${query || "hot"}:${after || "first"}`;

  try {
    // 1. Check Upstash Redis Cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({ cached: true, ...cached as any });
    }

    // 2. Fetch from Reddit with proper server-side headers
    let endpoint = "";
    if (query) {
      endpoint = `https://www.reddit.com/r/${encodeURIComponent(sub)}/search.json?q=${encodeURIComponent(query)}&restrict_sr=on&sort=relevance&limit=24${after ? `&after=${encodeURIComponent(after)}` : ""}`;
    } else {
      endpoint = `https://www.reddit.com/r/${encodeURIComponent(sub)}/hot.json?limit=24${after ? `&after=${encodeURIComponent(after)}` : ""}`;
    }

    const redditRes = await fetch(endpoint, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 PIXVAULT/1.0",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!redditRes.ok) {
      throw new Error(`Reddit API responded with status ${redditRes.status}`);
    }

    const json = await redditRes.json();
    const children = json?.data?.children || [];

    const items = children
      .map((child: any) => {
        const post = child?.data;
        if (!post) return null;
        const gifUrl = extractGifUrl(post);
        if (!gifUrl) return null;
        return {
          id: post.id,
          title: post.title,
          url: `https://reddit.com${post.permalink}`,
          gifUrl,
          previewUrl: getPreviewUrl(post) || gifUrl,
          subreddit: post.subreddit,
          score: post.score || 0,
          created: post.created_utc || Date.now() / 1000,
        };
      })
      .filter(Boolean);

    const payload = {
      items,
      after: json?.data?.after || null,
      sub,
    };

    // Cache in Redis
    if (items.length > 0) {
      await redis.set(cacheKey, payload, { ex: CACHE_TTL_SECONDS });
    }

    return res.status(200).json({ cached: false, ...payload });
  } catch (error: any) {
    console.error(`API /api/gifs error for r/${sub}:`, error);

    // Fallback static curated GIFs in case Reddit rate limits completely
    const fallbackItems = [
      {
        id: "fb_1",
        title: "Neon Wave Animation",
        url: "https://pixvault.dev",
        gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZhcTZsN2NvdW52enRxNG1jNG51OWtxM2t5dnh5NmFpMnBqYnp2byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKTDnUxE0gpnPNe/giphy.gif",
        previewUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZhcTZsN2NvdW52enRxNG1jNG51OWtxM2t5dnh5NmFpMnBqYnp2byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKTDnUxE0gpnPNe/giphy.gif",
        subreddit: sub,
        score: 1420,
        created: Date.now() / 1000,
      },
      {
        id: "fb_2",
        title: "Cyberpunk Pixel Loader",
        url: "https://pixvault.dev",
        gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2F3OXFmMHN6YWpqNGV0NWk0OTNxamptOTZqZzRhZTNvdzV4NmtmZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT9IgzoKnwFNmISR8I/giphy.gif",
        previewUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2F3OXFmMHN6YWpqNGV0NWk0OTNxamptOTZqZzRhZTNvdzV4NmtmZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT9IgzoKnwFNmISR8I/giphy.gif",
        subreddit: sub,
        score: 980,
        created: Date.now() / 1000,
      },
      {
        id: "fb_3",
        title: "Geometric Morphing UI",
        url: "https://pixvault.dev",
        gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGJ3cmZ4ZXB6dmNuY3Z4c3I2cXp0N2R2MHBwOWZldmtxczQ5ZWZzNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oEjI6SIIHBdRxXI40/giphy.gif",
        previewUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGJ3cmZ4ZXB6dmNuY3Z4c3I2cXp0N2R2MHBwOWZldmtxczQ5ZWZzNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oEjI6SIIHBdRxXI40/giphy.gif",
        subreddit: sub,
        score: 850,
        created: Date.now() / 1000,
      },
    ];

    return res.status(200).json({
      cached: false,
      items: fallbackItems,
      after: null,
      sub,
    });
  }
}
