import type { UIComponent } from "@/types/resources";

export interface ComponentQuery {
  offset?: number;
  limit?: number;
  q?: string;
  category?: string;
}

export interface ComponentPage {
  items: UIComponent[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

function buildParams(query: ComponentQuery = {}): URLSearchParams {
  const params = new URLSearchParams();
  if (typeof query.offset === "number") params.set("offset", String(query.offset));
  if (typeof query.limit === "number") params.set("limit", String(query.limit));
  if (query.q?.trim()) params.set("q", query.q.trim());
  if (query.category?.trim() && query.category !== "All") params.set("category", query.category.trim());
  return params;
}

export async function listAIComponents(query: ComponentQuery = {}): Promise<ComponentPage> {
  const params = buildParams(query);
  const res = await fetch(`/api/components?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch components (${res.status})`);
  }

  const data = await res.json() as Partial<ComponentPage>;
  return {
    items: Array.isArray(data.items) ? data.items : [],
    total: typeof data.total === "number" ? data.total : 0,
    offset: typeof data.offset === "number" ? data.offset : (query.offset ?? 0),
    limit: typeof data.limit === "number" ? data.limit : (query.limit ?? 24),
    hasMore: Boolean(data.hasMore),
  };
}

export async function countAIComponents(query: Pick<ComponentQuery, "q" | "category"> = {}): Promise<number> {
  const params = buildParams(query);
  params.set("count", "true");
  const res = await fetch(`/api/components?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to count components (${res.status})`);
  const data = await res.json() as { count?: unknown };
  return typeof data.count === "number" ? data.count : 0;
}

export async function createComponent(
  component: {
    name: string;
    category: string;
    html: string;
    author?: string;
    sourceUrl?: string;
    description?: string;
  },
  secret: string,
): Promise<UIComponent> {
  const res = await fetch("/api/components", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(component),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Failed to create component" })) as { error?: string };
    throw new Error(errorData.error || "Failed to create component");
  }

  return res.json() as Promise<UIComponent>;
}
