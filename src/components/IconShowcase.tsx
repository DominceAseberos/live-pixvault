import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Copy, Download, Sparkles, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { copyText } from "@/lib/clipboard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { fetchIconSvg, iconSvgUrl, searchIconify, type IconResult } from "@/services/iconify.service";
import { CURATED_ICONS, type CuratedIcon } from "@/data/curatedIcons";

const POPULAR_QUERIES = ["arrow", "zap", "sparkles", "code", "home", "shield", "layers", "user", "star", "settings", "search", "terminal"];
const ICON_PREVIEW_COLOR = "#d8d5e3";
const ICON_SETS = [
  { label: "All Sets", value: "" },
  { label: "Featured (Offline)", value: "featured" },
  { label: "Lucide", value: "lucide" },
  { label: "Material Design", value: "mdi" },
  { label: "Heroicons", value: "heroicons" },
  { label: "Tabler", value: "tabler" },
  { label: "Phosphor", value: "ph" },
  { label: "Feather", value: "feather" },
];

const IconShowcase = () => {
  const [query, setQuery] = useState("sparkles");
  const [activeSet, setActiveSet] = useState("");
  const [svgCache, setSvgCache] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  // Live Iconify API Query
  const {
    data: apiIcons = [],
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["icons", debouncedQuery, activeSet],
    queryFn: ({ signal }) => {
      if (activeSet === "featured") return Promise.resolve([]);
      return searchIconify(debouncedQuery, activeSet, signal);
    },
    enabled: Boolean(debouncedQuery) && activeSet !== "featured",
    placeholderData: (previous) => previous,
  });

  // Filter curated vendored icons
  const matchedCurated = useMemo(() => {
    if (!debouncedQuery && activeSet !== "featured") return CURATED_ICONS.slice(0, 12);
    const q = debouncedQuery.toLowerCase();
    return CURATED_ICONS.filter((item) => {
      if (activeSet && activeSet !== "featured" && item.set.toLowerCase() !== activeSet.toLowerCase()) {
        return false;
      }
      return (
        item.name.toLowerCase().includes(q) ||
        item.set.toLowerCase().includes(q) ||
        item.tags.some((t) => t.includes(q))
      );
    });
  }, [debouncedQuery, activeSet]);

  const copySvgString = async (svg: string, label: string, key: string) => {
    try {
      await copyText(svg);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
      toast.success(`Copied ${label} SVG!`);
    } catch {
      toast.error("Could not copy SVG to clipboard");
    }
  };

  const copyApiSvg = async (icon: IconResult) => {
    const key = `${icon.prefix}:${icon.name}`;
    try {
      const svg = svgCache[key] ?? (await fetchIconSvg(icon));
      if (!svgCache[key]) setSvgCache((prev) => ({ ...prev, [key]: svg }));
      await copySvgString(svg, `${icon.prefix}:${icon.name}`, key);
    } catch {
      toast.error("Could not fetch SVG");
    }
  };

  const downloadSvgFile = (svg: string, name: string) => {
    try {
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Downloaded SVG!");
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <section id="icon-showcase" className="relative bg-card py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-secondary">
            200,000+ Open Source Icons · Zero Bloat
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold text-foreground sm:text-5xl">
            Every icon you'll ever need.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Search Lucide, Material, Heroicons, Tabler & Phosphor icon sets. One-click SVG copy or direct download.
          </p>
        </div>

        {/* Search Input */}
        <div className="mx-auto mb-6 max-w-xl">
          <label className="relative block">
            <span className="sr-only">Search icons</span>
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons... e.g. zap, sparkles, arrow, terminal"
              className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-11 pr-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </label>
        </div>

        {/* Quick Tag Pills */}
        <div className="mx-auto mb-6 flex max-w-2xl flex-wrap justify-center gap-2">
          {POPULAR_QUERIES.map((popular) => (
            <button
              key={popular}
              type="button"
              onClick={() => setQuery(popular)}
              className="rounded-full border border-border px-3 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:border-secondary hover:text-foreground"
            >
              {popular}
            </button>
          ))}
        </div>

        {/* Icon Set Filters */}
        <div className="mb-10 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible">
          {ICON_SETS.map((set) => (
            <button
              key={set.value}
              type="button"
              onClick={() => setActiveSet(set.value)}
              className={`rounded-full px-4 py-2 font-mono text-xs transition-all ${
                activeSet === set.value
                  ? "bg-secondary text-secondary-foreground shadow-sm"
                  : "border border-border text-muted-foreground hover:border-secondary hover:text-foreground"
              }`}
            >
              {set.label}
            </button>
          ))}
        </div>

        {/* Curated / Featured Section if available */}
        {matchedCurated.length > 0 && activeSet !== "lucide" && activeSet !== "mdi" && (
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-secondary font-semibold">
                Featured & Instant Icons
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {matchedCurated.map((icon) => {
                const isCopied = copiedKey === icon.id;
                return (
                  <div
                    key={icon.id}
                    className="group relative flex flex-col items-center justify-center rounded-xl border border-border bg-background p-4 text-center hover:border-secondary transition-all shadow-sm"
                  >
                    <div
                      className="mb-3 flex h-10 w-10 items-center justify-center text-foreground transition-transform group-hover:scale-110"
                      dangerouslySetInnerHTML={{ __html: icon.svg }}
                    />
                    <span className="line-clamp-1 font-mono text-xs text-foreground font-medium">{icon.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{icon.set}</span>

                    {/* Action buttons */}
                    <div className="mt-3 flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => copySvgString(icon.svg, icon.name, icon.id)}
                        className="rounded-md border border-border bg-muted/60 p-1.5 text-xs text-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
                        title="Copy SVG"
                      >
                        {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadSvgFile(icon.svg, icon.name)}
                        className="rounded-md border border-border bg-muted/60 p-1.5 text-xs text-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
                        title="Download SVG"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Iconify Results */}
        {activeSet !== "featured" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Iconify Deep Search Results {apiIcons.length > 0 && `(${apiIcons.length})`}
              </h3>
              {isFetching && <RefreshCw className="h-3.5 w-3.5 animate-spin text-secondary" />}
            </div>

            {apiIcons.length === 0 && !isFetching ? (
              <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                No external icons found for "{debouncedQuery}". Try another keyword or explore the featured icons above.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {apiIcons.map((icon) => {
                  const key = `${icon.prefix}:${icon.name}`;
                  const isCopied = copiedKey === key;
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative flex flex-col items-center justify-center rounded-xl border border-border bg-background p-4 text-center hover:border-secondary transition-all shadow-sm"
                    >
                      <img
                        src={iconSvgUrl(icon, ICON_PREVIEW_COLOR)}
                        alt={icon.name}
                        loading="lazy"
                        className="mb-3 h-10 w-10 opacity-90 transition-[transform,opacity] group-hover:scale-110 group-hover:opacity-100"
                      />
                      <span className="line-clamp-1 font-mono text-xs text-foreground font-medium">{icon.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{icon.prefix}</span>

                      <div className="mt-3 flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => copyApiSvg(icon)}
                          className="rounded-md border border-border bg-muted/60 p-1.5 text-xs text-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
                          title="Copy SVG"
                        >
                          {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default IconShowcase;
