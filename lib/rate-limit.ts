import type { ApiRequest } from "./api.js";
import { clientIp } from "./api.js";
import { getRedis } from "./redis.js";

export async function allowRequest(
  req: ApiRequest,
  scope: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
  const rawIp = clientIp(req);
  const safeIp = rawIp.replace(/[^a-zA-Z0-9:._-]/g, "_").slice(0, 120);
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const key = `ratelimit:${scope}:${safeIp}:${bucket}`;
  const redis = getRedis();
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, windowSeconds + 5);
  }

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfter: windowSeconds,
  };
}
