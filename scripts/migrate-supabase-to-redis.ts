import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";
import * as fs from "node:fs";
import * as path from "node:path";

// Load .env.local manually
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
} catch (e) {
  console.warn("Could not read .env.local file:", e);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

async function migrate() {
  console.log("Starting Supabase to Upstash Redis migration...");

  if (!redisUrl || !redisToken) {
    console.error("Error: Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
    process.exit(1);
  }

  const redis = new Redis({ url: redisUrl, token: redisToken });

  // Test Redis connection
  const ping = await redis.ping();
  console.log("Redis connection test:", ping);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials not found. Skipping Supabase migration.");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: components, error } = await supabase
    .from("components")
    .select("id, name, category, author, source_url, html, created_at");

  if (error) {
    console.warn("Note on Supabase query:", error.message);
    console.log("If Supabase table is empty or inactive, Upstash Redis is ready for new components.");
    return;
  }

  if (!components || components.length === 0) {
    console.log("No components found in Supabase table. Upstash Redis is initialized.");
    return;
  }

  console.log(`Found ${components.length} components in Supabase. Migrating to Upstash Redis...`);

  let count = 0;
  for (const item of components) {
    const id = item.id || `comp_${count + 1}`;
    const createdAt = item.created_at || new Date().toISOString();
    const timestamp = new Date(createdAt).getTime() || Date.now();

    const record = {
      id,
      name: item.name,
      category: item.category,
      author: item.author || "Community",
      sourceUrl: item.source_url || "https://pixvault.dev",
      html: item.html,
      createdAt,
    };

    const pipeline = redis.pipeline();
    pipeline.set(`component:${id}`, record);
    pipeline.zadd("components:index", { score: timestamp, member: id });
    await pipeline.exec();

    count++;
    console.log(`[${count}/${components.length}] Migrated: ${item.name} (${id})`);
  }

  console.log(`Successfully migrated ${count} components to Upstash Redis!`);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
