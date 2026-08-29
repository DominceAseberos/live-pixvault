import type { ApiRequest, ApiResponse } from "../../lib/api.ts";
import { errorMessage, queryString, setReadOnlyHeaders } from "../../lib/api.ts";
import { requireServerSecret } from "../../lib/auth.ts";
import { allowRequest } from "../../lib/rate-limit.ts";
import { getRedis, REDIS_KEYS, type RedisComponent } from "../../lib/redis.ts";

const SAFE_ID = /^[a-zA-Z0-9_-]{1,128}$/;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setReadOnlyHeaders(res);

  const id = queryString(req, "id");
  if (!SAFE_ID.test(id)) {
    return res.status(400).json({ error: "Missing or invalid component ID" });
  }

  try {
    const redis = getRedis();

    if (req.method === "GET") {
      const component = await redis.get<RedisComponent>(REDIS_KEYS.component(id));
      if (!component) return res.status(404).json({ error: "Component not found" });
      return res.status(200).json(component);
    }

    if (req.method === "DELETE") {
      const auth = requireServerSecret(req, ["ADMIN_SECRET", "COMPONENT_WRITE_SECRET"]);
      if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

      const rate = await allowRequest(req, "components-delete", 30, 3600);
      res.setHeader("X-RateLimit-Remaining", String(rate.remaining));
      if (!rate.allowed) {
        res.setHeader("Retry-After", String(rate.retryAfter));
        return res.status(429).json({ error: "Component delete rate limit exceeded." });
      }

      const existing = await redis.get<RedisComponent>(REDIS_KEYS.component(id));
      if (!existing) return res.status(404).json({ error: "Component not found" });

      const pipeline = redis.pipeline();
      pipeline.del(REDIS_KEYS.component(id));
      pipeline.zrem(REDIS_KEYS.COMPONENTS_INDEX, id);
      pipeline.zrem(REDIS_KEYS.category(existing.category), id);
      await pipeline.exec();

      return res.status(200).json({ success: true, deleted: id });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error(`API /api/components/${id} error:`, error);
    return res.status(500).json({ error: errorMessage(error) });
  }
}
