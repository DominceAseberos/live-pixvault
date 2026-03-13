import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Copy, Bookmark, ExternalLink } from "lucide-react";
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
    fixed_width_small: { url: string };
  };
  import_datetime: string;
  trending_datetime: string;
}

const GifShowcase = () => {
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchGifs = useCallback(async (searchQuery: string, newOffset: number, append = false) => {
    setLoading(true);
    try {
      const endpoint = searchQuery
        ? `${BASE_URL}/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(searchQuery)}&limit=12&offset=${newOffset}&rating=g`
        : `${BASE_URL}/trending?api_key=${GIPHY_KEY}&limit=12&offset=${newOffset}&rating=g`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const results = data.data || [];
      setGifs(prev => append ? [...prev, ...results] : results);
      setHasMore(results.length === 12);
    } catch {
      if (!append) setGifs([]);
      toast.error("Could not load GIFs — GIPHY rate limit reached. Try again shortly.");
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
      fetchGifs(value, 0);
    }, 400);
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
    toast.success(saved.has(id) ? "Removed" : "Saved!");
  };

  const isNew = (dateStr: string) => Date.now() - new Date(dateStr).getTime() < 86400000;
  const isTrending = (dateStr: string) => dateStr && dateStr !== "0000-00-00 00:00:00";

  return (
    <section id="gif-showcase" className="relative py-24 bg-background">
      <div className="container mx-auto px-4">
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
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div className="absolute top-2 left-2 flex gap-1">
                {i < 3 && isTrending(gif.trending_datetime) && (
                  <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold text-accent-foreground">TRENDING</span>
                )}
                {isNew(gif.import_datetime) && (
                  <span className="rounded-full bg-amber-tag px-2 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">NEW</span>
                )}
              </div>
              <div className="absolute inset-0 flex flex-col justify-end bg-background/75 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="mb-2 truncate font-display text-xs font-semibold text-foreground">
                  {gif.title || "Untitled GIF"}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => copyUrl(gif.images.original.url)} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground hover:opacity-90">
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                  <button onClick={() => toggleSave(gif.id)} className={`ml-auto rounded-full p-1 transition-colors ${saved.has(gif.id) ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                    <Bookmark className="h-3.5 w-3.5" fill={saved.has(gif.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                <a href={gif.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 font-mono text-[9px] text-muted-foreground hover:text-primary">
                  via GIPHY <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </motion.div>
          ))}

          {loading && Array.from({ length: 8 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="mb-2 break-inside-avoid rounded-md shimmer" style={{ height: `${150 + (i % 3) * 60}px` }} />
          ))}
        </div>

        {!loading && gifs.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            No GIFs found. Try a different search term.
          </div>
        )}

        {!loading && hasMore && gifs.length > 0 && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <button onClick={loadMore} className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-6 py-3 font-display text-sm font-semibold text-foreground transition-all hover:border-primary hover:bg-muted">
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default GifShowcase;
