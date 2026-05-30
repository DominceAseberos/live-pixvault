import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Code2, Copy, Bookmark, ExternalLink, Search, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const CATEGORIES = ["All", "Buttons", "Cards", "Inputs", "Loaders", "Checkboxes", "Toggles", "Badges", "Alerts", "Avatars", "Tooltips", "Progress", "Cursors", "Errors"];

interface UIComponent {
  name: string;
  category: string;
  author: string;
  html: string;
  sourceUrl: string;
}

export const COMPONENTS: UIComponent[] = [
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
  
  // ── NEW COMPONENTS (SEEDED) ────────────────────────────────────────────────────────────
  {
    name: "Cyberpunk Button",
    category: "Buttons",
    author: "cyber_dev",
    sourceUrl: "https://uiverse.io",
    html: `<button style="position:relative;padding:16px 32px;font-size:16px;font-weight:900;text-transform:uppercase;color:#fff;background:linear-gradient(45deg,transparent 5%,#ff013c 5%);border:0;letter-spacing:3px;box-shadow:6px 0px 0px #00e6f6;outline:transparent;cursor:pointer;transition:0.2s;" onmouseover="this.style.boxShadow='2px 0px 0px #00e6f6'" onmouseout="this.style.boxShadow='6px 0px 0px #00e6f6'"><span style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(45deg,transparent 3%,#00e6f6 3%,#00e6f6 5%,#ff013c 5%);display:none;"></span>CYBERPUNK</button>`,
  },
  {
    name: "Mouse Scroll",
    category: "Loaders",
    author: "scroll_ui",
    sourceUrl: "https://uiverse.io",
    html: `<style>@keyframes scroll{0%{transform:translateY(0);opacity:1}100%{transform:translateY(15px);opacity:0}}</style><div style="width:30px;height:50px;border:2px solid #f0f0ff;border-radius:20px;position:relative;display:flex;justify-content:center;"><div style="width:4px;height:10px;background-color:#00d4ff;border-radius:2px;margin-top:6px;animation:scroll 2s infinite;"></div></div>`,
  },
  {
    name: "Minimal Form",
    category: "Cards",
    author: "form_hero",
    sourceUrl: "https://uiverse.io",
    html: `<form style="display:flex;flex-direction:column;gap:12px;width:280px;padding:24px;background:#111122;border:1px solid #1e1e30;border-radius:16px;font-family:sans-serif;" onsubmit="event.preventDefault()"><h3 style="margin:0 0 12px;font-size:18px;color:#f0f0ff;font-weight:700;">Subscribe</h3><input type="text" placeholder="Name" style="padding:12px;background:#0F0F1A;border:1px solid #1e1e30;border-radius:8px;color:#fff;outline:none;" onfocus="this.style.borderColor='#7C3AED'" onblur="this.style.borderColor='#1e1e30'"/><input type="email" placeholder="Email" style="padding:12px;background:#0F0F1A;border:1px solid #1e1e30;border-radius:8px;color:#fff;outline:none;" onfocus="this.style.borderColor='#7C3AED'" onblur="this.style.borderColor='#1e1e30'"/><button style="padding:12px;margin-top:8px;background:#7C3AED;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">Join Now</button></form>`,
  },
  {
    name: "Mac Window Card",
    category: "Cards",
    author: "apple_ui",
    sourceUrl: "https://uiverse.io",
    html: `<div style="width:300px;background:#1a1a2e;border:1px solid #333;border-radius:12px;overflow:hidden;font-family:sans-serif;box-shadow:0 10px 30px rgba(0,0,0,0.5);"><div style="background:#2a2a40;padding:8px 12px;display:flex;gap:6px;align-items:center;"><div style="width:10px;height:10px;background:#ff5f56;border-radius:50%;"></div><div style="width:10px;height:10px;background:#ffbd2e;border-radius:50%;"></div><div style="width:10px;height:10px;background:#27c93f;border-radius:50%;"></div></div><div style="padding:20px;color:#00d4ff;font-family:monospace;font-size:13px;">> npm install pixvault<br>> installing dependencies...<br>> done in 2.3s</div></div>`,
  },
  {
    name: "Glowing Input",
    category: "Inputs",
    author: "glow_form",
    sourceUrl: "https://uiverse.io",
    html: `<div style="position:relative;width:260px;"><input type="text" placeholder="Enter username..." style="width:100%;padding:14px;background:#111122;border:2px solid transparent;border-radius:10px;color:#fff;outline:none;transition:0.3s;background-image:linear-gradient(#111122,#111122),linear-gradient(135deg,#7C3AED,#00d4ff);background-origin:border-box;background-clip:padding-box,border-box;" onfocus="this.style.boxShadow='0 0 15px rgba(124,58,237,0.5)'" onblur="this.style.boxShadow='none'"/></div>`,
  },
  {
    name: "Animated Checkbox",
    category: "Checkboxes",
    author: "smooth_ui",
    sourceUrl: "https://uiverse.io",
    html: `<label style="display:flex;align-items:center;gap:12px;cursor:pointer;color:#fff;font-family:sans-serif;font-weight:600;"><input type="checkbox" style="appearance:none;width:24px;height:24px;border:2px solid #333;border-radius:6px;outline:none;cursor:pointer;position:relative;transition:0.3s;" onchange="this.style.background=this.checked?'#00d4ff':'transparent';this.style.borderColor=this.checked?'#00d4ff':'#333';this.nextElementSibling.style.opacity=this.checked?'1':'0';this.nextElementSibling.style.transform=this.checked?'scale(1)':'scale(0)'"/><svg style="position:absolute;width:16px;height:16px;pointer-events:none;opacity:0;transform:scale(0);transition:0.3s cubic-bezier(0.4,0,0.2,1);margin-left:4px;" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Subscribe</label>`,
  },
  
  // ── CURSORS ────────────────────────────────────────────────────────────
  {
    name: "SVG Arrow Cursor",
    category: "Cursors",
    author: "cursor_lab",
    sourceUrl: "https://uiverse.io",
    html: `<style>.svg-cursor { width:100%; height:150px; display:flex; align-items:center; justify-content:center; background:#1a1a2e; border:2px dashed #00d4ff; border-radius:12px; color:#f0f0ff; font-family:sans-serif; font-weight:600; cursor:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2300d4ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'), auto; }</style><div class="svg-cursor">Hover for SVG Cursor</div>`,
  },
  {
    name: "Animated JS Dot",
    category: "Cursors",
    author: "motion_dev",
    sourceUrl: "https://uiverse.io",
    html: `<style>.cursor-area { position: relative; width: 100%; height: 150px; background: #111122; overflow: hidden; border-radius: 12px; cursor: none; display: flex; align-items: center; justify-content: center; color: #fff; font-family: sans-serif; font-weight: bold; border: 1px solid #1e1e30; } .dot { position: absolute; width: 8px; height: 8px; background: #FF4D6D; border-radius: 50%; pointer-events: none; transform: translate(-50%, -50%); transition: transform 0.1s; } .ring { position: absolute; width: 30px; height: 30px; border: 2px solid #FF4D6D; border-radius: 50%; pointer-events: none; transform: translate(-50%, -50%); transition: transform 0.2s ease-out, width 0.2s, height 0.2s; } .cursor-area:hover .ring { width: 40px; height: 40px; border-color: rgba(255,77,109,0.3); background: rgba(255,77,109,0.1); }</style><div class="cursor-area" onmousemove="const rect=this.getBoundingClientRect();const x=event.clientX-rect.left;const y=event.clientY-rect.top;this.querySelector('.dot').style.left=x+'px';this.querySelector('.dot').style.top=y+'px';this.querySelector('.ring').style.left=x+'px';this.querySelector('.ring').style.top=y+'px';"><div class="dot"></div><div class="ring"></div>Interactive JS Cursor</div>`,
  },
  {
    name: "Emoji Cursor",
    category: "Cursors",
    author: "emoji_fan",
    sourceUrl: "https://uiverse.io",
    html: `<style>.emoji-cursor { width:100%; height:150px; display:flex; align-items:center; justify-content:center; background:#1a1a2e; border:2px dashed #22c55e; border-radius:12px; color:#f0f0ff; font-family:sans-serif; font-weight:600; cursor:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" style="font-size: 24px;"><text y="24">🚀</text></svg>'), auto; }</style><div class="emoji-cursor">Hover for Rocket Cursor</div>`,
  },
  
  // ── MORE COMPONENTS ────────────────────────────────────────────────────────────
  {
    name: "Neumorphic Toggle",
    category: "Toggles",
    author: "neo_ui",
    sourceUrl: "https://uiverse.io",
    html: `<style> .toggle { position: relative; width: 60px; height: 30px; appearance: none; background: #2a2a35; outline: none; border-radius: 20px; box-shadow: inset 4px 4px 6px -1px rgba(0, 0, 0, 0.4), inset -4px -4px 6px -1px rgba(255, 255, 255, 0.05); cursor: pointer; transition: 0.3s; } .toggle:checked { background: #7C3AED; box-shadow: inset 4px 4px 6px -1px rgba(0, 0, 0, 0.2), inset -4px -4px 6px -1px rgba(255, 255, 255, 0.1); } .toggle::before { content: ""; position: absolute; width: 22px; height: 22px; border-radius: 50%; top: 4px; left: 4px; background: #e8e8e8; box-shadow: 2px 2px 5px rgba(0,0,0,0.2); transition: 0.3s; } .toggle:checked::before { transform: translateX(30px); } </style><input type="checkbox" class="toggle">`,
  },
  {
    name: "Hypnotic Loader",
    category: "Loaders",
    author: "spin_master",
    sourceUrl: "https://uiverse.io",
    html: `<style> .spinner { width: 50px; height: 50px; border-radius: 50%; border: 4px solid transparent; border-top-color: #00d4ff; border-bottom-color: #7C3AED; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.2); } 100% { transform: rotate(360deg) scale(1); } } </style><div class="spinner"></div>`,
  },
  {
    name: "Glass Credit Card",
    category: "Cards",
    author: "glassy",
    sourceUrl: "https://uiverse.io",
    html: `<div style="width:280px;height:160px;background:linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.0));backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-radius:16px;border:1px solid rgba(255,255,255,0.18);box-shadow:0 8px 32px 0 rgba(0,0,0,0.37);padding:20px;display:flex;flex-direction:column;justify-content:space-between;font-family:monospace;color:#fff;"><div style="display:flex;justify-content:space-between;align-items:center;"><span>Bank of UI</span><div style="width:40px;height:25px;background:gold;border-radius:4px;opacity:0.8;"></div></div><div style="font-size:18px;letter-spacing:2px;text-shadow:0 2px 4px rgba(0,0,0,0.5);">**** **** **** 1234</div><div style="display:flex;justify-content:space-between;font-size:12px;opacity:0.8;"><span>09/28</span><span>JONATHAN DOE</span></div></div>`,
  },
  {
    name: "Animated Gradient Button",
    category: "Buttons",
    author: "grad_guy",
    sourceUrl: "https://uiverse.io",
    html: `<style> .grad-btn { padding: 15px 30px; font-size: 16px; font-weight: bold; color: white; border: none; border-radius: 30px; cursor: pointer; background: linear-gradient(90deg, #ff00cc, #333399, #ff00cc); background-size: 200% auto; transition: 0.5s; } .grad-btn:hover { background-position: right center; box-shadow: 0 0 20px rgba(255, 0, 204, 0.5); } </style><button class="grad-btn">HOVER ME</button>`,
  },
  {
    name: "Sleek Tooltip",
    category: "Tooltips",
    author: "info_box",
    sourceUrl: "https://uiverse.io",
    html: `<style> .tt-container { position: relative; display: inline-block; cursor: pointer; font-family: sans-serif; color: #00d4ff; font-weight: bold; padding: 10px; border: 1px dashed #00d4ff; border-radius: 8px; } .tt-text { visibility: hidden; width: 120px; background-color: #111122; color: #fff; text-align: center; border-radius: 6px; padding: 8px; position: absolute; z-index: 1; bottom: 125%; left: 50%; transform: translateX(-50%); margin-left: 0; opacity: 0; transition: opacity 0.3s; border: 1px solid #1e1e30; box-shadow: 0 4px 12px rgba(0,0,0,0.5); } .tt-text::after { content: ""; position: absolute; top: 100%; left: 50%; margin-left: -5px; border-width: 5px; border-style: solid; border-color: #1e1e30 transparent transparent transparent; } .tt-container:hover .tt-text { visibility: visible; opacity: 1; } </style><div class="tt-container">Hover over me<span class="tt-text">Tooltip text!</span></div>`,
  },
  {
    name: "Battery Charge",
    category: "Progress",
    author: "charge_it",
    sourceUrl: "https://uiverse.io",
    html: `<style> .battery { width: 80px; height: 35px; border: 3px solid #f0f0ff; border-radius: 6px; position: relative; padding: 2px; } .battery::after { content: ""; position: absolute; right: -8px; top: 8px; width: 5px; height: 13px; background: #f0f0ff; border-radius: 0 3px 3px 0; } .level { height: 100%; background: #22c55e; border-radius: 2px; width: 0%; animation: charge 3s infinite; box-shadow: 0 0 10px #22c55e; } @keyframes charge { 0% { width: 10%; background: #ef4444; box-shadow: 0 0 10px #ef4444; } 50% { width: 50%; background: #eab308; box-shadow: 0 0 10px #eab308; } 100% { width: 100%; background: #22c55e; box-shadow: 0 0 10px #22c55e; } } </style><div class="battery"><div class="level"></div></div>`,
  },
  
  // ── MORE COMPONENTS BATCH 3 ────────────────────────────────────────────────────────────
  {
    name: "Glowing Avatar",
    category: "Avatars",
    author: "profile_master",
    sourceUrl: "https://uiverse.io",
    html: `<style> .avatar-box { position: relative; width: 64px; height: 64px; border-radius: 50%; padding: 3px; background: linear-gradient(45deg, #ff00cc, #333399, #00d4ff); animation: rotate 3s linear infinite; } .avatar-img { width: 100%; height: 100%; background: #111122; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-family: sans-serif; font-size: 24px; font-weight: bold; } @keyframes rotate { 100% { filter: hue-rotate(360deg); } } </style><div class="avatar-box"><div class="avatar-img">JD</div></div>`,
  },
  {
    name: "Pulsing Badge",
    category: "Badges",
    author: "notif_guy",
    sourceUrl: "https://uiverse.io",
    html: `<style> .badge-wrapper { position: relative; display: inline-block; padding: 12px; background: #2a2a35; border-radius: 12px; border: 1px solid #333; } .badge { position: absolute; top: -6px; right: -6px; background: #FF4D6D; color: white; font-family: sans-serif; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 10px; box-shadow: 0 0 10px #FF4D6D; animation: pulse 1.5s infinite; } @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 77, 109, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(255, 77, 109, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 77, 109, 0); } } </style><div class="badge-wrapper"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg><div class="badge">99+</div></div>`,
  },
  {
    name: "Success Alert",
    category: "Alerts",
    author: "ui_medic",
    sourceUrl: "https://uiverse.io",
    html: `<style> .alert { display: flex; align-items: center; gap: 12px; padding: 16px 24px; background: rgba(34, 197, 94, 0.1); border-left: 4px solid #22c55e; border-radius: 8px; color: #f0f0ff; font-family: sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.2); } .alert-icon { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: #22c55e; color: #111; border-radius: 50%; font-weight: bold; } </style><div class="alert"><div class="alert-icon">✓</div><div><strong>Success!</strong> Your changes have been saved.</div></div>`,
  },
  {
    name: "Holographic Input",
    category: "Inputs",
    author: "cyber_net",
    sourceUrl: "https://uiverse.io",
    html: `<style> .holo-input { background: rgba(0, 212, 255, 0.05); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 4px; padding: 12px 16px; color: #00d4ff; font-family: monospace; font-size: 14px; width: 240px; outline: none; transition: 0.3s; box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.1); } .holo-input:focus { border-color: #00d4ff; box-shadow: 0 0 15px rgba(0, 212, 255, 0.4), inset 0 0 10px rgba(0, 212, 255, 0.2); text-shadow: 0 0 5px #00d4ff; } .holo-input::placeholder { color: rgba(0, 212, 255, 0.4); } </style><input type="text" class="holo-input" placeholder="> enter commands_">`,
  },
  {
    name: "Heart Like Checkbox",
    category: "Checkboxes",
    author: "love_ui",
    sourceUrl: "https://uiverse.io",
    html: `<style> .heart-container { display: inline-block; position: relative; cursor: pointer; } .heart-container input { position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0; } .checkmark { display: block; width: 32px; height: 32px; background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23555" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>') no-repeat center; transition: 0.2s; } .heart-container input:checked ~ .checkmark { background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF4D6D" stroke="%23FF4D6D" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>') no-repeat center; animation: pop 0.3s ease-in-out; } @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } } </style><label class="heart-container"><input type="checkbox"><span class="checkmark"></span></label>`,
  },
  {
    name: "Glitch Text Card",
    category: "Cards",
    author: "error_404",
    sourceUrl: "https://uiverse.io",
    html: `<style> .glitch-wrapper { width: 260px; padding: 30px; background: #0a0a0a; border: 2px solid #222; text-align: center; overflow: hidden; border-radius: 8px; } .glitch-text { font-family: monospace; font-size: 32px; font-weight: bold; color: white; position: relative; display: inline-block; } .glitch-text::before, .glitch-text::after { content: "SYSTEM ERROR"; position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.8; } .glitch-text::before { color: #00d4ff; z-index: -1; animation: glitch-anim-1 2s infinite linear alternate-reverse; } .glitch-text::after { color: #ff00cc; z-index: -2; animation: glitch-anim-2 3s infinite linear alternate-reverse; } @keyframes glitch-anim-1 { 0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 1px); } 20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); } 40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, 2px); } 60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); } 80% { clip-path: inset(10% 0 70% 0); transform: translate(-1px, 1px); } 100% { clip-path: inset(30% 0 50% 0); transform: translate(1px, -1px); } } @keyframes glitch-anim-2 { 0% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -1px); } 20% { clip-path: inset(30% 0 20% 0); transform: translate(-2px, 1px); } 40% { clip-path: inset(70% 0 10% 0); transform: translate(2px, -2px); } 60% { clip-path: inset(20% 0 50% 0); transform: translate(-2px, 2px); } 80% { clip-path: inset(50% 0 30% 0); transform: translate(1px, -1px); } 100% { clip-path: inset(5% 0 80% 0); transform: translate(-1px, 1px); } } </style><div class="glitch-wrapper"><div class="glitch-text">SYSTEM ERROR</div></div>`,
  },
  
  // ── ERRORS ────────────────────────────────────────────────────────────
  {
    name: "Neon 404",
    category: "Errors",
    author: "cyber_punk",
    sourceUrl: "https://uiverse.io",
    html: `<style> .neon-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 160px; background: #0a0a0a; border: 1px solid #111; border-radius: 12px; } .neon-text { font-family: 'Courier New', Courier, monospace; font-size: 64px; font-weight: 900; color: #fff; text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff00cc, 0 0 40px #ff00cc, 0 0 80px #ff00cc; animation: flicker 1.5s infinite alternate; } .neon-sub { color: #00d4ff; font-family: sans-serif; font-size: 14px; text-transform: uppercase; letter-spacing: 4px; margin-top: 10px; text-shadow: 0 0 5px #00d4ff; } @keyframes flicker { 0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff00cc, 0 0 40px #ff00cc, 0 0 80px #ff00cc; } 20%, 24%, 55% { text-shadow: none; } } </style><div class="neon-wrapper"><div class="neon-text">404</div><div class="neon-sub">Page Not Found</div></div>`,
  },
  {
    name: "Floating 404 Ghost",
    category: "Errors",
    author: "spooky_ui",
    sourceUrl: "https://uiverse.io",
    html: `<style> .ghost-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 160px; background: #1a1a2e; border-radius: 12px; overflow: hidden; position: relative; } .ghost { width: 60px; height: 70px; background: #f0f0ff; border-radius: 30px 30px 0 0; position: relative; animation: float 3s ease-in-out infinite; box-shadow: 0 0 20px rgba(240, 240, 255, 0.4); } .ghost::before, .ghost::after { content: ""; position: absolute; top: 20px; width: 10px; height: 10px; background: #111; border-radius: 50%; } .ghost::before { left: 15px; } .ghost::after { right: 15px; } .ghost-tail { display: flex; position: absolute; bottom: -10px; width: 100%; height: 15px; } .ghost-tail span { flex: 1; background: #f0f0ff; border-radius: 0 0 10px 10px; } .ghost-tail span:nth-child(even) { background: #1a1a2e; transform: translateY(-5px); border-radius: 10px 10px 0 0; } .error-msg { margin-top: 25px; color: #f0f0ff; font-family: sans-serif; font-weight: bold; font-size: 18px; letter-spacing: 1px; } @keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0); } } </style><div class="ghost-wrapper"><div class="ghost"><div class="ghost-tail"><span></span><span></span><span></span><span></span><span></span></div></div><div class="error-msg">404 - LOST</div></div>`,
  },
  {
    name: "Terminal 404",
    category: "Errors",
    author: "sys_admin",
    sourceUrl: "https://uiverse.io",
    html: `<style> .term-404 { width: 100%; height: 160px; background: #000; border-radius: 8px; padding: 15px; font-family: monospace; color: #0f0; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-start; } .term-404 p { margin: 0 0 8px 0; padding: 0; font-size: 14px; line-height: 1.2; } .cursor { display: inline-block; width: 8px; height: 15px; background: #0f0; animation: blink 1s step-end infinite; } @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } } </style><div class="term-404"><p>> sudo locate missing_page</p><p>> locating...</p><p style="color: #f00;">> ERROR 404: Page Not Found.</p><p>> root@server:~$ <span class="cursor"></span></p></div>`,
  },
  {
    name: "TV Static 404",
    category: "Errors",
    author: "retro_tv",
    sourceUrl: "https://uiverse.io",
    html: `<style> .static-wrapper { position: relative; width: 100%; height: 160px; background: #000; overflow: hidden; border-radius: 8px; border: 2px solid #333; display: flex; align-items: center; justify-content: center; } .static-wrapper::before { content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px); z-index: 2; pointer-events: none; } .static-bg { position: absolute; width: 200%; height: 200%; top: -50%; left: -50%; background-image: repeating-radial-gradient(circle at 50% 50%, #000 0%, #000 1px, transparent 2px, transparent 3px), repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 2px, transparent 3px); animation: static 0.1s infinite linear; opacity: 0.15; z-index: 1; } .static-text { position: relative; z-index: 3; color: white; font-family: sans-serif; font-size: 32px; font-weight: 900; letter-spacing: 2px; text-shadow: 2px 2px 0px #f00, -2px -2px 0px #0ff; animation: glitch 2s infinite alternate; } @keyframes static { 0% { transform: translate(0,0); } 100% { transform: translate(5px, 5px); } } @keyframes glitch { 0% { transform: translate(0); } 20% { transform: translate(-2px, 1px); } 40% { transform: translate(2px, -1px); } 60% { transform: translate(-1px, 2px); } 80% { transform: translate(1px, -2px); } 100% { transform: translate(0); } } </style><div class="static-wrapper"><div class="static-bg"></div><div class="static-text">NO SIGNAL</div></div>`,
  },
  {
    name: "Bouncing DVD 404",
    category: "Errors",
    author: "dvd_hero",
    sourceUrl: "https://uiverse.io",
    html: `<style> .dvd-wrapper { width: 100%; height: 160px; background: #111; border-radius: 8px; position: relative; overflow: hidden; } .dvd-logo { position: absolute; width: 60px; height: 30px; display: flex; align-items: center; justify-content: center; color: #ff00cc; font-family: sans-serif; font-weight: 900; font-size: 16px; border: 2px solid currentColor; border-radius: 4px; animation: bounceX 3s linear infinite alternate, bounceY 2s linear infinite alternate, colorCycle 10s infinite linear; } @keyframes bounceX { from { left: 0; } to { left: calc(100% - 60px); } } @keyframes bounceY { from { top: 0; } to { top: calc(100% - 30px); } } @keyframes colorCycle { 0% { color: #ff00cc; } 25% { color: #00d4ff; } 50% { color: #22c55e; } 75% { color: #eab308; } 100% { color: #ff00cc; } } </style><div class="dvd-wrapper"><div class="dvd-logo">404</div></div>`,
  }
];

const IFRAME_STYLE = `<!DOCTYPE html><html><head><base href="about:blank"><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"><\/script><style>*{box-sizing:border-box}body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:16px;font-family:system-ui,sans-serif;background:#0a0a14;}</style></head><body>`;

const UIComponents = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [savedComponents, setSavedComponents] = useState<Set<string>>(new Set());
  const [dbComponents, setDbComponents] = useState<UIComponent[]>([]);
  
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchAIComponents() {
      try {
        const { data, error } = await supabase.from('components').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          const formatted = data.map((d: any) => ({
            name: d.name,
            category: d.category,
            author: d.author,
            sourceUrl: d.source_url,
            html: d.html
          }));
          setDbComponents(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch DB components:", err);
      }
    }
    fetchAIComponents();
  }, []);

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
          {paginatedComponents.map((comp, i) => {
            const isFlipped = flippedCards.has(comp.name);
            const uniqueKey = comp.name + "-" + comp.author;
            return (
              <motion.div key={uniqueKey} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="overflow-hidden rounded-lg border border-border bg-card card-hover-violet">
                {!isFlipped ? (
                  <>
                    <div className="h-[180px] overflow-hidden">
                      <iframe
                        srcDoc={`${IFRAME_STYLE}${comp.html}</body></html>`}
                        className="h-full w-full border-0"
                        sandbox="allow-scripts allow-same-origin"
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
                    <pre className="h-full overflow-y-auto whitespace-pre-wrap break-all bg-muted/80 p-4 font-mono text-[11px] text-muted-foreground leading-relaxed">
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
