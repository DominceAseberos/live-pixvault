import { useState, useEffect, useCallback, useRef } from "react";
import { copyText } from "@/lib/clipboard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePersistentSet } from "@/hooks/usePersistentSet";
import { motion } from "framer-motion";
import { Search, Copy, Bookmark, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface RedditPreviewSource { url?: string }
interface RedditPreviewVariant { source?: RedditPreviewSource }
interface RedditPreviewImage { source?: RedditPreviewSource; resolutions?: RedditPreviewSource[]; variants?: { gif?: RedditPreviewVariant; mp4?: RedditPreviewVariant } }
interface RedditPost { id?: string; title?: string; url?: string; permalink?: string; subreddit?: string; score?: number; created_utc?: number; thumbnail?: string; preview?: { images?: RedditPreviewImage[] } }
interface RedditChild { data?: RedditPost }
interface RedditListing { data?: { children?: RedditChild[]; after?: string | null } }

interface RedditGif {
  id: string;
  title: string;
  url: string;
  gifUrl: string;
  previewUrl: string;
  subreddit: string;
  score: number;
  created: number;
}

const SUBREDDITS = ["gifs", "reactiongifs", "HighQualityGifs", "animatedpixelart"];

const extractGifUrl = (post: RedditPost): string | null => {
  // Direct .gif URLs
  if (post.url?.endsWith(".gif")) return post.url;
  // Reddit hosted video preview as gif
  if (post.preview?.images?.[0]?.variants?.gif?.source?.url) {
    return post.preview.images[0].variants.gif.source.url.replace(/&amp;/g, "&");
  }
  // Reddit preview as mp4 (works in <img> via poster, but let's use the gif variant)
  if (post.preview?.images?.[0]?.variants?.mp4?.source?.url) {
    return post.preview.images[0].variants.mp4.source.url.replace(/&amp;/g, "&");
  }
  // Imgur gifv → gif
  if (post.url?.includes("imgur.com") && post.url?.endsWith(".gifv")) {
    return post.url.replace(".gifv", ".gif");
  }
  // i.redd.it gif
  if (post.url?.includes("i.redd.it") && (post.url?.endsWith(".gif") || post.url?.endsWith(".png") || post.url?.endsWith(".jpg"))) {
    return post.url;
  }
  // Fallback: use preview image (static but better than nothing)
  if (post.preview?.images?.[0]?.source?.url) {
    return post.preview.images[0].source.url.replace(/&amp;/g, "&");
  }
  return null;
};

const getPreviewUrl = (post: RedditPost): string => {
  if (post.preview?.images?.[0]?.resolutions) {
    const resolutions = post.preview.images[0].resolutions;
    const mid = resolutions[Math.min(2, resolutions.length - 1)];
    if (mid?.url) return mid.url.replace(/&amp;/g, "&");
  }
  if (post.thumbnail && post.thumbnail.startsWith("http")) return post.thumbnail;
  return "";
};

const GifShowcase = () => {
  const [gifs, setGifs] = useState<RedditGif[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const { values: saved, toggle: toggleSaved } = usePersistentSet("pixvault_saved_gifs");
  const [activeSub, setActiveSub] = useState("gifs");
  const [after, setAfter] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const debouncedQuery = useDebouncedValue(query.trim(), 500);

  const parseRedditPosts = (posts: RedditChild[]): RedditGif[] => {
    return posts
      .map((child) => {
        const post = child.data;
        if (!post) return null;
        const gifUrl = extractGifUrl(post);
        if (!gifUrl) return null;
        return {
          id: post.id,
          title: post.title,
          url: `https://reddit.com${post.permalink}`,
          gifUrl,
          previewUrl: getPreviewUrl(post),
          subreddit: post.subreddit,
          score: post.score,
          created: post.created_utc,
        };
      })
      .filter(Boolean) as RedditGif[];
  };

  const fetchGifs = useCallback(async (sub: string, searchQuery: string, afterToken: string | null = null, append = false) => {
    setLoading(true);
    try {
      let endpoint: string;
      if (searchQuery) {
        endpoint = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(searchQuery)}&restrict_sr=on&sort=relevance&limit=20${afterToken ? `&after=${afterToken}` : ""}`;
      } else {
        endpoint = `https://www.reddit.com/r/${sub}/hot.json?limit=20${afterToken ? `&after=${afterToken}` : ""}`;
      }
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const res = await fetch(endpoint, {
        headers: { "Accept": "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Reddit API error");
      const data = await res.json() as RedditListing;
      const posts = data.data?.children ?? [];
      const results = parseRedditPosts(posts);
      setAfter(data?.data?.after || null);
      setHasMore(!!data?.data?.after);
      setGifs(prev => append ? [...prev, ...results] : results);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (!append) setGifs([]);
      toast.error("Could not load GIFs. Try again shortly.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setAfter(null);
    void fetchGifs(activeSub, debouncedQuery);
    return () => abortRef.current?.abort();
  }, [activeSub, debouncedQuery, fetchGifs]);

  const handleSearch = (value: string) => {
    setQuery(value);
  };

  const loadMore = () => {
    if (loading || !after) return;
    void fetchGifs(activeSub, debouncedQuery, after, true);
  };

  const copyUrl = async (url: string) => {
    try { await copyText(url); toast.success("GIF URL copied"); }
    catch { toast.error("Clipboard access failed"); }
  };

  const toggleSave = (id: string) => {
    const isSaved = toggleSaved(id);
    toast.success(isSaved ? "Saved to this browser" : "Removed from saved");
  };

  const isHot = (score: number) => score > 1000;

  return (
    <section id="gif-showcase" className="relative py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
            <span className="font-mono text-xs uppercase tracking-widest text-primary">
              Live · Powered by Reddit
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            GIFs that actually move.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Trending animations pulled live from Reddit's top GIF communities. Search any mood, vibe, or topic.
          </p>
        </div>

        {/* Subreddit tabs */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {SUBREDDITS.map((sub) => (
            <button
              key={sub}
              onClick={() => { setActiveSub(sub); setQuery(""); }}
              className={`rounded-full px-4 py-2 font-mono text-xs transition-all ${
                activeSub === sub
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted-foreground hover:border-accent hover:text-foreground"
              }`}
            >
              r/{sub}
            </button>
          ))}
        </div>

        <div className="mx-auto mb-10 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder='Search GIFs... e.g. "cat", "loading", "pixel art"'
              className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-11 pr-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        <div className="columns-2 gap-2 sm:columns-3 lg:columns-4">
          {gifs.map((gif, i) => (
            <motion.div
              key={gif.id + "-" + i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="group relative mb-2 break-inside-avoid overflow-hidden rounded-md border border-border card-hover-cyan"
            >
              <img
                src={gif.gifUrl}
                alt={gif.title}
                className="w-full"
                loading="lazy"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (gif.previewUrl && img.src !== gif.previewUrl) {
                    img.src = gif.previewUrl;
                  } else {
                    img.style.display = "none";
                  }
                }}
              />
              <div className="absolute top-2 left-2 flex gap-1">
                {isHot(gif.score) && (
                  <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold text-accent-foreground">🔥 HOT</span>
                )}
                <span className="rounded-full bg-muted/80 px-2 py-0.5 font-mono text-[10px] text-foreground">
                  r/{gif.subreddit}
                </span>
              </div>
              <div className="absolute inset-0 flex flex-col justify-end bg-background/75 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="mb-2 truncate font-display text-xs font-semibold text-foreground">
                  {gif.title || "Untitled GIF"}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => void copyUrl(gif.gifUrl)} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground hover:opacity-90">
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                  <button type="button" aria-label={saved.has(gif.id) ? `Remove ${gif.title} from saved` : `Save ${gif.title}`} onClick={() => toggleSave(gif.id)} className={`ml-auto rounded-full p-1 transition-colors ${saved.has(gif.id) ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                    <Bookmark className="h-3.5 w-3.5" fill={saved.has(gif.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                <a href={gif.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 font-mono text-[9px] text-muted-foreground hover:text-primary">
                  via Reddit <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </motion.div>
          ))}

          {loading && Array.from({ length: 8 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="mb-2 break-inside-avoid rounded-md shimmer" style={{ height: `${150 + (i % 3) * 60}px` }} />
          ))}
        </div>

        {!loading && gifs.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center text-muted-foreground">
            <p>No GIFs found. Try a different search or subreddit.</p>
            <button
              onClick={() => setQuery("")}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-primary hover:text-foreground transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        )}

        {!loading && hasMore && gifs.length > 0 && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <button type="button" disabled={loading} onClick={loadMore} className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-6 py-3 font-display text-sm font-semibold text-foreground transition-all hover:border-primary hover:bg-muted">
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default GifShowcase;
