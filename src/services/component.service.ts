import type { UIComponent } from "@/types/resources";

export async function listAIComponents(): Promise<UIComponent[]> {
  try {
    const res = await fetch("/api/components", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`Failed to fetch components: ${res.statusText}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Component service could not load live components from /api/components", error);
    return [];
  }
}

export async function countAIComponents(): Promise<number> {
  try {
    const res = await fetch("/api/components?count=true", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data?.count === "number" ? data.count : 0;
  } catch {
    return 0;
  }
}

export async function createComponent(component: {
  name: string;
  category: string;
  html: string;
  author?: string;
  sourceUrl?: string;
  description?: string;
}): Promise<UIComponent> {
  const res = await fetch("/api/components", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(component),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Failed to create component" }));
    throw new Error(errorData.error || "Failed to create component");
  }

  return res.json();
}
