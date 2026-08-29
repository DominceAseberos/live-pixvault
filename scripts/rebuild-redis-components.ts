import { Redis } from "@upstash/redis";
import * as fs from "node:fs";
import * as path from "node:path";
import { DEFAULT_ALLOWED_CATEGORIES, recreateLegacyComponent } from "../lib/sanitize-component.ts";
import { REDIS_KEYS, type RedisComponent } from "../lib/redis.ts";

function loadLocalEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

loadLocalEnv();

const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
if (!url || !token) throw new Error("Missing Upstash Redis environment variables.");
const redis = new Redis({ url, token });

async function main(): Promise<void> {
  const ids = await redis.zrange<string[]>(REDIS_KEYS.COMPONENTS_INDEX, 0, -1) ?? [];
  console.log(`Indexed components before rebuild: ${ids.length}`);

  for (const category of DEFAULT_ALLOWED_CATEGORIES) await redis.del(REDIS_KEYS.category(category));

  let rebuilt = 0;
  let quarantined = 0;
  const quarantineReport: Array<{ id: string; name: string; reason: string }> = [];

  for (let offset = 0; offset < ids.length; offset += 100) {
    const batchIds = ids.slice(offset, offset + 100);
    const rows = await redis.mget<RedisComponent[]>(...batchIds.map((id) => REDIS_KEYS.component(id)));
    const pipeline = redis.pipeline();

    for (let index = 0; index < batchIds.length; index += 1) {
      const id = batchIds[index];
      const row = rows[index];
      if (!row) {
        pipeline.zrem(REDIS_KEYS.COMPONENTS_INDEX, id);
        quarantined += 1;
        quarantineReport.push({ id, name: "Missing Redis record", reason: "Index referenced a missing component key." });
        continue;
      }

      try {
        const recreated = recreateLegacyComponent({
          name: row.name,
          category: row.category,
          html: row.html,
          author: row.author,
          sourceUrl: row.sourceUrl,
          description: row.description ?? "Recreated for the Upstash-backed PIXVAULT component library.",
        });
        const safe: RedisComponent = {
          id,
          ...recreated,
          createdAt: row.createdAt || new Date().toISOString(),
          provenance: row.provenance === "ai-generated" || row.provenance === "community" ? row.provenance : "legacy-recreated",
        };
        const score = Number.isFinite(new Date(safe.createdAt).getTime()) ? new Date(safe.createdAt).getTime() : Date.now();
        pipeline.set(REDIS_KEYS.component(id), safe);
        pipeline.zadd(REDIS_KEYS.category(safe.category), { score, member: id });
        rebuilt += 1;
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown validation error";
        pipeline.set(`quarantine:component:${id}`, { ...row, quarantineReason: reason, quarantinedAt: new Date().toISOString() });
        pipeline.zrem(REDIS_KEYS.COMPONENTS_INDEX, id);
        quarantined += 1;
        quarantineReport.push({ id, name: row.name || "Untitled", reason });
      }
    }

    await pipeline.exec();
    console.log(`Processed ${Math.min(offset + batchIds.length, ids.length)}/${ids.length}`);
  }

  if (quarantineReport.length) fs.writeFileSync(path.resolve("redis-quarantine-report.json"), JSON.stringify(quarantineReport, null, 2));

  const finalIds = await redis.zrange<string[]>(REDIS_KEYS.COMPONENTS_INDEX, 0, -1) ?? [];
  let executableRows = 0;
  for (let offset = 0; offset < finalIds.length; offset += 200) {
    const batch = finalIds.slice(offset, offset + 200);
    const rows = await redis.mget<RedisComponent[]>(...batch.map((id) => REDIS_KEYS.component(id)));
    for (const row of rows) {
      const html = row?.html ?? "";
      if (/<script\b|\bon[a-z0-9_-]+\s*=|javascript\s*:|data\s*:\s*text\/html/i.test(html)) executableRows += 1;
    }
  }

  console.log(`Rebuilt safely: ${rebuilt}`);
  console.log(`Quarantined: ${quarantined}`);
  console.log(`Final indexed components: ${finalIds.length}`);
  console.log(`Executable-pattern rows after rebuild: ${executableRows}`);
  if (executableRows > 0) throw new Error("Safety verification failed: executable patterns remain in Redis components.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
