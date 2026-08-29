import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Bookmark, Flame, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { usePersistentSet } from "@/hooks/usePersistentSet";

interface FeedItem {
  id?: string;
  title: string;
  link: string;
  thumbnail?: string;
  pubDate: string;
  description: string;
  source: string;
  points?: number;
  categories?: string[];
}

const SOURCES = [
  { label: "Reddit r/webdev", key: "reddit-webdev" },
  { label: "Reddit r/UI_Design", key: "reddit-UI_Design" },
  { label: "Reddit r/frontend", key: "reddit-frontend" },
  { label: "Stack Overflow", key: "stackoverflow" },
  { label: "GitHub Trending", key: "github" },
  { label: "Hacker News UI", key: "hn" },
  { label: "CSS-Tricks", key: "css-tricks" },
  { label: "Smashing Mag", key: "smashing" },
  { label: "Awwwards", key: "awwwards" },
  { label: "Codrops", key: "codrops" },
  { label: "Dev.to UI/UX", key: "devto" },
];

const relativeTime = (dateStr: string) => {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  } catch {
    return "Recent";
  }
};

const hashColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 55%, 22%)`;
};

const getCardBg = (item: FeedItem) => {
  if (item.thumbnail && item.thumbnail.startsWith("http")) {
    return { backgroundImage: `url(${item.thumbnail})` };
  }
  return {
    backgroundImage: `linear-gradient(135deg, ${hashColor(item.title)}, ${hashColor(item.source + item.title)})`,
  };
};

const InspirationFeed = () => {
  const [activeSource, setActiveSource] = useState("reddit-webdev");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { values: saved, toggle: toggleSaved } = usePersistentSet("pixvault_saved_inspiration");
  const requestRef = useRef<AbortController | null>(null);

  const fetchSource = useCallback(async (sourceKey: string) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);

    try {
      const res = await fetch(`/api/inspiration?source=${encodeURIComponent(sourceKey)}`, { signal: controller.signal });
      if (!res.ok) throw new Error("Feed request failed");
      const json = await res.json() as { data?: { items?: FeedItem[] } };
      if (requestRef.current === controller) setItems(json.data?.items ?? []);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (requestRef.current === controller) {
        toast.error("Could not refresh this feed right now.");
        setItems([]);
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchSource(activeSource);
    return () => requestRef.current?.abort();
  }, [activeSource, fetchSource]);

  const toggleSave = (link: string) => {
    const isSaved = toggleSaved(link);
    toast.success(isSaved ? "Saved inspiration" : "Removed from saved");
  };

  return (
    <section id="inspiration" className="relative py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">
              Community & Design Feed · Auto-Cached
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            Never run out of inspiration.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Live web design trends, Reddit UI critiques, Stack Overflow solutions, and design publications.
          </p>
        </div>

        {/* Source selector */}
        <div className="mb-10 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible">
          {SOURCES.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSource(s.key)}
              className={`rounded-full px-4 py-2 font-mono text-xs transition-all ${
                activeSource === s.key
                  ? "bg-secondary text-secondary-foreground shadow-sm"
                  : "border border-border text-muted-foreground hover:border-secondary hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Grid items */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-muted/40" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">No recent stories found from this feed.</p>
            <button
              onClick={() => void fetchSource(activeSource)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:border-secondary transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Retry Feed
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <motion.article
                key={`${item.link}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 9) * 0.04 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-background p-5 hover:border-secondary transition-all shadow-sm"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-md bg-secondary/15 px-2.5 py-1 font-mono text-[10px] text-secondary font-medium uppercase tracking-wider">
                      {item.source}
                    </span>
                    <div className="flex items-center gap-2">
                      {typeof item.points === "number" && (
                        <span className="inline-flex items-center gap-1 font-mono text-xs text-amber-500 font-semibold">
                          <Flame className="h-3.5 w-3.5" />
                          {item.points}
                        </span>
                      )}
                      <button
                        onClick={() => toggleSave(item.link)}
                        className={`rounded-lg p-1.5 transition-colors ${
                          saved.has(item.link)
                            ? "bg-secondary text-secondary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Save to bookmarks"
                      >
                        <Bookmark className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="line-clamp-2 text-base font-semibold text-foreground group-hover:text-secondary transition-colors">
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                  </h3>

                  {item.description && (
                    <p className="mt-2 line-clamp-3 text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {relativeTime(item.pubDate)}
                  </span>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-foreground hover:text-secondary transition-colors"
                  >
                    Read <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default InspirationFeed;
