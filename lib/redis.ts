import { Redis } from "@upstash/redis";

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    throw new Error(
      "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN. Redis is server-side only; do not use VITE_ environment variables for these secrets.",
    );
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

const categorySlug = (category: string) =>
  category.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const REDIS_KEYS = {
  COMPONENTS_INDEX: "components:index",
  component: (id: string) => `component:${id}`,
  category: (category: string) => `components:category:${categorySlug(category)}`,
  crawler: (source: string) => `crawler:${source}`,
} as const;

export interface RedisComponent {
  id: string;
  name: string;
  category: string;
  author: string;
  html: string;
  sourceUrl: string;
  description?: string;
  createdAt: string;
  provenance?: "curated" | "legacy-recreated" | "ai-generated" | "community";
}
