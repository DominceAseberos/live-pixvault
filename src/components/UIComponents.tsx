import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Code2, Copy, Bookmark, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["All", "Buttons", "Cards", "Inputs", "Loaders", "Checkboxes", "Toggles"];

interface UIComponent {
  name: string;
  category: string;
  author: string;
  html: string;
  sourceUrl: string;
}

const COMPONENTS: UIComponent[] = [
  {
    name: "Neon Glow Button",
    category: "Buttons",
    author: "pixvault",
    sourceUrl: "https://uiverse.io",
    html: `<button style="padding:12px 32px;font-size:16px;font-weight:600;color:#00d4ff;background:transparent;border:2px solid #00d4ff;border-radius:8px;cursor:pointer;transition:all 0.3s;box-shadow:0 0 10px #00d4ff40,inset 0 0 10px #00d4ff20;" onmouseover="this.style.background='#00d4ff';this.style.color='#080810';this.style.boxShadow='0 0 30px #00d4ff80'" onmouseout="this.style.background='transparent';this.style.color='#00d4ff';this.style.boxShadow='0 0 10px #00d4ff40,inset 0 0 10px #00d4ff20'">Hover Me</button>`,
  },
  {
    name: "Gradient Submit",
    category: "Buttons",
    author: "designlab",
    sourceUrl: "https://uiverse.io",
    html: `<button style="padding:14px 40px;font-size:15px;font-weight:700;color:white;background:linear-gradient(135deg,#7C3AED,#FF4D6D);border:none;border-radius:50px;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 4px 15px #7C3AED40;" onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 6px 25px #7C3AED60'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 4px 15px #7C3AED40'">Submit</button>`,
  },
  {
    name: "Ripple Button",
    category: "Buttons",
    author: "ripple_fx",
    sourceUrl: "https://uiverse.io",
    html: `<button style="position:relative;padding:12px 36px;font-size:14px;font-weight:600;color:white;background:#1a1a2e;border:1px solid #333;border-radius:8px;cursor:pointer;overflow:hidden;transition:all 0.3s;" onmouseover="this.style.borderColor='#00d4ff';this.style.boxShadow='0 0 20px #00d4ff30'" onmouseout="this.style.borderColor='#333';this.style.boxShadow='none'" onclick="const r=document.createElement('span');r.style.cssText='position:absolute;border-radius:50%;background:rgba(0,212,255,0.3);width:100px;height:100px;transform:translate(-50%,-50%) scale(0);animation:ripple 0.6s linear;pointer-events:none;';r.style.left=event.offsetX+'px';r.style.top=event.offsetY+'px';this.appendChild(r);setTimeout(()=>r.remove(),600)">Click me<style>@keyframes ripple{to{transform:translate(-50%,-50%) scale(4);opacity:0}}</style></button>`,
  },
  {
    name: "3D Push Button",
    category: "Buttons",
    author: "depth_ui",
    sourceUrl: "https://uiverse.io",
    html: `<button style="padding:14px 36px;font-size:14px;font-weight:700;color:white;background:#7C3AED;border:none;border-radius:10px;cursor:pointer;box-shadow:0 6px 0 #5b21b6,0 8px 15px rgba(0,0,0,0.3);transition:all 0.1s;transform:translateY(0);" onmousedown="this.style.transform='translateY(4px)';this.style.boxShadow='0 2px 0 #5b21b6,0 3px 8px rgba(0,0,0,0.3)'" onmouseup="this.style.transform='translateY(0)';this.style.boxShadow='0 6px 0 #5b21b6,0 8px 15px rgba(0,0,0,0.3)'" onmouseleave="this.style.transform='translateY(0)';this.style.boxShadow='0 6px 0 #5b21b6,0 8px 15px rgba(0,0,0,0.3)'">Push me</button>`,
  },
  {
    name: "Outline Shine",
    category: "Buttons",
    author: "shiny_dev",
    sourceUrl: "https://uiverse.io",
    html: `<button style="position:relative;padding:12px 32px;font-size:14px;font-weight:600;color:#f0f0ff;background:transparent;border:1.5px solid #333;border-radius:8px;cursor:pointer;overflow:hidden;transition:border-color 0.3s;" onmouseover="this.style.borderColor='#FF4D6D'" onmouseout="this.style.borderColor='#333'"><span style="position:relative;z-index:1;">Shine ✨</span><span style="position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,77,109,0.15),transparent);animation:shine 2s infinite;"></span><style>@keyframes shine{to{left:100%}}</style></button>`,
  },
  {
    name: "Glass Morphism Card",
    category: "Cards",
    author: "ui_crafter",
    sourceUrl: "https://uiverse.io",
    html: `<div style="padding:24px;width:220px;background:rgba(255,255,255,0.06);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.1);border-radius:16px;color:#f0f0ff;font-family:sans-serif;"><div style="font-size:14px;font-weight:700;margin-bottom:8px;">Glass Card</div><div style="font-size:12px;opacity:0.7;">Beautiful frosted glass effect with subtle border and blur.</div></div>`,
  },
  {
    name: "Stat Card",
    category: "Cards",
    author: "dash_ui",
    sourceUrl: "https://uiverse.io",
    html: `<div style="padding:20px;width:200px;background:#111122;border:1px solid #1e1e30;border-radius:12px;font-family:sans-serif;"><div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Revenue</div><div style="font-size:28px;font-weight:800;color:#f0f0ff;margin-bottom:4px;">$24.5k</div><div style="display:flex;align-items:center;gap:4px;font-size:12px;color:#22c55e;">↑ 12.5%<span style="color:#666;margin-left:4px;">vs last month</span></div></div>`,
  },
  {
    name: "Profile Card",
    category: "Cards",
    author: "card_master",
    sourceUrl: "https://uiverse.io",
    html: `<div style="padding:20px;width:200px;background:#111122;border:1px solid #1e1e30;border-radius:14px;font-family:sans-serif;text-align:center;"><div style="width:48px;height:48px;margin:0 auto 12px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#00d4ff);display:flex;align-items:center;justify-content:center;font-size:20px;color:white;">A</div><div style="font-size:14px;font-weight:700;color:#f0f0ff;">Alex Morgan</div><div style="font-size:11px;color:#888;margin:4px 0 12px;">@alexm · Designer</div><div style="display:flex;justify-content:center;gap:16px;"><div style="text-align:center;"><div style="font-size:14px;font-weight:700;color:#f0f0ff;">248</div><div style="font-size:10px;color:#666;">Posts</div></div><div style="text-align:center;"><div style="font-size:14px;font-weight:700;color:#f0f0ff;">12k</div><div style="font-size:10px;color:#666;">Followers</div></div></div></div>`,
  },
  {
    name: "Floating Input",
    category: "Inputs",
    author: "form_wizard",
    sourceUrl: "https://uiverse.io",
    html: `<div style="position:relative;width:250px;"><input type="text" placeholder=" " style="width:100%;padding:14px 16px 6px;font-size:14px;background:#0F0F1A;border:1.5px solid #1E1E30;border-radius:8px;color:#f0f0ff;outline:none;transition:border 0.2s;" onfocus="this.style.borderColor='#00d4ff';this.nextElementSibling.style.color='#00d4ff';this.nextElementSibling.style.transform='translateY(-22px) scale(0.85)'" onblur="if(!this.value){this.style.borderColor='#1E1E30';this.nextElementSibling.style.color='#888';this.nextElementSibling.style.transform='translateY(0) scale(1)'}"/><label style="position:absolute;left:16px;top:12px;font-size:13px;color:#888;pointer-events:none;transition:all 0.2s;">Email address</label></div>`,
  },
  {
    name: "Search Bar",
    category: "Inputs",
    author: "search_pro",
    sourceUrl: "https://uiverse.io",
    html: `<div style="display:flex;align-items:center;width:280px;padding:0 4px 0 14px;background:#111122;border:1.5px solid #1e1e30;border-radius:10px;transition:border 0.2s;" onfocusin="this.style.borderColor='#7C3AED'" onfocusout="this.style.borderColor='#1e1e30'"><svg style="width:16px;height:16px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Search components..." style="flex:1;padding:12px 10px;font-size:13px;background:transparent;border:none;outline:none;color:#f0f0ff;"/><button style="padding:6px 14px;font-size:11px;font-weight:600;color:white;background:#7C3AED;border:none;border-radius:7px;cursor:pointer;">Go</button></div>`,
  },
  {
    name: "OTP Input",
    category: "Inputs",
    author: "auth_ui",
    sourceUrl: "https://uiverse.io",
    html: `<div style="display:flex;gap:8px;"><input maxlength="1" style="width:44px;height:52px;text-align:center;font-size:20px;font-weight:700;background:#111122;border:1.5px solid #1e1e30;border-radius:10px;color:#f0f0ff;outline:none;transition:border 0.2s;" onfocus="this.style.borderColor='#00d4ff'" onblur="this.style.borderColor='#1e1e30'" oninput="if(this.value)this.nextElementSibling?.focus()"/><input maxlength="1" style="width:44px;height:52px;text-align:center;font-size:20px;font-weight:700;background:#111122;border:1.5px solid #1e1e30;border-radius:10px;color:#f0f0ff;outline:none;transition:border 0.2s;" onfocus="this.style.borderColor='#00d4ff'" onblur="this.style.borderColor='#1e1e30'" oninput="if(this.value)this.nextElementSibling?.focus()"/><input maxlength="1" style="width:44px;height:52px;text-align:center;font-size:20px;font-weight:700;background:#111122;border:1.5px solid #1e1e30;border-radius:10px;color:#f0f0ff;outline:none;transition:border 0.2s;" onfocus="this.style.borderColor='#00d4ff'" onblur="this.style.borderColor='#1e1e30'" oninput="if(this.value)this.nextElementSibling?.focus()"/><input maxlength="1" style="width:44px;height:52px;text-align:center;font-size:20px;font-weight:700;background:#111122;border:1.5px solid #1e1e30;border-radius:10px;color:#f0f0ff;outline:none;transition:border 0.2s;" onfocus="this.style.borderColor='#00d4ff'" onblur="this.style.borderColor='#1e1e30'"/></div>`,
  },
  {
    name: "Pulse Loader",
    category: "Loaders",
    author: "motion_dev",
    sourceUrl: "https://uiverse.io",
    html: `<style>@keyframes pulse-dot{0%,100%{transform:scale(0.8);opacity:0.5}50%{transform:scale(1.2);opacity:1}}</style><div style="display:flex;gap:8px;align-items:center;"><div style="width:12px;height:12px;border-radius:50%;background:#00d4ff;animation:pulse-dot 1.2s ease-in-out infinite;"></div><div style="width:12px;height:12px;border-radius:50%;background:#7C3AED;animation:pulse-dot 1.2s ease-in-out 0.2s infinite;"></div><div style="width:12px;height:12px;border-radius:50%;background:#FF4D6D;animation:pulse-dot 1.2s ease-in-out 0.4s infinite;"></div></div>`,
  },
  {
    name: "Spinner Ring",
    category: "Loaders",
    author: "loadify",
    sourceUrl: "https://uiverse.io",
    html: `<style>@keyframes spin-ring{to{transform:rotate(360deg)}}</style><div style="width:40px;height:40px;border:3px solid #1E1E30;border-top-color:#00d4ff;border-radius:50%;animation:spin-ring 0.8s linear infinite;"></div>`,
  },
  {
    name: "Skeleton Loader",
    category: "Loaders",
    author: "skelly",
    sourceUrl: "https://uiverse.io",
    html: `<style>@keyframes skele{0%{background-position:-200% 0}100%{background-position:200% 0}}</style><div style="width:220px;padding:16px;background:#111122;border-radius:12px;"><div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(90deg,#1e1e30 25%,#2a2a40 50%,#1e1e30 75%);background-size:200%;animation:skele 1.5s infinite;margin-bottom:12px;"></div><div style="height:12px;width:70%;border-radius:4px;background:linear-gradient(90deg,#1e1e30 25%,#2a2a40 50%,#1e1e30 75%);background-size:200%;animation:skele 1.5s infinite;margin-bottom:8px;"></div><div style="height:10px;width:100%;border-radius:4px;background:linear-gradient(90deg,#1e1e30 25%,#2a2a40 50%,#1e1e30 75%);background-size:200%;animation:skele 1.5s infinite;margin-bottom:6px;"></div><div style="height:10px;width:85%;border-radius:4px;background:linear-gradient(90deg,#1e1e30 25%,#2a2a40 50%,#1e1e30 75%);background-size:200%;animation:skele 1.5s infinite;"></div></div>`,
  },
  {
    name: "Bouncing Bars",
    category: "Loaders",
    author: "bar_fx",
    sourceUrl: "https://uiverse.io",
    html: `<style>@keyframes bounce-bar{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1)}}</style><div style="display:flex;gap:4px;align-items:end;height:32px;"><div style="width:4px;height:100%;background:#FF4D6D;border-radius:2px;animation:bounce-bar 0.8s ease-in-out infinite;"></div><div style="width:4px;height:100%;background:#7C3AED;border-radius:2px;animation:bounce-bar 0.8s ease-in-out 0.1s infinite;"></div><div style="width:4px;height:100%;background:#00d4ff;border-radius:2px;animation:bounce-bar 0.8s ease-in-out 0.2s infinite;"></div><div style="width:4px;height:100%;background:#F59E0B;border-radius:2px;animation:bounce-bar 0.8s ease-in-out 0.3s infinite;"></div><div style="width:4px;height:100%;background:#22c55e;border-radius:2px;animation:bounce-bar 0.8s ease-in-out 0.4s infinite;"></div></div>`,
  },
  {
    name: "Checkbox Tick",
    category: "Checkboxes",
    author: "check_dev",
    sourceUrl: "https://uiverse.io",
    html: `<label style="display:flex;align-items:center;gap:10px;cursor:pointer;color:#f0f0ff;font-family:sans-serif;font-size:14px;"><input type="checkbox" style="display:none;" onchange="this.nextElementSibling.style.background=this.checked?'#7C3AED':'transparent';this.nextElementSibling.style.borderColor=this.checked?'#7C3AED':'#1E1E30';this.nextElementSibling.children[0].style.opacity=this.checked?'1':'0'"/><span style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;border:2px solid #1E1E30;border-radius:6px;transition:all 0.2s;"><svg style="width:14px;height:14px;opacity:0;transition:opacity 0.2s;" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>Accept terms</label>`,
  },
  {
    name: "Radio Pills",
    category: "Checkboxes",
    author: "pill_ui",
    sourceUrl: "https://uiverse.io",
    html: `<div style="display:flex;gap:6px;font-family:sans-serif;"><label style="cursor:pointer;"><input type="radio" name="plan" style="display:none;" onchange="document.querySelectorAll('[data-pill]').forEach(e=>{e.style.background='transparent';e.style.borderColor='#1e1e30';e.style.color='#888'});this.nextElementSibling.style.background='#7C3AED';this.nextElementSibling.style.borderColor='#7C3AED';this.nextElementSibling.style.color='white'" checked/><span data-pill style="display:inline-block;padding:8px 18px;font-size:12px;font-weight:600;border:1.5px solid #7C3AED;border-radius:50px;background:#7C3AED;color:white;transition:all 0.2s;">Free</span></label><label style="cursor:pointer;"><input type="radio" name="plan" style="display:none;" onchange="document.querySelectorAll('[data-pill]').forEach(e=>{e.style.background='transparent';e.style.borderColor='#1e1e30';e.style.color='#888'});this.nextElementSibling.style.background='#7C3AED';this.nextElementSibling.style.borderColor='#7C3AED';this.nextElementSibling.style.color='white'"/><span data-pill style="display:inline-block;padding:8px 18px;font-size:12px;font-weight:600;border:1.5px solid #1e1e30;border-radius:50px;background:transparent;color:#888;transition:all 0.2s;">Pro</span></label><label style="cursor:pointer;"><input type="radio" name="plan" style="display:none;" onchange="document.querySelectorAll('[data-pill]').forEach(e=>{e.style.background='transparent';e.style.borderColor='#1e1e30';e.style.color='#888'});this.nextElementSibling.style.background='#7C3AED';this.nextElementSibling.style.borderColor='#7C3AED';this.nextElementSibling.style.color='white'"/><span data-pill style="display:inline-block;padding:8px 18px;font-size:12px;font-weight:600;border:1.5px solid #1e1e30;border-radius:50px;background:transparent;color:#888;transition:all 0.2s;">Team</span></label></div>`,
  },
  {
    name: "Toggle Switch",
    category: "Toggles",
    author: "switch_ui",
    sourceUrl: "https://uiverse.io",
    html: `<label style="position:relative;display:inline-block;width:52px;height:28px;cursor:pointer;"><input type="checkbox" style="opacity:0;width:0;height:0;" onchange="this.nextElementSibling.style.background=this.checked?'#00d4ff':'#1E1E30';this.nextElementSibling.children[0].style.transform=this.checked?'translateX(24px)':'translateX(0)'"/><span style="position:absolute;inset:0;background:#1E1E30;border-radius:28px;transition:0.3s;"><span style="position:absolute;height:22px;width:22px;left:3px;bottom:3px;background:white;border-radius:50%;transition:0.3s;"></span></span></label>`,
  },
  {
    name: "Dark Mode Toggle",
    category: "Toggles",
    author: "theme_ui",
    sourceUrl: "https://uiverse.io",
    html: `<label style="position:relative;display:inline-flex;align-items:center;gap:10px;cursor:pointer;font-family:sans-serif;"><input type="checkbox" style="opacity:0;width:0;height:0;position:absolute;" onchange="const t=this.nextElementSibling;t.style.background=this.checked?'#1a1a2e':'#F59E0B';t.children[0].style.transform=this.checked?'translateX(24px)':'translateX(0)';t.children[0].textContent=this.checked?'🌙':'☀️'"/><span style="position:relative;display:inline-block;width:52px;height:28px;background:#F59E0B;border-radius:28px;transition:0.3s;"><span style="position:absolute;height:22px;width:22px;left:3px;top:3px;background:white;border-radius:50%;transition:0.3s;display:flex;align-items:center;justify-content:center;font-size:12px;">☀️</span></span><span style="font-size:12px;color:#888;">Theme</span></label>`,
  },
  {
    name: "Status Badge",
    category: "Buttons",
    author: "badge_pro",
    sourceUrl: "https://uiverse.io",
    html: `<div style="display:flex;gap:8px;flex-wrap:wrap;"><span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;font-size:12px;font-weight:600;color:#00d4ff;background:#00d4ff15;border:1px solid #00d4ff30;border-radius:50px;"><span style="width:6px;height:6px;background:#00d4ff;border-radius:50%;"></span>Active</span><span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;font-size:12px;font-weight:600;color:#F59E0B;background:#F59E0B15;border:1px solid #F59E0B30;border-radius:50px;"><span style="width:6px;height:6px;background:#F59E0B;border-radius:50%;"></span>Pending</span><span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;font-size:12px;font-weight:600;color:#FF4D6D;background:#FF4D6D15;border:1px solid #FF4D6D30;border-radius:50px;"><span style="width:6px;height:6px;background:#FF4D6D;border-radius:50%;"></span>Error</span></div>`,
  },
];

const IFRAME_STYLE = `<!DOCTYPE html><html><head><style>*{box-sizing:border-box}body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:16px;font-family:system-ui,sans-serif;background:#0a0a14;}</style></head><body>`;

const UIComponents = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [savedComponents, setSavedComponents] = useState<Set<string>>(new Set());

  const filtered = activeCategory === "All"
    ? COMPONENTS
    : COMPONENTS.filter(c => c.category.toLowerCase() === activeCategory.toLowerCase());

  const toggleFlip = (name: string) => {
    setFlippedCards(prev => {
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
            Live previews. One-click copy. Interactive CSS components — all free.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((comp, i) => {
            const isFlipped = flippedCards.has(comp.name);
            return (
              <motion.div key={comp.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="overflow-hidden rounded-lg border border-border bg-card card-hover-violet">
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
                        <button onClick={() => toggleFlip(comp.name)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Code2 className="h-3 w-3" /> Code
                        </button>
                        <button onClick={() => copyCode(comp.html)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Copy className="h-3 w-3" /> Copy
                        </button>
                        <button onClick={() => {
                          setSavedComponents(prev => { const n = new Set(prev); if (n.has(comp.name)) n.delete(comp.name); else n.add(comp.name); return n; });
                          toast.success("Saved!");
                        }} className={`ml-auto rounded-md p-1 transition-colors ${savedComponents.has(comp.name) ? "text-secondary" : "text-muted-foreground hover:text-foreground"}`}>
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
                      <button onClick={() => copyCode(comp.html)}
                        className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground">
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                      <button onClick={() => toggleFlip(comp.name)}
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
