import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Copy, Download, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { copyText } from "@/lib/clipboard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { fetchIconSvg, iconSvgUrl, searchIconify, type IconResult } from "@/services/iconify.service";

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
  const [query, setQuery] = useState("design");
  const [activeSet, setActiveSet] = useState("");
  const [svgCache, setSvgCache] = useState<Record<string, string>>({});
  const debouncedQuery = useDebouncedValue(query.trim(), 350);

  const {
    data: icons = [],
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["icons", debouncedQuery, activeSet],
    queryFn: ({ signal }) => searchIconify(debouncedQuery, activeSet, signal),
    enabled: Boolean(debouncedQuery),
    placeholderData: (previous) => previous,
  });

  const copySvg = async (icon: IconResult) => {
    try {
      const cacheKey = `${icon.prefix}:${icon.name}`;
      const svg = svgCache[cacheKey] ?? await fetchIconSvg(icon);
      if (!svgCache[cacheKey]) setSvgCache((previous) => ({ ...previous, [cacheKey]: svg }));
      await copyText(svg);
      toast.success("SVG copied");
    } catch {
      toast.error("Could not copy this SVG");
    }
  };

  const downloadSvg = async (icon: IconResult) => {
    try {
      const svg = await fetchIconSvg(icon);
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${icon.prefix}-${icon.name}.svg`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("SVG downloaded");
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <section id="icon-showcase" className="relative bg-card py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-secondary">200,000+ icons · 150+ icon sets · free</span>
          <h2 className="mt-4 font-display text-4xl font-bold text-foreground sm:text-5xl">Every icon you'll ever need.</h2>
          <p className="mt-4 text-muted-foreground">Search multiple open icon sets through Iconify. Copy the raw SVG or download it directly.</p>
        </div>

        <div className="mx-auto mb-6 max-w-xl">
          <label className="relative block">
            <span className="sr-only">Search icons</span>
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search icons... e.g. arrow, home, settings"
              className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-11 pr-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </label>
        </div>

        <div className="mx-auto mb-6 flex max-w-2xl flex-wrap justify-center gap-2">
          {POPULAR_QUERIES.map((popular) => (
            <button key={popular} type="button" onClick={() => setQuery(popular)} className="rounded-full border border-border px-3 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:border-secondary hover:text-foreground">
              {popular}
            </button>
          ))}
        </div>

        <div className="mb-10 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible">
          {ICON_SETS.map((set) => (
            <button
              key={set.value}
              type="button"
              aria-pressed={activeSet === set.value}
              onClick={() => setActiveSet(set.value)}
              className={`shrink-0 rounded-full px-4 py-2 font-mono text-xs transition-all ${activeSet === set.value ? "bg-secondary text-secondary-foreground" : "border border-border text-muted-foreground hover:border-secondary hover:text-foreground"}`}
            >
              {set.label}
            </button>
          ))}
        </div>

        {isError ? (
          <div role="alert" className="mx-auto max-w-lg rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <p className="font-display text-lg font-semibold text-foreground">Icon search is unavailable.</p>
            <p className="mt-2 text-sm text-muted-foreground">The remote icon service did not respond successfully.</p>
            <button type="button" onClick={() => void refetch()} className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        ) : !debouncedQuery ? (
          <div className="py-16 text-center text-muted-foreground">Enter a search term to find icons.</div>
        ) : isFetching && icons.length === 0 ? (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12" aria-label="Loading icons">
            {Array.from({ length: 48 }).map((_, index) => <div key={index} className="aspect-square rounded-lg shimmer" />)}
          </div>
        ) : icons.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">No icons found. Try a different search.</div>
        ) : (
          <>
            <div className="mb-3 text-right font-mono text-[10px] text-muted-foreground">{isFetching ? "Updating results…" : `${icons.length} results`}</div>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
              {icons.map((icon, index) => (
                <motion.div
                  key={`${icon.prefix}:${icon.name}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(index * 0.01, 0.3) }}
                  className="group relative flex aspect-square items-center justify-center rounded-lg border border-border bg-background transition-all hover:border-secondary focus-within:border-secondary"
                >
                  <img src={iconSvgUrl(icon, "#00d4ff")} alt="" className="h-6 w-6 transition-transform group-hover:scale-110" loading="lazy" />
                  <span className="sr-only">{icon.prefix}:{icon.name}</span>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg bg-background/95 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => void copySvg(icon)} className="rounded-md bg-primary p-1.5 text-primary-foreground" aria-label={`Copy ${icon.name} SVG`}><Copy className="h-3 w-3" /></button>
                      <button type="button" onClick={() => void downloadSvg(icon)} className="rounded-md border border-border p-1.5 text-foreground hover:bg-muted" aria-label={`Download ${icon.name} SVG`}><Download className="h-3 w-3" /></button>
                    </div>
                    <span className="mt-1 max-w-full truncate px-1 font-mono text-[8px] text-muted-foreground">{icon.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        <div className="mt-8 text-center">
          <a href="https://icon-sets.iconify.design/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-secondary">
            Browse all on Iconify <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default IconShowcase;
