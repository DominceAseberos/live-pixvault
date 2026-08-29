import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bookmark, Code2, Copy, Eye, ExternalLink, Search, X } from "lucide-react";
import { toast } from "sonner";
import { COMPONENTS } from "@/data/componentCatalog";
import { copyText } from "@/lib/clipboard";
import { usePersistentSet } from "@/hooks/usePersistentSet";
import { countAIComponents, listAIComponents } from "@/services/component.service";
import { componentIdentity, type UIComponent } from "@/types/resources";

const CATEGORIES = [
  "All", "Buttons", "Cards", "Inputs", "Forms", "Navigation", "Dialogs", "Tables",
  "Loaders", "Checkboxes", "Toggles", "Badges", "Alerts", "Avatars", "Tooltips",
  "Progress", "Empty States", "Cursors", "Errors",
];

const ITEMS_PER_PAGE = 9;
const IFRAME_STYLE = `<!DOCTYPE html><html><head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><style>*{box-sizing:border-box}body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:16px;font-family:system-ui,sans-serif;background:#0a0a14;}</style></head><body>`;

const matchesLocalFilter = (component: UIComponent, category: string, search: string) => {
  const categoryMatches = category === "All" || component.category.toLowerCase() === category.toLowerCase();
  const normalized = search.trim().toLowerCase();
  const searchMatches = !normalized || `${component.name} ${component.category} ${component.description ?? ""}`.toLowerCase().includes(normalized);
  return categoryMatches && searchMatches;
};

const UIComponents = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const { values: savedComponents, toggle: toggleSavedComponent } = usePersistentSet("pixvault_saved_components");

  const localFiltered = useMemo(
    () => COMPONENTS.filter((component) => matchesLocalFilter(component, activeCategory, search)),
    [activeCategory, search],
  );

  const countQuery = useQuery({
    queryKey: ["components", "count", activeCategory, search],
    queryFn: () => countAIComponents({ category: activeCategory, q: search }),
  });
  const remoteTotal = countQuery.data ?? 0;
  const totalResults = localFiltered.length + remoteTotal;
  const totalPages = Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE));

  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const localPageItems = localFiltered.slice(pageStart, pageStart + ITEMS_PER_PAGE);
  const remoteOffset = Math.max(0, pageStart - localFiltered.length);
  const remoteLimit = Math.max(0, ITEMS_PER_PAGE - localPageItems.length);

  const pageQuery = useQuery({
    queryKey: ["components", "page", activeCategory, search, remoteOffset, remoteLimit],
    queryFn: () => listAIComponents({
      offset: remoteOffset,
      limit: remoteLimit || 1,
      category: activeCategory,
      q: search,
    }),
    enabled: remoteLimit > 0,
  });

  const paginatedComponents = useMemo(
    () => [...localPageItems, ...(pageQuery.data?.items ?? [])],
    [localPageItems, pageQuery.data?.items],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, search]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const componentFeedFailed = countQuery.isError || pageQuery.isError;
  const retryComponents = () => {
    void countQuery.refetch();
    if (remoteLimit > 0) void pageQuery.refetch();
  };

  const toggleFlip = (key: string) => {
    setFlippedCards((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const copyCode = async (html: string) => {
    try {
      await copyText(html);
      toast.success("Code copied");
    } catch {
      toast.error("Clipboard access failed");
    }
  };

  return (
    <section id="ui-components" className="relative bg-card py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">Open Source · Copy-Paste Ready</span>
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">Components that just work.</h2>
          <p className="mt-4 text-muted-foreground">Curated building blocks plus the recreated PIXVAULT community archive, loaded safely from Upstash.</p>
        </div>

        <div className="mx-auto mb-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Search components... e.g. "button", "card", "loader"'
              className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-11 pr-10 font-body text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            />
            {search && (
              <button type="button" aria-label="Clear component search" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-10 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 font-mono text-xs transition-all ${
                activeCategory === category
                  ? "bg-secondary text-secondary-foreground"
                  : "border border-border text-muted-foreground hover:border-secondary hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {componentFeedFailed && (
          <div role="status" className="mx-auto mb-6 flex max-w-2xl items-center justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-left text-sm text-muted-foreground">
            <span>The live Upstash library is temporarily unavailable. Curated local components remain usable.</span>
            <button type="button" onClick={retryComponents} className="shrink-0 font-mono text-xs text-foreground underline underline-offset-4">Retry</button>
          </div>
        )}

        <div className="mb-6 text-center">
          <span className="font-mono text-xs text-muted-foreground">
            {countQuery.isLoading ? "Counting library…" : `${totalResults} component${totalResults === 1 ? "" : "s"} found`}
          </span>
        </div>

        {pageQuery.isLoading && remoteLimit > 0 && localPageItems.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <div key={index} className="h-[296px] animate-pulse rounded-lg border border-border bg-muted/40" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedComponents.map((component, index) => {
              const uniqueKey = componentIdentity(component);
              const isFlipped = flippedCards.has(uniqueKey);
              return (
                <motion.article
                  key={uniqueKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="overflow-hidden rounded-lg border border-border bg-card card-hover-violet"
                >
                  {!isFlipped ? (
                    <>
                      <div className="h-[180px] overflow-hidden">
                        <iframe
                          srcDoc={`${IFRAME_STYLE}${component.html}</body></html>`}
                          className="h-full w-full border-0"
                          sandbox="allow-scripts"
                          title={component.name}
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h3 className="truncate font-display text-sm font-semibold capitalize text-foreground">{component.name}</h3>
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[10px] text-primary">
                            {component.provenance === "legacy-recreated" ? "ARCHIVE" : "CSS"}
                          </span>
                        </div>
                        <div className="mb-3 font-mono text-[10px] text-muted-foreground">by @{component.author}</div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => toggleFlip(uniqueKey)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                            <Code2 className="h-3 w-3" /> Code
                          </button>
                          <button type="button" onClick={() => void copyCode(component.html)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                          <button
                            type="button"
                            aria-label={savedComponents.has(uniqueKey) ? `Remove ${component.name} from saved` : `Save ${component.name}`}
                            onClick={() => {
                              const saved = toggleSavedComponent(uniqueKey);
                              toast.success(saved ? "Saved to this browser" : "Removed from saved");
                            }}
                            className={`ml-auto rounded-md p-1 transition-colors ${savedComponents.has(uniqueKey) ? "text-secondary" : "text-muted-foreground hover:text-foreground"}`}
                          >
                            <Bookmark className="h-3.5 w-3.5" fill={savedComponents.has(uniqueKey) ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="relative h-[296px]">
                      <pre className="h-full overflow-y-auto whitespace-pre-wrap break-all bg-muted/80 p-4 font-mono text-[11px] leading-relaxed text-muted-foreground"><code>{component.html}</code></pre>
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <button type="button" onClick={() => void copyCode(component.html)} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground"><Copy className="h-3 w-3" /> Copy</button>
                        <button type="button" onClick={() => toggleFlip(uniqueKey)} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[10px] text-foreground hover:bg-muted"><Eye className="h-3 w-3" /> Preview</button>
                      </div>
                    </div>
                  )}
                </motion.article>
              );
            })}
          </div>
        )}

        {totalResults === 0 && !countQuery.isLoading && (
          <div className="py-16 text-center text-muted-foreground">
            <p className="mb-3 text-sm">No components found for <span className="text-foreground">"{search}"</span></p>
            <button type="button" onClick={() => { setSearch(""); setActiveCategory("All"); }} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs transition-colors hover:border-secondary hover:text-foreground"><X className="h-3 w-3" /> Clear filters</button>
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label="Component pages" className="mt-12 flex items-center justify-center gap-4">
            <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
            <span className="font-mono text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
            <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">Next</button>
          </nav>
        )}

        <div className="mt-8 text-center">
          <a href="https://uiverse.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-secondary">
            Browse more on UIverse <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default UIComponents;
