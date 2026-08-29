import { redis, REDIS_KEYS, type RedisComponent } from "../../lib/redis.ts";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid component ID" });
  }

  try {
    if (req.method === "GET") {
      const component: RedisComponent | null = await redis.get(REDIS_KEYS.component(id));
      if (!component) {
        return res.status(404).json({ error: "Component not found" });
      }

      return res.status(200).json(component);
    }

    if (req.method === "DELETE") {
      const authHeader = req.headers["authorization"];
      const secret = process.env.ADMIN_SECRET || process.env.AI_DESIGNER_SECRET;
      if (secret && authHeader !== `Bearer ${secret}`) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const pipeline = redis.pipeline();
      pipeline.del(REDIS_KEYS.component(id));
      pipeline.zrem(REDIS_KEYS.COMPONENTS_INDEX, id);
      await pipeline.exec();

      return res.status(200).json({ success: true, deleted: id });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error(`API /api/components/${id} error:`, error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
