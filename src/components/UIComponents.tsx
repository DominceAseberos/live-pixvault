import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bookmark, Code2, Copy, Eye, ExternalLink, Maximize2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { COMPONENTS } from "@/data/componentCatalog";
import { copyText } from "@/lib/clipboard";
import { usePersistentSet } from "@/hooks/usePersistentSet";
import { countAIComponents, listAIComponents } from "@/services/component.service";
import { componentIdentity, type UIComponent } from "@/types/resources";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FILTER_GROUPS = [
  { value: "all", label: "All", categories: [] },
  { value: "actions", label: "Actions", categories: ["Buttons", "Checkboxes", "Toggles"] },
  { value: "forms", label: "Forms & Input", categories: ["Inputs", "Forms"] },
  { value: "display", label: "Data Display", categories: ["Cards", "Tables", "Badges", "Avatars"] },
  { value: "feedback", label: "Feedback", categories: ["Alerts", "Loaders", "Progress", "Empty States", "Errors"] },
  { value: "navigation", label: "Navigation", categories: ["Navigation"] },
  { value: "overlays", label: "Overlays", categories: ["Dialogs", "Tooltips"] },
  { value: "utility", label: "Utility", categories: ["Cursors"] },
] as const;

type FilterGroupValue = (typeof FILTER_GROUPS)[number]["value"];

const ITEMS_PER_PAGE = 9;

// Generate responsive, auto-scaling iframe document where the component fits 100% inside card bounds without scrolling
const buildAutoFitIframeDoc = (html: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden !important;
      background: #0a0a14;
      color: #f0f0ff;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #stage-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden !important;
      padding: 16px;
    }
    #stage-content {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transform-origin: center center;
      transition: transform 0.12s ease-out;
      max-width: 100%;
    }
  </style>
</head>
<body>
  <div id="stage-wrapper">
    <div id="stage-content">
      ${html}
    </div>
  </div>
  <script>
    function autoFit() {
      var content = document.getElementById('stage-content');
      var wrapper = document.getElementById('stage-wrapper');
      if (!content || !wrapper) return;

      content.style.transform = 'none';

      var cw = content.scrollWidth || content.offsetWidth;
      var ch = content.scrollHeight || content.offsetHeight;
      var ww = wrapper.clientWidth - 20;
      var wh = wrapper.clientHeight - 20;

      if (cw > 0 && ch > 0 && ww > 0 && wh > 0) {
        var scale = Math.min(ww / cw, wh / ch, 1);
        if (scale < 0.98) {
          content.style.transform = 'scale(' + scale.toFixed(3) + ')';
        }
      }
    }
    window.addEventListener('load', autoFit);
    window.addEventListener('resize', autoFit);
    setTimeout(autoFit, 30);
    setTimeout(autoFit, 150);
    setTimeout(autoFit, 400);
  </script>
</body>
</html>`;

const buildModalIframeDoc = (html: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 24px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #080811;
      color: #f0f0ff;
      font-family: system-ui, -apple-system, sans-serif;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

const matchesLocalFilter = (component: UIComponent, categories: readonly string[], search: string) => {
  const categoryMatches =
    categories.length === 0 ||
    categories.some((category) => component.category.toLowerCase() === category.toLowerCase());
  const normalized = search.trim().toLowerCase();
  const searchMatches =
    !normalized ||
    `${component.name} ${component.category} ${component.description ?? ""}`.toLowerCase().includes(normalized);
  return categoryMatches && searchMatches;
};

const UIComponents = () => {
  const [activeGroup, setActiveGroup] = useState<FilterGroupValue>("all");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [modalComponent, setModalComponent] = useState<UIComponent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { values: savedComponents, toggle: toggleSavedComponent } = usePersistentSet("pixvault_saved_components");
  const activeGroupConfig = FILTER_GROUPS.find((group) => group.value === activeGroup) ?? FILTER_GROUPS[0];
  const selectedCategories = useMemo(
    () => (activeCategory !== "All" ? [activeCategory] : Array.from(activeGroupConfig.categories)),
    [activeCategory, activeGroupConfig],
  );
  const selectedCategoryKey = selectedCategories.join("|");
  const activeFilterLabel =
    activeCategory !== "All"
      ? activeCategory
      : activeGroup === "all"
        ? "All components"
        : activeGroupConfig.label;

  const localFiltered = useMemo(
    () => COMPONENTS.filter((component) => matchesLocalFilter(component, selectedCategories, search)),
    [search, selectedCategories],
  );

  const countQuery = useQuery({
    queryKey: ["components", "count", selectedCategoryKey, search],
    queryFn: () => countAIComponents({ categories: selectedCategories, q: search }),
  });
  const remoteTotal = countQuery.data ?? 0;
  const totalResults = localFiltered.length + remoteTotal;
  const totalPages = Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE));

  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const localPageItems = localFiltered.slice(pageStart, pageStart + ITEMS_PER_PAGE);
  const remoteOffset = Math.max(0, pageStart - localFiltered.length);
  const remoteLimit = Math.max(0, ITEMS_PER_PAGE - localPageItems.length);

  const pageQuery = useQuery({
    queryKey: ["components", "page", selectedCategoryKey, search, remoteOffset, remoteLimit],
    queryFn: () =>
      listAIComponents({
        offset: remoteOffset,
        limit: remoteLimit || 1,
        categories: selectedCategories,
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
  }, [selectedCategoryKey, search]);

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
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">
              Open Source · Copy-Paste Ready · Responsive Fit
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            Components that just work.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Curated building blocks plus the recreated PIXVAULT community archive. View full components directly without scrolling.
          </p>
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
              <button
                type="button"
                aria-label="Clear component search"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-10 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible">
            {FILTER_GROUPS.map((group) => (
              <button
                key={group.value}
                type="button"
                onClick={() => {
                  setActiveGroup(group.value);
                  setActiveCategory("All");
                }}
                className={`shrink-0 rounded-full px-4 py-2 font-mono text-xs transition-all ${
                  activeGroup === group.value
                    ? "bg-secondary text-secondary-foreground"
                    : "border border-border text-muted-foreground hover:border-secondary hover:text-foreground"
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>

          {activeGroupConfig.categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:justify-center sm:overflow-visible">
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Type</span>
              <button
                type="button"
                onClick={() => setActiveCategory("All")}
                className={`shrink-0 rounded-md border px-3 py-1.5 font-mono text-[11px] transition-colors ${
                  activeCategory === "All"
                    ? "border-secondary/60 bg-secondary/10 text-secondary"
                    : "border-border text-muted-foreground hover:border-secondary/60 hover:text-foreground"
                }`}
              >
                All {activeGroupConfig.label}
              </button>
              {activeGroupConfig.categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-md border px-3 py-1.5 font-mono text-[11px] transition-colors ${
                    activeCategory === category
                      ? "border-secondary/60 bg-secondary/10 text-secondary"
                      : "border-border text-muted-foreground hover:border-secondary/60 hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {componentFeedFailed && (
          <div
            role="status"
            className="mx-auto mb-6 flex max-w-2xl items-center justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-left text-sm text-muted-foreground"
          >
            <span>The live Upstash library is temporarily unavailable. Curated local components remain usable.</span>
            <button
              type="button"
              onClick={retryComponents}
              className="shrink-0 font-mono text-xs text-foreground underline underline-offset-4"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mb-6 text-center">
          <span className="font-mono text-xs text-muted-foreground">
            {countQuery.isLoading
              ? "Counting library…"
              : `${activeFilterLabel} · ${totalResults} component${totalResults === 1 ? "" : "s"}`}
          </span>
        </div>

        {pageQuery.isLoading && remoteLimit > 0 && localPageItems.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <div key={index} className="h-[340px] animate-pulse rounded-lg border border-border bg-muted/40" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedComponents.map((component, index) => {
              const uniqueKey = componentIdentity(component);
              const isFlipped = flippedCards.has(uniqueKey);

              return (
                <motion.article
                  key={uniqueKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="overflow-hidden rounded-xl border border-border bg-card card-hover-violet flex flex-col justify-between shadow-sm"
                >
                  {!isFlipped ? (
                    <>
                      {/* Responsive auto-fit preview container - Guaranteed NO scrollbars */}
                      <div className="relative h-[220px] w-full bg-[#0a0a14] overflow-hidden">
                        <iframe
                          srcDoc={buildAutoFitIframeDoc(component.html)}
                          className="h-full w-full border-0 select-none"
                          sandbox="allow-scripts"
                          title={component.name}
                          loading="lazy"
                        />
                        <button
                          type="button"
                          onClick={() => setModalComponent(component)}
                          className="absolute right-2 top-2 rounded-md bg-background/80 p-1.5 text-xs text-muted-foreground backdrop-blur-md opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-background transition-all"
                          title="View Full Size"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="p-4 border-t border-border/60 bg-card">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <h3
                            className="truncate font-display text-sm font-semibold capitalize text-foreground"
                            title={component.name}
                          >
                            {component.name}
                          </h3>
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[10px] text-primary shrink-0">
                            {component.provenance === "legacy-recreated" ? "ARCHIVE" : "CSS"}
                          </span>
                        </div>
                        <div className="mb-3 font-mono text-[10px] text-muted-foreground truncate">
                          by @{component.author}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleFlip(uniqueKey)}
                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground border border-border/50"
                          >
                            <Code2 className="h-3 w-3" /> Code
                          </button>
                          <button
                            type="button"
                            onClick={() => void copyCode(component.html)}
                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground border border-border/50"
                          >
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                          <button
                            type="button"
                            onClick={() => setModalComponent(component)}
                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground border border-border/50"
                            title="Interactive Full Preview"
                          >
                            <Eye className="h-3 w-3" /> Full
                          </button>
                          <button
                            type="button"
                            aria-label={
                              savedComponents.has(uniqueKey)
                                ? `Remove ${component.name} from saved`
                                : `Save ${component.name}`
                            }
                            onClick={() => {
                              const saved = toggleSavedComponent(uniqueKey);
                              toast.success(saved ? "Saved to this browser" : "Removed from saved");
                            }}
                            className={`ml-auto rounded-md p-1.5 transition-colors ${
                              savedComponents.has(uniqueKey)
                                ? "text-secondary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Bookmark
                              className="h-3.5 w-3.5"
                              fill={savedComponents.has(uniqueKey) ? "currentColor" : "none"}
                            />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="relative h-[336px] flex flex-col justify-between bg-muted/30">
                      <pre className="h-[275px] overflow-y-auto whitespace-pre-wrap break-all p-4 font-mono text-[11px] leading-relaxed text-muted-foreground border-b border-border/60">
                        <code>{component.html}</code>
                      </pre>
                      <div className="p-2.5 flex items-center justify-between bg-card">
                        <span className="font-mono text-[10px] text-muted-foreground px-2">HTML & CSS</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void copyCode(component.html)}
                            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                          >
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleFlip(uniqueKey)}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1 text-[11px] text-foreground hover:bg-muted transition-colors"
                          >
                            <Eye className="h-3 w-3" /> Preview
                          </button>
                        </div>
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
            <p className="mb-3 text-sm">
              No components found for <span className="text-foreground">"{search}"</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs transition-colors hover:border-secondary hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear filters
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label="Component pages" className="mt-12 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="font-mono text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        )}

        <div className="mt-8 text-center">
          <a
            href="https://uiverse.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-secondary"
          >
            Browse more on UIverse <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Full Component Interactive Preview Modal */}
      {modalComponent && (
        <Dialog open={Boolean(modalComponent)} onOpenChange={(open) => !open && setModalComponent(null)}>
          <DialogContent className="max-w-3xl w-[92vw] border-border bg-background p-6">
            <DialogHeader className="mb-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <DialogTitle className="font-display text-xl capitalize text-foreground">
                    {modalComponent.name}
                  </DialogTitle>
                  <p className="font-mono text-xs text-muted-foreground mt-1">
                    {modalComponent.category} · Author: @{modalComponent.author}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void copyCode(modalComponent.html)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity mr-6"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy Code
                </button>
              </div>
            </DialogHeader>

            <div className="h-[420px] w-full rounded-xl border border-border bg-[#080811] overflow-hidden">
              <iframe
                srcDoc={buildModalIframeDoc(modalComponent.html)}
                className="h-full w-full border-0"
                sandbox="allow-scripts"
                title={`${modalComponent.name} Full Preview`}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};

export default UIComponents;
