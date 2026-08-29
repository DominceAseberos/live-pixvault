import { redis, REDIS_KEYS, type RedisComponent } from "../../lib/redis.ts";
import { sanitizeAndValidateComponent } from "../../lib/sanitize-component.ts";
import { randomUUID } from "node:crypto";

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "GET") {
      const isCount = req.query?.count === "true" || req.query?.count === "1";
      
      // Get all component IDs ordered from newest to oldest
      const ids: string[] = await redis.zrange(REDIS_KEYS.COMPONENTS_INDEX, 0, -1, { rev: true }) || [];

      if (isCount) {
        return res.status(200).json({ count: ids.length });
      }

      if (ids.length === 0) {
        return res.status(200).json([]);
      }

      // Fetch all component records using mget
      const keys = ids.map((id) => REDIS_KEYS.component(id));
      const components: Array<RedisComponent | null> = await redis.mget(...keys);

      const validComponents = components
        .filter((c): c is RedisComponent => Boolean(c && c.id && c.name && c.html))
        .map((c) => ({
          id: c.id,
          name: c.name,
          category: c.category,
          author: c.author || "Community",
          sourceUrl: c.sourceUrl || "https://pixvault.dev",
          html: c.html,
          description: c.description,
          createdAt: c.createdAt,
        }));

      return res.status(200).json(validComponents);
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const validated = sanitizeAndValidateComponent(body);

      const id = randomUUID().replace(/-/g, "").slice(0, 12);
      const createdAt = new Date().toISOString();

      const newComponent: RedisComponent = {
        id,
        name: validated.name,
        category: validated.category,
        author: validated.author,
        sourceUrl: validated.sourceUrl,
        html: validated.html,
        description: validated.description,
        createdAt,
      };

      // Pipeline write to Upstash Redis: store record and update index
      const score = Date.now();
      const pipeline = redis.pipeline();
      pipeline.set(REDIS_KEYS.component(id), newComponent);
      pipeline.zadd(REDIS_KEYS.COMPONENTS_INDEX, { score, member: id });
      await pipeline.exec();

      return res.status(201).json(newComponent);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("API /api/components error:", error);
    const status = error.name === "ComponentValidationError" ? 400 : 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
}
