import { fetchJson, HttpError } from "@/services/http";

export const ICONIFY_API = "https://api.iconify.design";

export interface IconResult {
  prefix: string;
  name: string;
}

interface SearchResponse {
  icons?: string[];
}

interface BatchIconData {
  body: string;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
  rotate?: number;
  hFlip?: boolean;
  vFlip?: boolean;
}

interface BatchIconResponse {
  prefix: string;
  width?: number;
  height?: number;
  icons?: Record<string, BatchIconData>;
  aliases?: Record<string, { parent: string }>;
}

// In-memory cache for fast repeated queries
const svgMemoryCache = new Map<string, string>();
const LOCAL_STORAGE_KEY = "pv_icon_svg_cache_v1";

// Hydrate from localStorage if available
function loadLocalCache(): void {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return;
    const entries = JSON.parse(raw) as Record<string, string>;
    for (const [key, val] of Object.entries(entries)) {
      if (typeof val === "string" && val.startsWith("<svg")) {
        svgMemoryCache.set(key, val);
      }
    }
  } catch {
    // Ignore localStorage errors
  }
}

function persistLocalCache(): void {
  try {
    const entries: Record<string, string> = {};
    // Cap persisted cache to 300 icons
    let count = 0;
    for (const [k, v] of svgMemoryCache.entries()) {
      if (count++ >= 300) break;
      entries[k] = v;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage quota errors
  }
}

// Run once on load
loadLocalCache();

export function getCachedIconSvg(key: string): string | undefined {
  return svgMemoryCache.get(key);
}

export function setCachedIconSvg(key: string, svg: string): void {
  svgMemoryCache.set(key, svg);
  persistLocalCache();
}

export async function searchIconify(query: string, prefix = "", signal?: AbortSignal): Promise<IconResult[]> {
  const params = new URLSearchParams({ query: query.trim(), limit: "48" });
  if (prefix && prefix !== "featured") params.set("prefixes", prefix);
  const data = await fetchJson<SearchResponse>(`${ICONIFY_API}/search?${params.toString()}`, { signal });
  return (data.icons ?? []).map((icon) => {
    const [set, ...name] = icon.split(":");
    return { prefix: set, name: name.join(":") };
  });
}

export const iconSvgUrl = (icon: IconResult, color?: string) =>
  `${ICONIFY_API}/${icon.prefix}/${icon.name}.svg${color ? `?color=${encodeURIComponent(color)}` : ""}`;

export async function fetchIconSvg(icon: IconResult): Promise<string> {
  const key = `${icon.prefix}:${icon.name}`;
  const cached = svgMemoryCache.get(key);
  if (cached) return cached;

  const response = await fetch(iconSvgUrl(icon));
  if (!response.ok) throw new HttpError(`SVG request failed (${response.status})`, response.status);
  const svg = await response.text();
  setCachedIconSvg(key, svg);
  return svg;
}

export async function batchFetchIconSvgs(icons: IconResult[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  const missingByPrefix: Record<string, string[]> = {};

  // Check cache first
  for (const icon of icons) {
    const key = `${icon.prefix}:${icon.name}`;
    const cached = svgMemoryCache.get(key);
    if (cached) {
      results[key] = cached;
    } else {
      missingByPrefix[icon.prefix] = missingByPrefix[icon.prefix] ?? [];
      missingByPrefix[icon.prefix].push(icon.name);
    }
  }

  const prefixes = Object.keys(missingByPrefix);
  if (prefixes.length === 0) return results;

  // Fetch batches in parallel per prefix (typically 2-4 requests total instead of 48)
  await Promise.all(
    prefixes.map(async (prefix) => {
      const names = missingByPrefix[prefix];
      if (!names?.length) return;

      try {
        const batchUrl = `${ICONIFY_API}/${encodeURIComponent(prefix)}.json?icons=${names.map(encodeURIComponent).join(",")}`;
        const data = await fetchJson<BatchIconResponse>(batchUrl);

        const defaultW = data.width ?? 24;
        const defaultH = data.height ?? 24;

        for (const name of names) {
          const key = `${prefix}:${name}`;
          const iconData = data.icons?.[name];
          if (iconData?.body) {
            const w = iconData.width ?? defaultW;
            const h = iconData.height ?? defaultH;
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" fill="currentColor">${iconData.body}</svg>`;
            results[key] = svg;
            svgMemoryCache.set(key, svg);
          }
        }
      } catch (err) {
        console.warn(`Batch fetch failed for prefix "${prefix}", falling back to individual fetches`, err);
        // Fallback for failed batch: fetch individual SVGs
        await Promise.all(
          names.slice(0, 12).map(async (name) => {
            const key = `${prefix}:${name}`;
            try {
              const svg = await fetchIconSvg({ prefix, name });
              results[key] = svg;
            } catch {
              // Ignore individual failure
            }
          }),
        );
      }
    }),
  );

  persistLocalCache();
  return results;
}
