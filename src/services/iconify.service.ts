import { fetchJson, HttpError } from "@/services/http";
export const ICONIFY_API = "https://api.iconify.design";
export interface IconResult { prefix: string; name: string }
interface SearchResponse { icons?: string[] }
export async function searchIconify(query: string, prefix = "", signal?: AbortSignal): Promise<IconResult[]> {
  const params = new URLSearchParams({ query, limit: "48" });
  if (prefix) params.set("prefixes", prefix);
  const data = await fetchJson<SearchResponse>(`${ICONIFY_API}/search?${params}`, { signal });
  return (data.icons ?? []).map((icon) => { const [set, ...name] = icon.split(":"); return { prefix: set, name: name.join(":") }; });
}
export const iconSvgUrl = (icon: IconResult, color?: string) => `${ICONIFY_API}/${icon.prefix}/${icon.name}.svg${color ? `?color=${encodeURIComponent(color)}` : ""}`;
export async function fetchIconSvg(icon: IconResult): Promise<string> {
  const response = await fetch(iconSvgUrl(icon));
  if (!response.ok) throw new HttpError(`SVG request failed (${response.status})`, response.status);
  return response.text();
}
