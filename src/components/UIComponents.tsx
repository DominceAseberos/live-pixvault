import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Eye, Code2, Copy, Bookmark, ExternalLink, Search, X } from "lucide-react";
import { toast } from "sonner";
import { copyText } from "@/lib/clipboard";
import { usePersistentSet } from "@/hooks/usePersistentSet";
import { listAIComponents } from "@/services/component.service";
import { componentIdentity, type UIComponent } from "@/types/resources";

const CATEGORIES = ["All", "Buttons", "Cards", "Inputs", "Forms", "Navigation", "Dialogs", "Tables", "Loaders", "Checkboxes", "Toggles", "Badges", "Alerts", "Avatars", "Tooltips", "Progress", "Empty States", "Cursors", "Errors"];

import { COMPONENTS } from "@/data/componentCatalog";

const IFRAME_STYLE = `<!DOCTYPE html><html><head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><style>*{box-sizing:border-box}body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:16px;font-family:system-ui,sans-serif;background:#0a0a14;}</style></head><body>`;

const UIComponents = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const { values: savedComponents, toggle: toggleSavedComponent } = usePersistentSet("pixvault_saved_components");
  const { data: dbComponents = [], isError: componentFeedFailed, refetch: refetchComponents } = useQuery({
    queryKey: ["components", "ai"],
    queryFn: listAIComponents,
  });
  
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const allComponents = useMemo(() => {
    return [...dbComponents, ...COMPONENTS];
  }, [dbComponents]);

  const filtered = useMemo(() => {
    return allComponents.filter(c => {
      const matchCat = activeCategory === "All" || c.category.toLowerCase() === activeCategory.toLowerCase();
      const matchSearch = search === "" || c.name.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, search, allComponents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedComponents = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const toggleFlip = (name: string) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const copyCode = async (html: string) => {
    try { await copyText(html); toast.success("Code copied"); }
    catch { toast.error("Clipboard access failed"); }
  };

  return (
    <section id="ui-components" className="relative py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">
              Open Source · Copy-Paste Ready
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            Components that just work.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Live previews, one-click copy, interactive CSS components — all free and ready to drop into your project.
          </p>
        </div>

        {/* Search bar */}
        <div className="mx-auto mb-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search components... e.g. "button", "card", "loader"'
              className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-11 pr-10 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-colors"
            />
            {search && (
              <button type="button" aria-label="Clear component search" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className="mb-10 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 font-mono text-xs transition-all ${
                activeCategory === cat
                  ? "bg-secondary text-secondary-foreground"
                  : "border border-border text-muted-foreground hover:border-secondary hover:text-foreground"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {componentFeedFailed && (
          <div role="status" className="mx-auto mb-6 flex max-w-2xl items-center justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-left text-sm text-muted-foreground">
            <span>AI-generated components are temporarily unavailable. The local library is still ready to use.</span>
            <button type="button" onClick={() => void refetchComponents()} className="shrink-0 font-mono text-xs text-foreground underline underline-offset-4">Retry</button>
          </div>
        )}

        {/* Result count */}
        <div className="mb-6 text-center">
          <span className="font-mono text-xs text-muted-foreground">
            {filtered.length} component{filtered.length !== 1 ? "s" : ""} found
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedComponents.map((comp, i) => {
            const uniqueKey = componentIdentity(comp);
            const isFlipped = flippedCards.has(uniqueKey);
            return (
              <motion.div key={uniqueKey} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="overflow-hidden rounded-lg border border-border bg-card card-hover-violet cursor-pointer">
                {!isFlipped ? (
                  <>
                    <div className="h-[180px] overflow-hidden">
                      <iframe
                        srcDoc={`${IFRAME_STYLE}${comp.html}</body></html>`}
                        className="h-full w-full border-0"
                        sandbox="allow-scripts"
                        title={comp.name}
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-display text-sm font-semibold text-foreground truncate capitalize">{comp.name}</h3>
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[10px] text-primary">CSS</span>
                      </div>
                      <div className="mb-3 font-mono text-[10px] text-muted-foreground">by @{comp.author}</div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleFlip(uniqueKey)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Code2 className="h-3 w-3" /> Code
                        </button>
                        <button onClick={() => copyCode(comp.html)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Copy className="h-3 w-3" /> Copy
                        </button>
                        <button type="button" aria-label={savedComponents.has(uniqueKey) ? `Remove ${comp.name} from saved` : `Save ${comp.name}`} onClick={() => {
                          const saved = toggleSavedComponent(uniqueKey);
                          toast.success(saved ? "Saved to this browser" : "Removed from saved");
                        }} className={`ml-auto rounded-md p-1 transition-colors ${savedComponents.has(uniqueKey) ? "text-secondary" : "text-muted-foreground hover:text-foreground"}`}>
                          <Bookmark className="h-3.5 w-3.5" fill={savedComponents.has(uniqueKey) ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="relative h-[296px]">
                    <pre className="h-full overflow-y-auto whitespace-pre-wrap break-all bg-muted/80 p-4 font-mono text-[11px] text-muted-foreground leading-relaxed">
                      <code>{comp.html}</code>
                    </pre>
                    <div className="absolute bottom-3 right-3 flex gap-2">
                      <button onClick={() => copyCode(comp.html)}
                        className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground">
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                      <button onClick={() => toggleFlip(uniqueKey)}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[10px] text-foreground hover:bg-muted">
                        <Eye className="h-3 w-3" /> Preview
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted text-foreground"
            >
              Previous
            </button>
            <span className="font-mono text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted text-foreground"
            >
              Next
            </button>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <p className="mb-3 text-sm">No components found for <span className="text-foreground">"{search}"</span></p>
            <button onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs hover:border-secondary hover:text-foreground transition-colors">
              <X className="h-3 w-3" /> Clear filters
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <a href="https://uiverse.io" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-secondary transition-colors">
            Browse more on UIverse <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default UIComponents;
