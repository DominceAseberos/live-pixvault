import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Eye, Code2, Copy, Bookmark, ExternalLink, Search, X } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["All", "Buttons", "Cards", "Inputs", "Loaders", "Checkboxes", "Toggles", "Badges", "Alerts", "Avatars", "Tooltips", "Progress"];

interface UIComponent {
  name: string;
  category: string;
  author: string;
  html: string;
  sourceUrl: string;
}

const COMPONENTS: UIComponent[] = [
  // ── BUTTONS ──────────────────────────────────────────────────────────────
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

  // ── BADGES ───────────────────────────────────────────────────────────────
  {
    name: "Gradient Badge",
    category: "Badges",
    author: "badge_lab",
    sourceUrl: "https://uiverse.io",
    html: `<div style="display:flex;gap:8px;flex-wrap:wrap;font-family:sans-serif;"><span style="padding:4px 14px;font-size:11px;font-weight:700;color:white;background:linear-gradient(135deg,#7C3AED,#00d4ff);border-radius:50px;">NEW</span><span style="padding:4px 14px;font-size:11px;font-weight:700;color:white;background:linear-gradient(135deg,#FF4D6D,#F59E0B);border-radius:50px;">HOT</span><span style="padding:4px 14px;font-size:11px;font-weight:700;color:white;background:linear-gradient(135deg,#22c55e,#00d4ff);border-radius:50px;">FREE</span></div>`,
  },
  {
    name: "Outline Tags",
    category: "Badges",
    author: "tag_ui",
    sourceUrl: "https://uiverse.io",
    html: `<div style="display:flex;gap:6px;flex-wrap:wrap;font-family:sans-serif;"><span style="padding:3px 10px;font-size:11px;font-weight:600;color:#7C3AED;border:1.5px solid #7C3AED;border-radius:4px;">React</span><span style="padding:3px 10px;font-size:11px;font-weight:600;color:#00d4ff;border:1.5px solid #00d4ff;border-radius:4px;">TypeScript</span><span style="padding:3px 10px;font-size:11px;font-weight:600;color:#FF4D6D;border:1.5px solid #FF4D6D;border-radius:4px;">Tailwind</span><span style="padding:3px 10px;font-size:11px;font-weight:600;color:#F59E0B;border:1.5px solid #F59E0B;border-radius:4px;">Vite</span></div>`,
  },
  {
    name: "Notification Dot",
    category: "Badges",
    author: "notif_ui",
    sourceUrl: "https://uiverse.io",
    html: `<style>@keyframes ping{75%,100%{transform:scale(2);opacity:0}}</style><div style="display:flex;gap:20px;font-family:sans-serif;"><div style="position:relative;display:inline-block;"><div style="width:40px;height:40px;background:#111122;border:1px solid #1e1e30;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;">🔔</div><span style="position:absolute;-top:4px;right:-4px;top:-4px;"><span style="position:absolute;display:inline-flex;width:12px;height:12px;border-radius:50%;background:#FF4D6D;opacity:0.75;animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;"></span><span style="position:relative;display:inline-flex;width:12px;height:12px;border-radius:50%;background:#FF4D6D;"></span></span></div><div style="position:relative;display:inline-block;"><div style="width:40px;height:40px;background:#111122;border:1px solid #1e1e30;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;">💬</div><span style="position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;padding:0 4px;background:#7C3AED;border-radius:50px;font-size:10px;font-weight:700;color:white;display:flex;align-items:center;justify-content:center;">12</span></div></div>`,
  },

  // ── ALERTS ───────────────────────────────────────────────────────────────
  {
    name: "Success Alert",
    category: "Alerts",
    author: "alert_ui",
    sourceUrl: "https://uiverse.io",
    html: `<div style="display:flex;align-items:flex-start;gap:12px;padding:14px 16px;background:#22c55e15;border:1px solid #22c55e40;border-radius:10px;width:260px;font-family:sans-serif;"><span style="font-size:18px;flex-shrink:0;">✅</span><div><div style="font-size:13px;font-weight:700;color:#22c55e;margin-bottom:2px;">Success!</div><div style="font-size:11px;color:#888;">Your changes have been saved.</div></div></div>`,
  },
  {
    name: "Warning Alert",
    category: "Alerts",
    author: "alert_ui",
    sourceUrl: "https://uiverse.io",
    html: `<div style="display:flex;align-items:flex-start;gap:12px;padding:14px 16px;background:#F59E0B15;border:1px solid #F59E0B40;border-radius:10px;width:260px;font-family:sans-serif;"><span style="font-size:18px;flex-shrink:0;">⚠️</span><div><div style="font-size:13px;font-weight:700;color:#F59E0B;margin-bottom:2px;">Warning</div><div style="font-size:11px;color:#888;">This action cannot be undone.</div></div></div>`,
  },
  {
    name: "Error Alert",
    category: "Alerts",
    author: "alert_ui",
    sourceUrl: "https://uiverse.io",
    html: `<div style="display:flex;align-items:flex-start;gap:12px;padding:14px 16px;background:#FF4D6D15;border:1px solid #FF4D6D40;border-radius:10px;width:260px;font-family:sans-serif;"><span style="font-size:18px;flex-shrink:0;">❌</span><div><div style="font-size:13px;font-weight:700;color:#FF4D6D;margin-bottom:2px;">Error</div><div style="font-size:11px;color:#888;">Something went wrong. Try again.</div></div></div>`,
  },
  {
    name: "Info Banner",
    category: "Alerts",
    author: "banner_dev",
    sourceUrl: "https://uiverse.io",
    html: `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:#00d4ff10;border:1px solid #00d4ff30;border-radius:10px;width:260px;font-family:sans-serif;"><div style="display:flex;align-items:center;gap:10px;"><span style="font-size:16px;">ℹ️</span><span style="font-size:12px;color:#00d4ff;">New version available!</span></div><button style="padding:4px 10px;font-size:11px;font-weight:600;color:#0a0a14;background:#00d4ff;border:none;border-radius:6px;cursor:pointer;">Update</button></div>`,
  },

  // ── AVATARS ───────────────────────────────────────────────────────────────
  {
    name: "Avatar Stack",
    category: "Avatars",
    author: "avatar_ui",
    sourceUrl: "https://uiverse.io",
    html: `<div style="display:flex;font-family:sans-serif;"><div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#00d4ff);border:2px solid #0a0a14;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:white;z-index:4;">A</div><div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#FF4D6D,#F59E0B);border:2px solid #0a0a14;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:white;margin-left:-10px;z-index:3;">B</div><div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#00d4ff);border:2px solid #0a0a14;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:white;margin-left:-10px;z-index:2;">C</div><div style="width:36px;height:36px;border-radius:50%;background:#1e1e30;border:2px solid #0a0a14;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#888;margin-left:-10px;z-index:1;">+9</div></div>`,
  },
  {
    name: "Avatar with Status",
    category: "Avatars",
    author: "avatar_pro",
    sourceUrl: "https://uiverse.io",
    html: `<div style="display:flex;gap:16px;font-family:sans-serif;"><div style="position:relative;"><div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#00d4ff);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:white;">J</div><span style="position:absolute;bottom:1px;right:1px;width:11px;height:11px;background:#22c55e;border-radius:50%;border:2px solid #0a0a14;"></span></div><div style="position:relative;"><div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#FF4D6D,#F59E0B);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:white;">K</div><span style="position:absolute;bottom:1px;right:1px;width:11px;height:11px;background:#F59E0B;border-radius:50%;border:2px solid #0a0a14;"></span></div><div style="position:relative;"><div style="width:44px;height:44px;border-radius:50%;background:#1e1e30;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#888;">M</div><span style="position:absolute;bottom:1px;right:1px;width:11px;height:11px;background:#555;border-radius:50%;border:2px solid #0a0a14;"></span></div></div>`,
  },

  // ── TOOLTIPS ──────────────────────────────────────────────────────────────
  {
    name: "Hover Tooltip",
    category: "Tooltips",
    author: "tip_ui",
    sourceUrl: "https://uiverse.io",
    html: `<style>.tip-wrap{position:relative;display:inline-block;}.tip-wrap .tip{visibility:hidden;opacity:0;position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:#1e1e30;color:#f0f0ff;font-size:11px;padding:6px 10px;border-radius:6px;white-space:nowrap;border:1px solid #333;transition:opacity 0.2s;pointer-events:none;}.tip-wrap .tip::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#1e1e30;}.tip-wrap:hover .tip{visibility:visible;opacity:1;}</style><div class="tip-wrap"><button style="padding:10px 24px;font-size:13px;font-weight:600;color:#0a0a14;background:#00d4ff;border:none;border-radius:8px;cursor:pointer;">Hover me</button><span class="tip">✨ This is a tooltip!</span></div>`,
  },
  {
    name: "Cyan Tooltip",
    category: "Tooltips",
    author: "tip_pro",
    sourceUrl: "https://uiverse.io",
    html: `<style>.ctip{position:relative;display:inline-block;}.ctip .ct{visibility:hidden;opacity:0;position:absolute;bottom:calc(100%+8px);left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#7C3AED,#00d4ff);color:white;font-size:11px;font-weight:600;padding:6px 12px;border-radius:6px;white-space:nowrap;transition:opacity 0.2s;pointer-events:none;}.ctip:hover .ct{visibility:visible;opacity:1;}</style><div class="ctip" style="margin-top:40px;"><button style="padding:10px 24px;font-size:13px;font-weight:600;color:white;background:#111122;border:1.5px solid #7C3AED;border-radius:8px;cursor:pointer;">Info</button><span class="ct">Gradient tooltip 🎨</span></div>`,
  },

  // ── PROGRESS ──────────────────────────────────────────────────────────────
  {
    name: "Progress Bar",
    category: "Progress",
    author: "progress_ui",
    sourceUrl: "https://uiverse.io",
    html: `<div style="width:260px;font-family:sans-serif;"><div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:12px;color:#f0f0ff;font-weight:600;">Upload Progress</span><span style="font-size:12px;color:#00d4ff;font-weight:700;">72%</span></div><div style="height:8px;background:#1e1e30;border-radius:50px;overflow:hidden;"><div style="height:100%;width:72%;background:linear-gradient(90deg,#7C3AED,#00d4ff);border-radius:50px;"></div></div></div>`,
  },
  {
    name: "Multi Progress",
    category: "Progress",
    author: "multi_prog",
    sourceUrl: "https://uiverse.io",
    html: `<div style="width:260px;font-family:sans-serif;display:flex;flex-direction:column;gap:10px;"><div><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:11px;color:#888;">Design</span><span style="font-size:11px;color:#FF4D6D;">90%</span></div><div style="height:6px;background:#1e1e30;border-radius:50px;"><div style="height:100%;width:90%;background:#FF4D6D;border-radius:50px;"></div></div></div><div><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:11px;color:#888;">Development</span><span style="font-size:11px;color:#7C3AED;">65%</span></div><div style="height:6px;background:#1e1e30;border-radius:50px;"><div style="height:100%;width:65%;background:#7C3AED;border-radius:50px;"></div></div></div><div><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:11px;color:#888;">Testing</span><span style="font-size:11px;color:#22c55e;">40%</span></div><div style="height:6px;background:#1e1e30;border-radius:50px;"><div style="height:100%;width:40%;background:#22c55e;border-radius:50px;"></div></div></div></div>`,
  },
  {
    name: "Circular Progress",
    category: "Progress",
    author: "circle_prog",
    sourceUrl: "https://uiverse.io",
    html: `<style>@keyframes dash{from{stroke-dashoffset:220}to{stroke-dashoffset:55}}</style><div style="display:flex;gap:20px;font-family:sans-serif;"><div style="text-align:center;"><svg width="70" height="70" viewBox="0 0 70 70"><circle cx="35" cy="35" r="30" fill="none" stroke="#1e1e30" stroke-width="6"/><circle cx="35" cy="35" r="30" fill="none" stroke="#00d4ff" stroke-width="6" stroke-linecap="round" stroke-dasharray="188" stroke-dashoffset="47" transform="rotate(-90 35 35)"/><text x="35" y="40" text-anchor="middle" fill="#f0f0ff" font-size="13" font-weight="700">75%</text></svg><div style="font-size:10px;color:#888;margin-top:4px;">Storage</div></div><div style="text-align:center;"><svg width="70" height="70" viewBox="0 0 70 70"><circle cx="35" cy="35" r="30" fill="none" stroke="#1e1e30" stroke-width="6"/><circle cx="35" cy="35" r="30" fill="none" stroke="#FF4D6D" stroke-width="6" stroke-linecap="round" stroke-dasharray="188" stroke-dashoffset="94" transform="rotate(-90 35 35)"/><text x="35" y="40" text-anchor="middle" fill="#f0f0ff" font-size="13" font-weight="700">50%</text></svg><div style="font-size:10px;color:#888;margin-top:4px;">CPU</div></div></div>`,
  },

  // ── MORE BUTTONS ──────────────────────────────────────────────────────────
  {
    name: "Copy Button",
    category: "Buttons",
    author: "copy_ui",
    sourceUrl: "https://uiverse.io",
    html: `<button style="display:inline-flex;align-items:center;gap:8px;padding:10px 20px;font-size:13px;font-weight:600;color:#f0f0ff;background:#111122;border:1.5px solid #1e1e30;border-radius:8px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor='#00d4ff';this.style.color='#00d4ff'" onmouseout="this.style.borderColor='#1e1e30';this.style.color='#f0f0ff'" onclick="this.innerHTML='<svg width=14 height=14 viewBox=&quot;0 0 24 24&quot; fill=none stroke=currentColor stroke-width=3><polyline points=&quot;20 6 9 17 4 12&quot;></polyline></svg> Copied!';this.style.borderColor='#22c55e';this.style.color='#22c55e';setTimeout(()=>{this.innerHTML='<svg width=14 height=14 viewBox=&quot;0 0 24 24&quot; fill=none stroke=currentColor stroke-width=2><rect x=9 y=9 width=13 height=13 rx=2/><path d=&quot;M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1&quot;/></svg> Copy';this.style.borderColor='#1e1e30';this.style.color='#f0f0ff'},1500)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</button>`,
  },
  {
    name: "Like Button",
    category: "Buttons",
    author: "like_ui",
    sourceUrl: "https://uiverse.io",
    html: `<button style="display:inline-flex;align-items:center;gap:8px;padding:10px 20px;font-size:13px;font-weight:600;color:#888;background:#111122;border:1.5px solid #1e1e30;border-radius:50px;cursor:pointer;transition:all 0.2s;" onclick="const liked=this.dataset.liked==='1';this.dataset.liked=liked?'0':'1';this.style.color=liked?'#888':'#FF4D6D';this.style.borderColor=liked?'#1e1e30':'#FF4D6D';this.style.background=liked?'#111122':'#FF4D6D15';this.children[0].textContent=liked?'🤍':'❤️';this.children[1].textContent=liked?'Like':'Liked'"><span>🤍</span><span>Like</span></button>`,
  },

  // ── MORE CARDS ────────────────────────────────────────────────────────────
  {
    name: "Pricing Card",
    category: "Cards",
    author: "price_ui",
    sourceUrl: "https://uiverse.io",
    html: `<div style="padding:24px;width:200px;background:#111122;border:1px solid #7C3AED;border-radius:16px;font-family:sans-serif;text-align:center;"><div style="font-size:11px;font-weight:700;color:#7C3AED;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Pro Plan</div><div style="font-size:32px;font-weight:800;color:#f0f0ff;margin-bottom:4px;">$12<span style="font-size:14px;font-weight:400;color:#888;">/mo</span></div><div style="font-size:11px;color:#888;margin-bottom:16px;">Everything you need</div><div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;text-align:left;"><div style="font-size:11px;color:#888;display:flex;gap:6px;align-items:center;"><span style="color:#22c55e;">✓</span>Unlimited projects</div><div style="font-size:11px;color:#888;display:flex;gap:6px;align-items:center;"><span style="color:#22c55e;">✓</span>Priority support</div><div style="font-size:11px;color:#888;display:flex;gap:6px;align-items:center;"><span style="color:#22c55e;">✓</span>Custom domains</div></div><button style="width:100%;padding:10px;font-size:12px;font-weight:700;color:white;background:#7C3AED;border:none;border-radius:8px;cursor:pointer;">Get Started</button></div>`,
  },
  {
    name: "Notification Card",
    category: "Cards",
    author: "notif_card",
    sourceUrl: "https://uiverse.io",
    html: `<div style="width:260px;background:#111122;border:1px solid #1e1e30;border-radius:14px;overflow:hidden;font-family:sans-serif;"><div style="padding:12px 16px;background:#1a1a2e;display:flex;align-items:center;justify-content:space-between;"><span style="font-size:12px;font-weight:700;color:#f0f0ff;">Notifications</span><span style="font-size:10px;font-weight:600;color:white;background:#FF4D6D;padding:2px 7px;border-radius:50px;">3</span></div><div style="padding:12px 16px;display:flex;flex-direction:column;gap:10px;"><div style="display:flex;gap:10px;align-items:flex-start;"><div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#00d4ff);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:white;">A</div><div><div style="font-size:12px;font-weight:600;color:#f0f0ff;">Alex liked your post</div><div style="font-size:10px;color:#555;margin-top:2px;">2 min ago</div></div></div><div style="display:flex;gap:10px;align-items:flex-start;"><div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#FF4D6D,#F59E0B);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:white;">B</div><div><div style="font-size:12px;font-weight:600;color:#f0f0ff;">New comment on your design</div><div style="font-size:10px;color:#555;margin-top:2px;">5 min ago</div></div></div></div></div>`,
  },
];

const IFRAME_STYLE = `<!DOCTYPE html><html><head><style>*{box-sizing:border-box}body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:16px;font-family:system-ui,sans-serif;background:#0a0a14;}</style></head><body>`;

const UIComponents = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [savedComponents, setSavedComponents] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return COMPONENTS.filter(c => {
      const matchCat = activeCategory === "All" || c.category.toLowerCase() === activeCategory.toLowerCase();
      const matchSearch = search === "" || c.name.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

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
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
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

        {/* Result count */}
        <div className="mb-6 text-center">
          <span className="font-mono text-xs text-muted-foreground">
            {filtered.length} component{filtered.length !== 1 ? "s" : ""} found
          </span>
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
