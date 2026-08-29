import { useState, useEffect, useCallback, useRef } from "react";
import { copyText } from "@/lib/clipboard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePersistentSet } from "@/hooks/usePersistentSet";
import { motion } from "framer-motion";
import { Search, Copy, Bookmark, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

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

const SUBREDDITS = [
  { label: "GIFs", value: "gifs" },
  { label: "Reaction GIFs", value: "reactiongifs" },
  { label: "High Quality", value: "HighQualityGifs" },
  { label: "Pixel Art", value: "animatedpixelart" },
  { label: "Cinemagraphs", value: "Cinemagraphs" },
  { label: "Web Animation", value: "webdev" },
];

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

  const fetchGifs = useCallback(async (sub: string, searchQuery: string, afterToken: string | null = null, append = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const params = new URLSearchParams({ sub });
      if (searchQuery) params.set("q", searchQuery);
      if (afterToken) params.set("after", afterToken);

      const res = await fetch(`/api/gifs?${params.toString()}`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("GIF API error");
      const data = await res.json() as { items?: RedditGif[]; after?: string | null };
      if (abortRef.current !== controller) return;

      const results = data.items ?? [];
      setAfter(data.after ?? null);
      setHasMore(Boolean(data.after));
      setGifs((previous) => append ? [...previous, ...results] : results);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (abortRef.current === controller) {
        if (!append) setGifs([]);
        toast.error("Could not load GIFs. Using cached animations.");
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
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

  const isHot = (score: number) => score > 800;

  return (
    <section id="gif-showcase" className="relative py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
            <span className="font-mono text-xs uppercase tracking-widest text-primary">
              Live & Cached · High Speed
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            GIFs that actually move.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Trending animations pulled live and cached for lightning-fast preview. Search any mood, vibe, or UI topic.
          </p>
        </div>

        {/* Subreddit / Category tabs */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {SUBREDDITS.map((sub) => (
            <button
              key={sub.value}
              onClick={() => { setActiveSub(sub.value); setQuery(""); }}
              className={`rounded-full px-4 py-2 font-mono text-xs transition-all ${
                activeSub === sub.value
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "border border-border text-muted-foreground hover:border-accent hover:text-foreground"
              }`}
            >
              {sub.label}
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
              placeholder='Search GIFs... e.g. "loading", "matrix", "pixel art", "abstract"'
              className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-11 pr-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        {/* Results Grid */}
        {loading && gifs.length === 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl border border-border bg-muted/40" />
            ))}
          </div>
        ) : gifs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">No GIFs found for this category or search.</p>
            <button
              onClick={() => void fetchGifs(activeSub, "")}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:border-primary transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {gifs.map((gif, i) => (
                <motion.div
                  key={`${gif.id}-${i}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 12) * 0.03 }}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:border-primary/50 transition-all"
                >
                  <img
                    src={gif.gifUrl || gif.previewUrl}
                    alt={gif.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback to preview url if direct gif fails
                      if (gif.previewUrl && e.currentTarget.src !== gif.previewUrl) {
                        e.currentTarget.src = gif.previewUrl;
                      }
                    }}
                  />

                  {/* Gradient Overlay & Hover Actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <div className="flex justify-between items-center">
                      {isHot(gif.score) && (
                        <span className="rounded-full bg-accent/90 px-2 py-0.5 font-mono text-[10px] text-accent-foreground font-semibold">
                          HOT
                        </span>
                      )}
                      <div className="flex gap-1 ml-auto">
                        <button
                          onClick={() => toggleSave(gif.id)}
                          className={`rounded-lg p-1.5 backdrop-blur-md transition-colors ${
                            saved.has(gif.id)
                              ? "bg-primary text-primary-foreground"
                              : "bg-background/70 text-muted-foreground hover:text-foreground"
                          }`}
                          title="Save GIF"
                        >
                          <Bookmark className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => copyUrl(gif.gifUrl)}
                          className="rounded-lg bg-background/70 p-1.5 text-muted-foreground backdrop-blur-md hover:text-foreground transition-colors"
                          title="Copy GIF URL"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="line-clamp-2 text-xs font-medium text-foreground">{gif.title}</p>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>r/{gif.subreddit}</span>
                        <a
                          href={gif.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors flex items-center gap-0.5"
                        >
                          Reddit <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="rounded-xl border border-border bg-card px-6 py-2.5 font-mono text-xs text-foreground hover:border-primary disabled:opacity-50 transition-colors inline-flex items-center gap-2"
                >
                  {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  {loading ? "Loading..." : "Load More GIFs"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default GifShowcase;
