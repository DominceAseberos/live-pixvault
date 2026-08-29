import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";
import * as fs from "node:fs";
import * as path from "node:path";
import { recreateLegacyComponent } from "../lib/sanitize-component.ts";
import { REDIS_KEYS, type RedisComponent } from "../lib/redis.ts";

function loadLocalEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadLocalEnv();

const WRITE = process.argv.includes("--write");
const supabaseUrl = process.env.LEGACY_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.LEGACY_SUPABASE_ANON_KEY?.trim();
const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

interface LegacyRow {
  id: string;
  name: string;
  category: string;
  author: string | null;
  source_url: string | null;
  html: string;
  created_at: string | null;
}

function countPattern(html: string, pattern: RegExp): number {
  return html.match(pattern)?.length ?? 0;
}

async function fetchAllRows(): Promise<LegacyRow[]> {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Missing legacy Supabase read credentials.");
  const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const rows: LegacyRow[] = [];

  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("components")
      .select("id,name,category,author,source_url,html,created_at")
      .order("created_at", { ascending: true })
      .range(from, from + 999);

    if (error) throw new Error(`Supabase read failed: ${error.message}`);
    const page = (data ?? []) as LegacyRow[];
    rows.push(...page);
    if (page.length < 1000) break;
  }

  return rows;
}

async function main(): Promise<void> {
  if (!redisUrl || !redisToken) throw new Error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN.");
  const redis = new Redis({ url: redisUrl, token: redisToken });
  const pong = await redis.ping();
  if (pong !== "PONG") throw new Error("Upstash Redis did not respond to PING.");

  const rows = await fetchAllRows();
  const recreated: RedisComponent[] = [];
  const rejected: Array<{ id: string; name: string; reason: string }> = [];

  let scriptRows = 0;
  let eventRows = 0;
  let styleRows = 0;

  for (const row of rows) {
    if (/<script\b/i.test(row.html)) scriptRows += 1;
    if (/\bon[a-z0-9_-]+\s*=/i.test(row.html)) eventRows += 1;
    if (/<style\b/i.test(row.html)) styleRows += 1;

    try {
      const rebuilt = recreateLegacyComponent({
        name: row.name,
        category: row.category,
        html: row.html,
        author: row.author ?? "PIXVAULT Legacy",
        sourceUrl: row.source_url ?? "https://pixvault.dev/",
        description: "Recreated from the legacy PIXVAULT component library with executable content removed.",
      });

      recreated.push({
        id: row.id,
        ...rebuilt,
        createdAt: row.created_at ?? new Date().toISOString(),
        provenance: "legacy-recreated",
      });
    } catch (error) {
      rejected.push({
        id: row.id,
        name: row.name,
        reason: error instanceof Error ? error.message : "Unknown validation error",
      });
    }
  }

  console.log(`Legacy rows: ${rows.length}`);
  console.log(`Rows containing <style>: ${styleRows}`);
  console.log(`Rows containing <script>: ${scriptRows}`);
  console.log(`Rows containing inline events: ${eventRows}`);
  console.log(`Safely recreated: ${recreated.length}`);
  console.log(`Rejected/quarantined: ${rejected.length}`);

  if (rejected.length > 0) {
    const reportPath = path.resolve(process.cwd(), "migration-rejected-components.json");
    fs.writeFileSync(reportPath, JSON.stringify(rejected, null, 2));
    console.log(`Rejected component report: ${reportPath}`);
  }

  if (!WRITE) {
    console.log("Dry run only. Re-run with --write to persist the recreated components to Upstash.");
    return;
  }

  for (let offset = 0; offset < recreated.length; offset += 100) {
    const batch = recreated.slice(offset, offset + 100);
    const pipeline = redis.pipeline();

    for (const component of batch) {
      const score = Number.isFinite(new Date(component.createdAt).getTime())
        ? new Date(component.createdAt).getTime()
        : Date.now();
      pipeline.set(REDIS_KEYS.component(component.id), component);
      pipeline.zadd(REDIS_KEYS.COMPONENTS_INDEX, { score, member: component.id });
      pipeline.zadd(REDIS_KEYS.category(component.category), { score, member: component.id });
    }

    await pipeline.exec();
    console.log(`Written ${Math.min(offset + batch.length, recreated.length)}/${recreated.length}`);
  }

  const redisCount = await redis.zcard(REDIS_KEYS.COMPONENTS_INDEX);
  console.log(`Upstash components:index count: ${redisCount}`);
  if (redisCount < recreated.length) {
    throw new Error(`Redis verification failed: expected at least ${recreated.length}, found ${redisCount}.`);
  }

  console.log("Legacy recreation and Upstash migration completed successfully.");
}

main().catch((error) => {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
