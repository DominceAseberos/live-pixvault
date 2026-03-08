import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Code2, Copy, Bookmark, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["All", "Buttons", "Cards", "Inputs", "Loaders", "Toggles", "Badges"];

interface SampleComponent {
  name: string;
  category: string;
  techTag: string;
  techColor: string;
  author: string;
  html: string;
}

const SAMPLE_COMPONENTS: SampleComponent[] = [
  {
    name: "Neon Glow Button",
    category: "Buttons",
    techTag: "CSS",
    techColor: "bg-primary/20 text-primary",
    author: "pixvault",
    html: `<button style="padding:12px 32px;font-size:16px;font-weight:600;color:#00d4ff;background:transparent;border:2px solid #00d4ff;border-radius:8px;cursor:pointer;transition:all 0.3s;box-shadow:0 0 10px #00d4ff40,inset 0 0 10px #00d4ff20;" onmouseover="this.style.background='#00d4ff';this.style.color='#080810';this.style.boxShadow='0 0 30px #00d4ff80'" onmouseout="this.style.background='transparent';this.style.color='#00d4ff';this.style.boxShadow='0 0 10px #00d4ff40,inset 0 0 10px #00d4ff20'">Hover Me</button>`,
  },
  {
    name: "Gradient Submit",
    category: "Buttons",
    techTag: "CSS",
    techColor: "bg-primary/20 text-primary",
    author: "designlab",
    html: `<button style="padding:14px 40px;font-size:15px;font-weight:700;color:white;background:linear-gradient(135deg,#7C3AED,#FF4D6D);border:none;border-radius:50px;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 4px 15px #7C3AED40;" onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 6px 25px #7C3AED60'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 4px 15px #7C3AED40'">Submit</button>`,
  },
  {
    name: "Glass Morphism Card",
    category: "Cards",
    techTag: "CSS",
    techColor: "bg-primary/20 text-primary",
    author: "ui_crafter",
    html: `<div style="padding:24px;width:220px;background:rgba(255,255,255,0.08);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.15);border-radius:16px;color:#f0f0ff;font-family:sans-serif;"><div style="font-size:14px;font-weight:700;margin-bottom:8px;">Glass Card</div><div style="font-size:12px;opacity:0.7;">Beautiful frosted glass effect with subtle border and blur.</div></div>`,
  },
  {
    name: "Floating Input",
    category: "Inputs",
    techTag: "CSS",
    techColor: "bg-primary/20 text-primary",
    author: "form_wizard",
    html: `<div style="position:relative;width:250px;"><input type="text" placeholder=" " style="width:100%;padding:14px 16px 6px;font-size:14px;background:#0F0F1A;border:1.5px solid #1E1E30;border-radius:8px;color:#f0f0ff;outline:none;transition:border 0.2s;" onfocus="this.style.borderColor='#00d4ff';this.nextElementSibling.style.color='#00d4ff';this.nextElementSibling.style.transform='translateY(-22px) scale(0.85)'" onblur="if(!this.value){this.style.borderColor='#1E1E30';this.nextElementSibling.style.color='#888';this.nextElementSibling.style.transform='translateY(0) scale(1)'}"/><label style="position:absolute;left:16px;top:12px;font-size:13px;color:#888;pointer-events:none;transition:all 0.2s;">Email address</label></div>`,
  },
  {
    name: "Pulse Loader",
    category: "Loaders",
    techTag: "CSS",
    techColor: "bg-primary/20 text-primary",
    author: "motion_dev",
    html: `<style>@keyframes pulse-dot{0%,100%{transform:scale(0.8);opacity:0.5}50%{transform:scale(1.2);opacity:1}}</style><div style="display:flex;gap:8px;align-items:center;"><div style="width:12px;height:12px;border-radius:50%;background:#00d4ff;animation:pulse-dot 1.2s ease-in-out infinite;"></div><div style="width:12px;height:12px;border-radius:50%;background:#7C3AED;animation:pulse-dot 1.2s ease-in-out 0.2s infinite;"></div><div style="width:12px;height:12px;border-radius:50%;background:#FF4D6D;animation:pulse-dot 1.2s ease-in-out 0.4s infinite;"></div></div>`,
  },
  {
    name: "Spinner Ring",
    category: "Loaders",
    techTag: "CSS",
    techColor: "bg-primary/20 text-primary",
    author: "loadify",
    html: `<style>@keyframes spin-ring{to{transform:rotate(360deg)}}</style><div style="width:40px;height:40px;border:3px solid #1E1E30;border-top-color:#00d4ff;border-radius:50%;animation:spin-ring 0.8s linear infinite;"></div>`,
  },
  {
    name: "Toggle Switch",
    category: "Toggles",
    techTag: "CSS",
    techColor: "bg-primary/20 text-primary",
    author: "switch_ui",
    html: `<label style="position:relative;display:inline-block;width:52px;height:28px;cursor:pointer;"><input type="checkbox" style="opacity:0;width:0;height:0;" onchange="this.nextElementSibling.style.background=this.checked?'#00d4ff':'#1E1E30';this.nextElementSibling.children[0].style.transform=this.checked?'translateX(24px)':'translateX(0)'"/><span style="position:absolute;inset:0;background:#1E1E30;border-radius:28px;transition:0.3s;"><span style="position:absolute;height:22px;width:22px;left:3px;bottom:3px;background:white;border-radius:50%;transition:0.3s;"></span></span></label>`,
  },
  {
    name: "Status Badge",
    category: "Badges",
    techTag: "CSS",
    techColor: "bg-primary/20 text-primary",
    author: "badge_pro",
    html: `<div style="display:flex;gap:8px;flex-wrap:wrap;"><span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;font-size:12px;font-weight:600;color:#00d4ff;background:#00d4ff15;border:1px solid #00d4ff30;border-radius:50px;"><span style="width:6px;height:6px;background:#00d4ff;border-radius:50%;"></span>Active</span><span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;font-size:12px;font-weight:600;color:#F59E0B;background:#F59E0B15;border:1px solid #F59E0B30;border-radius:50px;"><span style="width:6px;height:6px;background:#F59E0B;border-radius:50%;"></span>Pending</span><span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;font-size:12px;font-weight:600;color:#FF4D6D;background:#FF4D6D15;border:1px solid #FF4D6D30;border-radius:50px;"><span style="width:6px;height:6px;background:#FF4D6D;border-radius:50%;"></span>Error</span></div>`,
  },
  {
    name: "Outline Button Group",
    category: "Buttons",
    techTag: "CSS",
    techColor: "bg-primary/20 text-primary",
    author: "btn_master",
    html: `<div style="display:inline-flex;border-radius:8px;overflow:hidden;border:1px solid #1E1E30;"><button style="padding:10px 20px;font-size:13px;background:transparent;color:#f0f0ff;border:none;border-right:1px solid #1E1E30;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='#1E1E30'" onmouseout="this.style.background='transparent'">Left</button><button style="padding:10px 20px;font-size:13px;background:#7C3AED;color:white;border:none;border-right:1px solid #1E1E30;cursor:pointer;">Center</button><button style="padding:10px 20px;font-size:13px;background:transparent;color:#f0f0ff;border:none;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='#1E1E30'" onmouseout="this.style.background='transparent'">Right</button></div>`,
  },
];

const UIComponents = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [savedComponents, setSavedComponents] = useState<Set<string>>(new Set());

  const filtered = activeCategory === "All"
    ? SAMPLE_COMPONENTS
    : SAMPLE_COMPONENTS.filter((c) => c.category === activeCategory);

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

  return (
    <section id="ui-components" className="relative py-24 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">
              OPEN SOURCE · COPY-PASTE READY
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            Components that just work.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Live previews. One-click copy. CSS components — all free.
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
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((comp, i) => {
            const isFlipped = flippedCards.has(comp.name);
            return (
              <motion.div
                key={comp.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="overflow-hidden rounded-lg border border-border bg-card card-hover-violet"
              >
                {!isFlipped ? (
                  <>
                    {/* Preview */}
                    <div className="h-[180px] overflow-hidden">
                      <iframe
                        srcDoc={`<!DOCTYPE html><html><head><style>body{display:flex;align-items:center;justify-content:center;min-height:100%;margin:0;padding:16px;font-family:sans-serif;background:#fafafa;}</style></head><body>${comp.html}</body></html>`}
                        className="h-full w-full border-0 pointer-events-none"
                        sandbox="allow-scripts"
                        title={comp.name}
                        loading="lazy"
                      />
                    </div>
                    {/* Info */}
                    <div className="p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-display text-sm font-semibold text-foreground truncate">
                          {comp.name}
                        </h3>
                        <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${comp.techColor}`}>
                          {comp.techTag}
                        </span>
                      </div>
                      <div className="mb-3 font-mono text-[10px] text-muted-foreground">
                        by @{comp.author}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFlip(comp.name)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Code2 className="h-3 w-3" /> Code
                        </button>
                        <button
                          onClick={() => copyCode(comp.html)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Copy className="h-3 w-3" /> Copy
                        </button>
                        <button
                          onClick={() => {
                            setSavedComponents(prev => {
                              const next = new Set(prev);
                              if (next.has(comp.name)) next.delete(comp.name);
                              else next.add(comp.name);
                              return next;
                            });
                            toast.success("Saved!");
                          }}
                          className={`ml-auto rounded-md p-1 transition-colors ${savedComponents.has(comp.name) ? "text-secondary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          <Bookmark className="h-3.5 w-3.5" fill={savedComponents.has(comp.name) ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="relative h-[296px]">
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
                        onClick={() => toggleFlip(comp.name)}
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

        <div className="mt-8 text-center">
          <a
            href="https://uiverse.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-secondary transition-colors"
          >
            Browse more on UIverse <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default UIComponents;
