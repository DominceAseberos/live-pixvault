import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Download, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { copyText } from "@/lib/clipboard";
import { listPicsum, picsumImageUrl, type PicsumImage } from "@/services/picsum.service";

const IllustrationGallery = () => {
  const [images, setImages] = useState<PicsumImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const abortRef = useRef<AbortController | null>(null);

  const fetchImages = useCallback(async (p: number, append = false) => {
    setLoading(true);
    try {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const data = await listPicsum(p, controller.signal);
      setImages(prev => append ? [...prev, ...data] : data);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Could not load images");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchImages(1);
    return () => abortRef.current?.abort();
  }, [fetchImages]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    if (loading) return;
    void fetchImages(next, true);
  };

  const shuffle = () => {
    const randomPage = Math.floor(Math.random() * 30) + 1;
    setPage(randomPage);
    if (loading) return;
    void fetchImages(randomPage);
  };

  const getOptimizedUrl = picsumImageUrl;

  const copyUrl = async (id: string) => {
    try { await copyText(picsumImageUrl(id, 1920, 1080)); toast.success("Image URL copied"); }
    catch { toast.error("Clipboard access failed"); }
  };

  const downloadImage = async (image: PicsumImage) => {
    try {
      const res = await fetch(getOptimizedUrl(image.id, 1920, 1080));
      if (!res.ok) throw new Error(`Image request failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `picsum-${image.id}-by-${image.author}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Image downloaded");
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <section id="illustrations" className="relative py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              Free Stock · No Attribution Required · Powered by Picsum
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            Stunning visuals, zero cost.
          </h2>
          <p className="mt-4 text-muted-foreground">
            High-quality stock photos from Unsplash photographers, served instantly. Copy the URL or download full resolution.
          </p>
        </div>

        <div className="mb-10 flex justify-center">
          <button type="button" disabled={loading} onClick={shuffle}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-5 py-2.5 font-mono text-xs text-foreground transition-all hover:border-accent hover:bg-muted">
            <RefreshCw className="h-3.5 w-3.5" /> Shuffle Collection
          </button>
        </div>

        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {images.map((img, i) => {
            const aspectH = Math.round(300 * (img.height / img.width));
            return (
              <motion.div
                key={`${img.id}-${page}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
                className="group relative mb-3 break-inside-avoid overflow-hidden rounded-lg border border-border card-hover-coral"
              >
                <img
                  src={getOptimizedUrl(img.id, 400, aspectH)}
                  alt={`Photo by ${img.author}`}
                  className="w-full transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/20 to-transparent p-3 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                  <p className="mb-1 font-display text-xs font-semibold text-foreground">
                    by {img.author}
                  </p>
                  <p className="mb-2 font-mono text-[9px] text-muted-foreground">
                    {img.width} × {img.height}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => void copyUrl(img.id)}
                      className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground hover:opacity-90">
                      <Copy className="h-3 w-3" /> Copy URL
                    </button>
                    <button onClick={() => void downloadImage(img)}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[10px] text-foreground hover:bg-muted">
                      <Download className="h-3 w-3" /> Save
                    </button>
                  </div>
                  <a href={img.url} target="_blank" rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 font-mono text-[9px] text-muted-foreground hover:text-accent">
                    View on Unsplash <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </motion.div>
            );
          })}

          {loading && Array.from({ length: 8 }).map((_, i) => (
            <div key={`skel-${i}`} className="mb-3 break-inside-avoid rounded-lg shimmer" style={{ height: `${200 + (i % 3) * 60}px` }} />
          ))}
        </div>

        {!loading && images.length > 0 && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <button type="button" disabled={loading} onClick={loadMore}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-6 py-3 font-display text-sm font-semibold text-foreground transition-all hover:border-accent hover:bg-muted">
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default IllustrationGallery;
