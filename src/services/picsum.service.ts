import { fetchJson } from "@/services/http";
export interface PicsumImage { id: string; author: string; width: number; height: number; url: string; download_url: string }
export const picsumImageUrl = (id: string, width: number, height: number) => `https://picsum.photos/id/${id}/${width}/${height}`;
export function listPicsum(page: number, signal?: AbortSignal) {
  return fetchJson<PicsumImage[]>(`https://picsum.photos/v2/list?page=${page}&limit=12`, { signal });
}
