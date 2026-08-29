import { randomUUID } from "node:crypto";
import type { ApiRequest, ApiResponse } from "../../lib/api.ts";
import { asRecord, errorMessage, queryInteger, queryString, setReadOnlyHeaders } from "../../lib/api.ts";
import { requireServerSecret } from "../../lib/auth.ts";
import { allowRequest } from "../../lib/rate-limit.ts";
import { getRedis, REDIS_KEYS, type RedisComponent } from "../../lib/redis.ts";
import { DEFAULT_ALLOWED_CATEGORIES, sanitizeAndValidateComponent } from "../../lib/sanitize-component.ts";

const MAX_PAGE_SIZE = 100;

async function readComponents(ids: string[]): Promise<RedisComponent[]> {
  if (ids.length === 0) return [];
  const redis = getRedis();
  const results: RedisComponent[] = [];

  for (let offset = 0; offset < ids.length; offset += 200) {
    const batch = ids.slice(offset, offset + 200);
    const records = await redis.mget<RedisComponent[]>(...batch.map((id) => REDIS_KEYS.component(id)));
    for (const record of records) {
      if (record?.id && record.name && record.html) results.push(record);
    }
  }

  return results;
}

function matchesSearch(component: RedisComponent, query: string): boolean {
  if (!query) return true;
  const haystack = `${component.name} ${component.category} ${component.author} ${component.description ?? ""}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

async function filteredIds(category: string, query: string): Promise<{ ids: string[]; total: number }> {
  const redis = getRedis();
  const normalizedCategory = category && category.toLowerCase() !== "all"
    ? DEFAULT_ALLOWED_CATEGORIES.find((item) => item.toLowerCase() === category.toLowerCase()) ?? ""
    : "";

  if (category && category.toLowerCase() !== "all" && !normalizedCategory) {
    return { ids: [], total: 0 };
  }

  const indexKey = normalizedCategory ? REDIS_KEYS.category(normalizedCategory) : REDIS_KEYS.COMPONENTS_INDEX;
  const ids = await redis.zrange<string[]>(indexKey, 0, -1, { rev: true }) ?? [];
  if (!query) return { ids, total: ids.length };

  const records = await readComponents(ids);
  const matching = records.filter((component) => matchesSearch(component, query)).map((component) => component.id);
  return { ids: matching, total: matching.length };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setReadOnlyHeaders(res);

  try {
    if (req.method === "GET") {
      const redis = getRedis();
      const isCount = ["true", "1"].includes(queryString(req, "count").toLowerCase());
      const category = queryString(req, "category");
      const query = queryString(req, "q");
      const offset = queryInteger(req, "offset", 0, 0, 100_000);
      const limit = queryInteger(req, "limit", 24, 1, MAX_PAGE_SIZE);

      const normalizedCategory = category && category.toLowerCase() !== "all"
        ? DEFAULT_ALLOWED_CATEGORIES.find((item) => item.toLowerCase() === category.toLowerCase()) ?? ""
        : "";

      if (category && category.toLowerCase() !== "all" && !normalizedCategory) {
        return res.status(200).json(isCount ? { count: 0 } : { items: [], total: 0, offset, limit, hasMore: false });
      }

      const indexKey = normalizedCategory ? REDIS_KEYS.category(normalizedCategory) : REDIS_KEYS.COMPONENTS_INDEX;

      if (!query) {
        const total = await redis.zcard(indexKey);
        if (isCount) return res.status(200).json({ count: total });

        const ids = await redis.zrange<string[]>(indexKey, offset, offset + limit - 1, { rev: true }) ?? [];
        const items = await readComponents(ids);
        return res.status(200).json({
          items,
          total,
          offset,
          limit,
          hasMore: offset + items.length < total,
        });
      }

      const filtered = await filteredIds(normalizedCategory, query);
      if (isCount) return res.status(200).json({ count: filtered.total });

      const ids = filtered.ids.slice(offset, offset + limit);
      const items = await readComponents(ids);
      return res.status(200).json({
        items,
        total: filtered.total,
        offset,
        limit,
        hasMore: offset + items.length < filtered.total,
      });
    }

    if (req.method === "POST") {
      const auth = requireServerSecret(req, ["COMPONENT_WRITE_SECRET", "ADMIN_SECRET"]);
      if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

      const rate = await allowRequest(req, "components-write", 30, 3600);
      res.setHeader("X-RateLimit-Remaining", String(rate.remaining));
      if (!rate.allowed) {
        res.setHeader("Retry-After", String(rate.retryAfter));
        return res.status(429).json({ error: "Component write rate limit exceeded." });
      }

      const validated = sanitizeAndValidateComponent(asRecord(req.body));
      const id = randomUUID().replace(/-/g, "").slice(0, 12);
      const createdAt = new Date().toISOString();
      const newComponent: RedisComponent = {
        id,
        ...validated,
        createdAt,
        provenance: "community",
      };

      const score = Date.now();
      const redis = getRedis();
      const pipeline = redis.pipeline();
      pipeline.set(REDIS_KEYS.component(id), newComponent);
      pipeline.zadd(REDIS_KEYS.COMPONENTS_INDEX, { score, member: id });
      pipeline.zadd(REDIS_KEYS.category(newComponent.category), { score, member: id });
      await pipeline.exec();

      return res.status(201).json(newComponent);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API /api/components error:", error);
    const status = error instanceof Error && error.name === "ComponentValidationError" ? 400 : 500;
    return res.status(status).json({ error: errorMessage(error) });
  }
}
