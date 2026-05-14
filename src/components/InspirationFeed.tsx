import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Bookmark, Flame, Clock } from "lucide-react";
import { toast } from "sonner";

interface FeedItem {
  title: string;
  link: string;
  thumbnail: string;
  pubDate: string;
  description: string;
  source: string;
  points?: number;
  categories?: string[];
}

const SOURCES = [
  { label: "CSS-Tricks",   rss: "https://css-tricks.com/feed/" },
  { label: "Smashing Mag", rss: "https://www.smashingmagazine.com/feed/" },
  { label: "Awwwards",     rss: "https://www.awwwards.com/blog/feed/" },
  { label: "Codrops",      rss: "https://tympanus.net/codrops/feed/" },
  { label: "Dev.to UI/UX", rss: "https://dev.to/feed/tag/webdev" },
  { label: "web.dev",      rss: "https://web.dev/feed.xml" },
  { label: "A List Apart", rss: "https://alistapart.com/main/feed/" },
  { label: "UX Collective", rss: "https://uxdesign.cc/feed" },
];

const RSS2JSON_BASE = "https://api.rss2json.com/v1/api.json";
const HN_ENDPOINT = "https://hn.algolia.com/api/v1/search?tags=story&query=web+design+UI+UX+frontend&hitsPerPage=12";

const CACHE_TTL = 6 * 60 * 60 * 1000;

const getCached = (key: string): FeedItem[] | null => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
};

const setCache = (key: string, data: FeedItem[]) => {
  sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
};

const relativeTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

const stripHtml = (html: string) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent?.slice(0, 150) || "";
};

/** Extract first image URL from HTML content/description */
const extractImageFromHtml = (html: string): string => {
  if (!html) return "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match && match[1] && match[1].startsWith("http")) {
    return match[1];
  }
  return "";
};

const isValidImage = (url: string) =>
  url &&
  url.startsWith("http") &&
  !url.includes("feedburner") &&
  !url.includes("feeds.feedburner") &&
  !url.includes("flattr.com") &&
  !url.includes("wp-content/plugins");

const hashColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 60%, 25%)`;
};

const getCardBg = (item: FeedItem) => {
  // Priority: thumbnail → extracted from description → gradient
  const thumb = item.thumbnail;
  if (thumb && isValidImage(thumb)) {
    return { backgroundImage: `url(${thumb})` };
  }
  const extracted = extractImageFromHtml(item.description);
  if (extracted && isValidImage(extracted)) {
    return { backgroundImage: `url(${extracted})` };
  }
  return {
    backgroundImage: `linear-gradient(135deg, ${hashColor(item.title)}, ${hashColor(item.source + item.title)})`,
  };
};

const getTypeChip = (item: FeedItem) => {
  const cats = (item.categories || []).join(" ").toLowerCase();
  if (cats.includes("tutorial") || cats.includes("guide")) return { label: "TUTORIAL", cls: "bg-amber-tag text-primary-foreground" };
  if (cats.includes("showcase") || cats.includes("award")) return { label: "SHOWCASE", cls: "bg-primary text-primary-foreground" };
  return { label: "ARTICLE", cls: "bg-secondary text-secondary-foreground" };
};

const InspirationFeed = () => {
  const [activeSource, setActiveSource] = useState("CSS-Tricks");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const fetchRSS = useCallback(async (source: { label: string; rss: string }) => {
    const cacheKey = `pixvault_rss_${source.label}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${RSS2JSON_BASE}?rss_url=${encodeURIComponent(source.rss)}&count=10`);
      const data = await res.json();
      if (data.status !== "ok") return [];
      const items: FeedItem[] = data.items.map((item: any) => {
        // Try multiple sources for thumbnail
        const thumbnail =
          item.thumbnail ||
          item.enclosure?.link ||
          extractImageFromHtml(item.content || "") ||
          extractImageFromHtml(item.description || "") ||
          "";
        return {
          title: item.title,
          link: item.link,
          thumbnail,
          pubDate: item.pubDate,
          description: item.content || item.description || "",
          source: source.label,
          categories: item.categories,
        };
      });
      setCache(cacheKey, items);
      return items;
    } catch {
      return [];
    }
  }, []);

  const fetchHN = useCallback(async (): Promise<FeedItem[]> => {
    const cacheKey = "pixvault_hn_design";
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(HN_ENDPOINT);
      const data = await res.json();
      const items: FeedItem[] = data.hits.map((hit: any) => ({
        title: hit.title,
        link: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        thumbnail: "",
        pubDate: hit.created_at,
        description: hit.story_text || "",
        source: "HN Design",
        points: hit.points,
        categories: ["story"],
      }));
      setCache(cacheKey, items);
      return items;
    } catch {
      return [];
    }
  }, []);

  const fetchGitHubTrending = useCallback(async (): Promise<FeedItem[]> => {
    const cacheKey = "pixvault_gh_trending";
    const cached = getCached(cacheKey);
    if (cached) return cached;
    try {
      // GitHub search API — no auth needed for public repos, sorted by stars
      const res = await fetch(
        "https://api.github.com/search/repositories?q=topic:frontend+topic:ui+stars:>500&sort=stars&order=desc&per_page=12",
        { headers: { Accept: "application/vnd.github+json" } }
      );
      const data = await res.json();
      const items: FeedItem[] = (data.items || []).map((repo: any) => ({
        title: repo.full_name,
        link: repo.html_url,
        thumbnail: repo.owner?.avatar_url || "",
        pubDate: repo.updated_at,
        description: repo.description || "",
        source: "GitHub",
        points: repo.stargazers_count,
        categories: repo.topics || [],
      }));
      setCache(cacheKey, items);
      return items;
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let result: FeedItem[] = [];
      if (activeSource === "HN Design") {
        result = await fetchHN();
      } else if (activeSource === "GitHub Trending") {
        result = await fetchGitHubTrending();
      } else {
        const source = SOURCES.find((s) => s.label === activeSource);
        if (source) result = await fetchRSS(source);
      }
      setItems(result);
      setLoading(false);
    };
    load();
  }, [activeSource, fetchRSS, fetchHN, fetchGitHubTrending]);

  const toggleSave = (link: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(link)) next.delete(link); else next.add(link);
      return next;
    });
    toast.success(saved.has(link) ? "Removed" : "Saved!");
  };

  const featured = items[0];
  const rest = items.slice(1);

  return (
    <section id="inspiration" className="relative py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              Updated Daily · Curated from the Web
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            What the best designers are reading.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Fresh articles, tutorials, and showcases from the top design and frontend publications — updated every 24 hours.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {[...SOURCES.map((s) => s.label), "HN Design", "GitHub Trending"].map((label) => (
            <button
              key={label}
              onClick={() => setActiveSource(label)}
              className={`rounded-full px-4 py-2 font-mono text-xs transition-all ${
                activeSource === label
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted-foreground hover:border-accent hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`skel-${i}`} className={`shimmer rounded-lg ${i === 0 ? "sm:col-span-2 h-[260px]" : "h-[200px]"}`} />
            ))}
          </div>
        ) : (
          <>
            {featured && (
              <motion.a
                href={featured.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group mb-6 block overflow-hidden rounded-lg border border-border bg-card card-hover-coral"
              >
                <div className="flex flex-col sm:flex-row">
                  <div
                    className="h-48 w-full sm:h-auto sm:min-h-[200px] sm:w-1/3 bg-cover bg-center"
                    style={getCardBg(featured)}
                  />
                  <div className="flex-1 p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${getTypeChip(featured).cls}`}>
                        {getTypeChip(featured).label}
                      </span>
                      <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold text-accent-foreground">
                        FEATURED
                      </span>
                    </div>
                    <h3 className="mb-2 font-display text-xl font-bold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                      {featured.title}
                    </h3>
                    <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                      {stripHtml(featured.description)}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="font-mono">{featured.source}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {relativeTime(featured.pubDate)}
                      </span>
                      {featured.points && featured.points > 100 && (
                        <span className="flex items-center gap-1 text-accent">
                          <Flame className="h-3 w-3" /> {featured.points >= 1000 ? `${(featured.points / 1000).toFixed(1)}k` : featured.points} {activeSource === "GitHub Trending" ? "★" : "pts"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.a>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {rest.map((item, i) => (
                <motion.div
                  key={item.link}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group overflow-hidden rounded-lg border border-border bg-card card-hover-coral"
                >
                  <div
                    className="h-40 bg-cover bg-center"
                    style={getCardBg(item)}
                  >
                    <div className="p-3">
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${getTypeChip(item).cls}`}>
                        {getTypeChip(item).label}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 font-display text-sm font-semibold text-foreground line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="font-mono">{item.source}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {relativeTime(item.pubDate)}
                        </span>
                      {item.points && item.points > 100 && (
                          <span className="flex items-center gap-1 text-accent">
                            <Flame className="h-3 w-3" /> {item.points >= 1000 ? `${(item.points / 1000).toFixed(1)}k` : item.points} {activeSource === "GitHub Trending" ? "★" : "pts"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.preventDefault(); toggleSave(item.link); }}
                          className={`rounded-md p-1 ${saved.has(item.link) ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          <Bookmark className="h-3.5 w-3.5" fill={saved.has(item.link) ? "currentColor" : "none"} />
                        </button>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md p-1 text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default InspirationFeed;
