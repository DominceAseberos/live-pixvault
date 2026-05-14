import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Copy, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const ICONIFY_API = "https://api.iconify.design";

interface IconResult {
  prefix: string;
  name: string;
}

const POPULAR_QUERIES = ["arrow", "home", "user", "star", "heart", "settings", "search", "menu", "check", "close"];
const ICON_SETS = [
  { label: "All", value: "" },
  { label: "Lucide", value: "lucide" },
  { label: "Material", value: "mdi" },
  { label: "Heroicons", value: "heroicons" },
  { label: "Tabler", value: "tabler" },
  { label: "Phosphor", value: "ph" },
  { label: "Feather", value: "feather" },
];

const IconShowcase = () => {
  const [icons, setIcons] = useState<IconResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("design");
  const [activeSet, setActiveSet] = useState("");
  const [svgCache, setSvgCache] = useState<Record<string, string>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const searchIcons = useCallback(async (q: string, prefix: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ query: q, limit: "48" });
      if (prefix) params.set("prefixes", prefix);
      const res = await fetch(`${ICONIFY_API}/search?${params}`);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const results: IconResult[] = (data.icons || []).map((icon: string) => {
        const [prefix, ...nameParts] = icon.split(":");
        return { prefix, name: nameParts.join(":") };
      });
      setIcons(results);
    } catch {
      setIcons([]);
      toast.error("Could not search icons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    searchIcons("design", "");
  }, [searchIcons]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim()) searchIcons(value, activeSet);
    }, 400);
  };

  const handleSetChange = (value: string) => {
    setActiveSet(value);
    if (query.trim()) searchIcons(query, value);
  };

  const getSvgUrl = (icon: IconResult) => `${ICONIFY_API}/${icon.prefix}/${icon.name}.svg?color=%2300d4ff`;

  const copySvg = async (icon: IconResult) => {
    try {
      const cacheKey = `${icon.prefix}:${icon.name}`;
      let svg = svgCache[cacheKey];
      if (!svg) {
        const res = await fetch(`${ICONIFY_API}/${icon.prefix}/${icon.name}.svg`);
        svg = await res.text();
        setSvgCache(prev => ({ ...prev, [cacheKey]: svg! }));
      }
      await navigator.clipboard.writeText(svg);
      toast.success("SVG copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const downloadSvg = async (icon: IconResult) => {
    try {
      const res = await fetch(`${ICONIFY_API}/${icon.prefix}/${icon.name}.svg`);
      const svg = await res.text();
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${icon.prefix}-${icon.name}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <section id="icon-showcase" className="relative py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">
              200,000+ Icons · 150+ Icon Sets · Free
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            Every icon you'll ever need.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Search across Lucide, Material, Heroicons, Tabler, Phosphor, and more — powered by Iconify. Copy SVG or download instantly.
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto mb-6 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search icons... e.g. arrow, home, settings"
              className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-11 pr-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-colors"
            />
          </div>
        </div>

        {/* Quick tags */}
        <div className="mx-auto mb-6 flex max-w-2xl flex-wrap justify-center gap-2">
          {POPULAR_QUERIES.map(q => (
            <button key={q} onClick={() => { setQuery(q); searchIcons(q, activeSet); }}
              className="rounded-full border border-border px-3 py-1 font-mono text-[10px] text-muted-foreground hover:border-secondary hover:text-foreground transition-colors">
              {q}
            </button>
          ))}
        </div>

        {/* Icon set filter */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {ICON_SETS.map(set => (
            <button key={set.value} onClick={() => handleSetChange(set.value)}
              className={`rounded-full px-4 py-2 font-mono text-xs transition-all ${
                activeSet === set.value
                  ? "bg-secondary text-secondary-foreground"
                  : "border border-border text-muted-foreground hover:border-secondary hover:text-foreground"
              }`}>
              {set.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg shimmer" />
            ))}
          </div>
        ) : icons.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">No icons found. Try a different search.</div>
        ) : (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
            {icons.map((icon, i) => (
              <motion.div
                key={`${icon.prefix}:${icon.name}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.01, 0.3) }}
                className="group relative flex aspect-square items-center justify-center rounded-lg border border-border bg-background transition-all hover:border-secondary hover:glow-violet cursor-pointer"
              >
                <img
                  src={getSvgUrl(icon)}
                  alt={`${icon.prefix}:${icon.name}`}
                  className="h-6 w-6 transition-transform group-hover:scale-110"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg bg-background/90 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex gap-1">
                    <button onClick={() => copySvg(icon)} className="rounded-md bg-primary p-1.5 text-primary-foreground hover:opacity-90" title="Copy SVG">
                      <Copy className="h-3 w-3" />
                    </button>
                    <button onClick={() => downloadSvg(icon)} className="rounded-md border border-border p-1.5 text-foreground hover:bg-muted" title="Download">
                      <Download className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="mt-1 max-w-full truncate px-1 font-mono text-[8px] text-muted-foreground">
                    {icon.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <a href="https://icon-sets.iconify.design/" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-secondary transition-colors">
            Browse all on Iconify <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default IconShowcase;
