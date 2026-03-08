import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Eye, Code2, Copy, Bookmark, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "All", "buttons", "cards", "inputs", "loaders", "checkboxes", "toggles",
];

interface ComponentFile {
  name: string;
  download_url: string;
  sha: string;
}

interface LoadedComponent {
  file: ComponentFile;
  html: string;
}

const UIComponents = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [files, setFiles] = useState<Record<string, ComponentFile[]>>({});
  const [components, setComponents] = useState<LoadedComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [savedComponents, setSavedComponents] = useState<Set<string>>(new Set());

  const fetchCategory = useCallback(async (category: string) => {
    const cacheKey = `pixvault_uiverse_${category}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached) as ComponentFile[];
    }

    try {
      const res = await fetch(
        `https://api.github.com/repos/uiverse-io/galaxy/contents/${category}`
      );
      if (!res.ok) throw new Error();
      const data: ComponentFile[] = await res.json();
      const htmlFiles = data.filter((f) => f.name.endsWith(".html")).slice(0, 9);
      sessionStorage.setItem(cacheKey, JSON.stringify(htmlFiles));
      return htmlFiles;
    } catch {
      return [];
    }
  }, []);

  const fetchComponentHTML = useCallback(async (file: ComponentFile): Promise<LoadedComponent> => {
    const cacheKey = `pixvault_html_${file.sha}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return { file, html: cached };

    try {
      const res = await fetch(file.download_url);
      const html = await res.text();
      sessionStorage.setItem(cacheKey, html);
      return { file, html };
    } catch {
      return { file, html: "<p style='color:#888;padding:20px;'>Failed to load</p>" };
    }
  }, []);

  const loadCategory = useCallback(async (category: string) => {
    setLoading(true);
    setError(false);
    try {
      let allFiles: ComponentFile[] = [];
      if (category === "All") {
        const results = await Promise.all(
          CATEGORIES.filter((c) => c !== "All").slice(0, 3).map(fetchCategory)
        );
        allFiles = results.flat().slice(0, 9);
      } else {
        allFiles = await fetchCategory(category);
      }

      if (allFiles.length === 0) {
        setError(true);
        setComponents([]);
      } else {
        const loaded = await Promise.all(allFiles.slice(0, 6).map(fetchComponentHTML));
        setComponents(loaded);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [fetchCategory, fetchComponentHTML]);

  useEffect(() => {
    loadCategory(activeCategory);
  }, [activeCategory, loadCategory]);

  const toggleFlip = (name: string) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const copyCode = (html: string) => {
    navigator.clipboard.writeText(html);
    toast.success("Code copied!");
  };

  const formatName = (filename: string) => {
    return filename
      .replace(".html", "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <section id="ui-components" className="relative py-24 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">
              MIT LICENSE · COPY-PASTE READY · POWERED BY GITHUB
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            Components that just work.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Live previews. One-click copy. CSS, Tailwind, and React — all free.
          </p>
        </div>

        {/* Category Pills */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 font-mono text-xs transition-all ${
                activeCategory === cat
                  ? "bg-secondary text-secondary-foreground"
                  : "border border-border text-muted-foreground hover:border-secondary hover:text-foreground"
              }`}
            >
              {cat === "All" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="mb-8 text-center text-muted-foreground">
            Failed to load components —{" "}
            <a
              href="https://github.com/uiverse-io/galaxy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:underline"
            >
              view on GitHub →
            </a>
          </div>
        )}

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`skel-${i}`}
                  className="h-[280px] rounded-lg shimmer"
                />
              ))
            : components.map((comp, i) => {
                const isFlipped = flippedCards.has(comp.file.name);
                return (
                  <motion.div
                    key={comp.file.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="overflow-hidden rounded-lg border border-border bg-card card-hover-violet"
                  >
                    {!isFlipped ? (
                      <>
                        {/* Preview */}
                        <div className="h-[180px] overflow-hidden bg-foreground/95">
                          <iframe
                            srcDoc={`<!DOCTYPE html><html><head><style>body{display:flex;align-items:center;justify-content:center;min-height:100%;margin:0;padding:16px;font-family:sans-serif;background:#fafafa;}</style></head><body>${comp.html}</body></html>`}
                            className="h-full w-full border-0"
                            sandbox="allow-scripts"
                            title={comp.file.name}
                            loading="lazy"
                          />
                        </div>
                        {/* Info */}
                        <div className="p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="font-display text-sm font-semibold text-foreground truncate">
                              {formatName(comp.file.name)}
                            </h3>
                            <span className="rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[10px] text-primary">
                              CSS
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleFlip(comp.file.name)}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Eye className="h-3 w-3" /> Preview
                            </button>
                            <button
                              onClick={() => toggleFlip(comp.file.name)}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Code2 className="h-3 w-3" /> Code
                            </button>
                            <button
                              onClick={() => copyCode(comp.html)}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Copy className="h-3 w-3" /> Copy
                            </button>
                            <button
                              onClick={() => {
                                setSavedComponents(prev => {
                                  const next = new Set(prev);
                                  if (next.has(comp.file.name)) next.delete(comp.file.name);
                                  else next.add(comp.file.name);
                                  return next;
                                });
                                toast.success("Saved!");
                              }}
                              className={`ml-auto rounded-md p-1 ${savedComponents.has(comp.file.name) ? "text-secondary" : "text-muted-foreground hover:text-foreground"}`}
                            >
                              <Bookmark className="h-3.5 w-3.5" fill={savedComponents.has(comp.file.name) ? "currentColor" : "none"} />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Code View */
                      <div className="relative h-[280px]">
                        <pre className="h-full overflow-auto bg-muted/80 p-4 font-mono text-[11px] text-muted-foreground leading-relaxed">
                          <code>{comp.html}</code>
                        </pre>
                        <div className="absolute bottom-3 right-3 flex gap-2">
                          <button
                            onClick={() => copyCode(comp.html)}
                            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground"
                          >
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                          <button
                            onClick={() => toggleFlip(comp.file.name)}
                            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[10px] text-foreground hover:bg-muted"
                          >
                            <Eye className="h-3 w-3" /> Preview
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
        </div>

        {!loading && !error && (
          <div className="mt-8 text-center">
            <a
              href="https://uiverse.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-secondary"
            >
              Browse all on UIverse <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default UIComponents;
