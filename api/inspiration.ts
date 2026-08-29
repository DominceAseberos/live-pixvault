import { redis, REDIS_KEYS } from "../lib/redis.ts";

const CRAWLER_TTL_SECONDS = 3600; // 1 hour cache TTL

const RSS_FEEDS: Record<string, { url: string; label: string }> = {
  "css-tricks": { url: "https://css-tricks.com/feed/", label: "CSS-Tricks" },
  "smashing": { url: "https://www.smashingmagazine.com/feed/", label: "Smashing Magazine" },
  "awwwards": { url: "https://www.awwwards.com/blog/feed/", label: "Awwwards" },
  "codrops": { url: "https://tympanus.net/codrops/feed/", label: "Codrops" },
  "devto": { url: "https://dev.to/feed/tag/webdev", label: "Dev.to UI/UX" },
  "webdev": { url: "https://web.dev/feed.xml", label: "web.dev" },
  "alistapart": { url: "https://alistapart.com/main/feed/", label: "A List Apart" },
  "uxcollective": { url: "https://uxdesign.cc/feed", label: "UX Collective" },
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

  const source = typeof req.query?.source === "string" ? req.query.source.toLowerCase() : "reddit-webdev";

  try {
    const cacheKey = REDIS_KEYS.crawler(source);
    // 1. Check Redis cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        cached: true,
        data: cachedData,
      });
    }

    let normalizedData: any = null;

    // 2. Fetch based on source
    if (source.startsWith("reddit-") || source === "reddit") {
      const sub = source.replace("reddit-", "") || "webdev";
      const redditRes = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=15`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PIXVAULT-Inspiration/1.0",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (redditRes.ok) {
        const json = await redditRes.json();
        normalizedData = (json?.data?.children || [])
          .filter((c: any) => c.data && !c.data.stickied && c.data.title)
          .map((c: any) => {
            const p = c.data;
            const thumb = p.thumbnail && p.thumbnail.startsWith("http") ? p.thumbnail : (p.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, "&") || "");
            return {
              id: p.id,
              title: p.title,
              link: `https://reddit.com${p.permalink}`,
              thumbnail: thumb,
              pubDate: new Date(p.created_utc * 1000).toISOString(),
              points: p.score,
              source: `r/${p.subreddit}`,
              description: p.selftext ? p.selftext.slice(0, 160) : (p.url && !p.url.includes("reddit.com") ? p.url : ""),
              categories: ["reddit", p.subreddit],
            };
          });
      }
    } else if (source === "stackoverflow" || source === "so") {
      // StackOverflow active frontend questions
      const soRes = await fetch("https://api.stackexchange.com/2.3/questions?order=desc&sort=hot&tagged=css;tailwind-css;html;frontend&site=stackoverflow&pagesize=15", {
        headers: { "Accept-Encoding": "gzip" },
        signal: AbortSignal.timeout(8000),
      });
      if (soRes.ok) {
        const json = await soRes.json();
        normalizedData = (json.items || []).map((item: any) => ({
          id: item.question_id,
          title: item.title?.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&"),
          link: item.link,
          thumbnail: item.owner?.profile_image || "",
          pubDate: new Date(item.creation_date * 1000).toISOString(),
          points: item.score,
          source: "Stack Overflow",
          description: `Score: ${item.score} · Answers: ${item.answer_count} · Tags: ${item.tags?.join(", ")}`,
          categories: item.tags || ["stackoverflow"],
        }));
      }
    } else if (source === "hn" || source === "hackernews") {
      const hnRes = await fetch("https://hn.algolia.com/api/v1/search?tags=story&query=web+design+UI+UX+frontend&hitsPerPage=15", {
        signal: AbortSignal.timeout(8000),
      });
      if (hnRes.ok) {
        const json = await hnRes.json();
        normalizedData = (json.hits || [])
          .filter((h: any) => h.title && (h.url || h.objectID))
          .map((h: any) => ({
            id: h.objectID,
            title: h.title,
            link: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
            pubDate: h.created_at,
            points: h.points || 0,
            source: "Hacker News",
            description: h.story_text ? h.story_text.replace(/<[^>]+>/g, "").slice(0, 180) : "",
            categories: ["hackernews"],
          }));
      }
    } else if (source === "github") {
      const ghRes = await fetch("https://api.github.com/search/repositories?q=topic:frontend+topic:ui+stars:>200&sort=stars&order=desc&per_page=15", {
        headers: { "User-Agent": "PIXVAULT-Crawler", Accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(8000),
      });
      if (ghRes.ok) {
        const json = await ghRes.json();
        normalizedData = (json.items || []).map((repo: any) => ({
          id: repo.id,
          title: repo.full_name,
          link: repo.html_url,
          description: repo.description || "",
          pubDate: repo.updated_at,
          points: repo.stargazers_count,
          source: "GitHub UI",
          thumbnail: repo.owner?.avatar_url || "",
          categories: repo.topics || ["github"],
        }));
      }
    } else if (RSS_FEEDS[source]) {
      const feed = RSS_FEEDS[source];
      const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=12`;
      const rssRes = await fetch(rss2jsonUrl, { signal: AbortSignal.timeout(8000) });
      if (rssRes.ok) {
        const json = await rssRes.json();
        normalizedData = (json.items || []).map((item: any) => ({
          title: item.title,
          link: item.link,
          thumbnail: item.thumbnail || item.enclosure?.link || "",
          pubDate: item.pubDate,
          description: (item.description || item.content || "").replace(/<[^>]+>/g, "").slice(0, 180),
          source: feed.label,
          categories: item.categories || [source],
        }));
      }
    }

    if (!normalizedData || normalizedData.length === 0) {
      return res.status(404).json({ error: `Source "${source}" not found or yielded no items.` });
    }

    const payload = {
      source,
      updatedAt: new Date().toISOString(),
      items: normalizedData,
    };

    // 3. Cache in Redis with TTL
    await redis.set(cacheKey, payload, { ex: CRAWLER_TTL_SECONDS });

    return res.status(200).json({
      cached: false,
      data: payload,
    });
  } catch (error: any) {
    console.error(`API /api/inspiration?source=${source} error:`, error);
    return res.status(500).json({ error: error.message || "Failed to fetch inspiration feed" });
  }
}
