import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Copy, Download, Bookmark, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

const GIPHY_KEY = "dc6zaTOxFJmzC";
const BASE_URL = "https://api.giphy.com/v1/gifs";

interface GiphyGif {
  id: string;
  title: string;
  url: string;
  images: {
    fixed_height: { url: string; width: string; height: string };
    original: { url: string };
  };
  import_datetime: string;
  trending_datetime: string;
}

// Fallback sample GIFs when API is unavailable
const FALLBACK_GIFS: GiphyGif[] = [
  "coding", "design", "animation", "neon", "abstract", "pixel-art",
  "loading", "creative", "gradient", "dark-mode", "ui", "vaporwave",
].map((tag, i) => ({
  id: `fallback-${i}`,
  title: `${tag.charAt(0).toUpperCase() + tag.slice(1)} GIF`,
  url: `https://giphy.com/search/${tag}`,
  images: {
    fixed_height: {
      url: `https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDJhOXJ0bWF4NnN3ZDJnZWJ0dXY0eXV1Y3FncGF6bTRrOHl4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/${["xT9IgzoKnwFNmISR8I","l0HlBO7eyXzSZkJnd","3oEjHWpiVIOGXT5l9m","26tn33aiTi1jkl6H6","l3q2K5jinAlChoCLS","xT9IgG50Fb7Mi2PfaO","3oEjI6SIIHBdRxXI40","l46Cy1rHbQ92uuLXa","xT9IgzoKnwFNmISR8I","l0HlBO7eyXzSZkJnd","3oEjHWpiVIOGXT5l9m","26tn33aiTi1jkl6H6"][i]}/giphy.gif`,
      width: "200",
      height: `${150 + (i % 3) * 50}`,
    },
    original: {
      url: `https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx/${["xT9IgzoKnwFNmISR8I"][0]}/giphy.gif`,
    },
  },
  import_datetime: new Date().toISOString(),
  trending_datetime: new Date().toISOString(),
}));

const GifShowcase = () => {
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [apiDown, setApiDown] = useState(false);
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchGifs = useCallback(async (searchQuery: string, newOffset: number, append = false) => {
    setLoading(true);
    setError(false);
    try {
      const endpoint = searchQuery
        ? `${BASE_URL}/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(searchQuery)}&limit=12&offset=${newOffset}&rating=g`
        : `${BASE_URL}/trending?api_key=${GIPHY_KEY}&limit=12&offset=${newOffset}&rating=g`;
      const res = await fetch(endpoint);
      if (!res.ok) {
        // API key may be expired, use fallback
        setApiDown(true);
        setGifs(FALLBACK_GIFS);
        return;
      }
      const data = await res.json();
      setGifs(prev => append ? [...prev, ...data.data] : data.data);
    } catch {
      setApiDown(true);
      setGifs(FALLBACK_GIFS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGifs("", 0);
  }, [fetchGifs]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setOffset(0);
      if (!apiDown) {
        fetchGifs(value, 0);
      }
    }, 300);
  };

  const loadMore = () => {
    const newOffset = offset + 12;
    setOffset(newOffset);
    fetchGifs(query, newOffset, true);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("GIF URL copied!");
  };

  const toggleSave = (id: string) => {
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    toast.success(saved.has(id) ? "Removed from collection" : "Saved to collection!");
  };

  const isNew = (dateStr: string) => {
    const d = new Date(dateStr);
    return Date.now() - d.getTime() < 86400000;
  };

  const isTrending = (dateStr: string) => {
    return dateStr && dateStr !== "0000-00-00 00:00:00";
  };

  return (
    <section id="gif-showcase" className="relative py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
            <span className="font-mono text-xs uppercase tracking-widest text-primary">
              LIVE · POWERED BY GIPHY API
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            GIFs that actually move.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Trending animations, loaded live. Search any mood, vibe, or topic.
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto mb-10 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder='Search GIFs... e.g. "loading", "dark mode", "vaporwave"'
              className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-11 pr-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        {/* API status notice */}
        {apiDown && (
          <div className="mb-8 rounded-lg border border-border bg-muted/30 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              🔑 GIPHY demo key has limited access. Showing preview content.{" "}
              <a
                href="https://developers.giphy.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Get a free API key →
              </a>
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-8 text-center text-muted-foreground">
            GIPHY is asleep 😴 — try again in a sec
          </div>
        )}

        {/* Grid */}
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
                src={gif.images.fixed_height.url}
                alt={gif.title}
                className="w-full"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />

              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                {i < 3 && isTrending(gif.trending_datetime) && (
                  <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold text-accent-foreground">
                    TRENDING
                  </span>
                )}
                {isNew(gif.import_datetime) && (
                  <span className="rounded-full bg-amber-tag px-2 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">
                    NEW
                  </span>
                )}
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 flex flex-col justify-end bg-background/75 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="mb-2 truncate font-display text-xs font-semibold text-foreground">
                  {gif.title || "Untitled GIF"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyUrl(gif.images.original.url)}
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground hover:opacity-90"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                  <button
                    onClick={() => toggleSave(gif.id)}
                    className={`ml-auto rounded-full p-1 transition-colors ${saved.has(gif.id) ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Bookmark className="h-3.5 w-3.5" fill={saved.has(gif.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                <a
                  href={gif.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 font-mono text-[9px] text-muted-foreground hover:text-primary"
                >
                  via GIPHY <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </motion.div>
          ))}

          {/* Skeletons */}
          {loading &&
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="mb-2 break-inside-avoid rounded-md shimmer"
                style={{ height: `${150 + (i % 3) * 60}px` }}
              />
            ))}
        </div>

        {/* Load More */}
        {!loading && gifs.length > 0 && !apiDown && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <button
              onClick={loadMore}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-6 py-3 font-display text-sm font-semibold text-foreground transition-all hover:border-primary hover:bg-muted"
            >
              Load More
            </button>
            <span className="font-mono text-xs text-secondary hover:underline cursor-pointer">
              Browse all GIFs →
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default GifShowcase;
