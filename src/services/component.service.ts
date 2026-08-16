import { supabase } from "@/lib/supabase";
import type { UIComponent } from "@/types/resources";

export async function listAIComponents(): Promise<UIComponent[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("components")
    .select("id,name,category,author,source_url,html,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    author: item.author,
    sourceUrl: item.source_url,
    html: item.html,
  }));
}

export async function countAIComponents(): Promise<number> {
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from("components")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}
