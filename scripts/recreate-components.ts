import * as fs from "node:fs";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import { DEFAULT_ALLOWED_CATEGORIES, sanitizeAndValidateComponent } from "../lib/sanitize-component.ts";
import { getRedis, REDIS_KEYS, type RedisComponent } from "../lib/redis.ts";

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

const STYLES = [
  "Glassmorphism", "Cyberpunk", "Neumorphism", "Retro 8-bit", "Brutalist",
  "Minimalist", "Aurora gradients", "Holographic", "Skeuomorphic", "Dark Mode Neon", "Claymorphism",
];
const MODEL = "llama-3.3-70b-versatile";
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface GroqResponse { choices?: Array<{ message?: { content?: string } }> }

async function main(): Promise<void> {
  const groqApiKey = process.env.GROQ_API_KEY?.trim();
  if (!groqApiKey) throw new Error("Missing GROQ_API_KEY. This optional generator is disabled until the server key is configured.");

  const requestedCount = Number.parseInt(process.argv[2] ?? "10", 10);
  const countToGenerate = Number.isFinite(requestedCount) ? Math.min(100, Math.max(1, requestedCount)) : 10;
  const redis = getRedis();
  console.log(`Redis: ${await redis.ping()}`);
  console.log(`Generating ${countToGenerate} safe PIXVAULT components with ${MODEL}.`);

  let generatedCount = 0;
  for (let index = 0; index < countToGenerate; index += 1) {
    const category = DEFAULT_ALLOWED_CATEGORIES[index % DEFAULT_ALLOWED_CATEGORIES.length];
    const style = STYLES[Math.floor(Math.random() * STYLES.length)];
    const prompt = `Create one polished ${category} component with a ${style} visual direction for PIXVAULT. Use semantic HTML and Tailwind utility classes only. Do not use style/script/iframe/object/embed/meta/base/link/applet tags, inline on* event handlers, action/formaction/srcdoc attributes, javascript: URLs, or data:text/html URLs. Fit inside a 320x220 preview. Return JSON only with name, category, html. category must be "${category}".`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqApiKey}` },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.75,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        console.warn(`Groq returned ${response.status}; skipping item ${index + 1}.`);
        if (response.status === 429) await delay(10_000);
        continue;
      }

      const payload = await response.json() as GroqResponse;
      const raw = payload.choices?.[0]?.message?.content;
      if (!raw) continue;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const validated = sanitizeAndValidateComponent({
        ...parsed,
        category,
        author: `Groq ${MODEL}`,
        sourceUrl: "https://console.groq.com/",
        description: `${style} ${category}`,
      });

      const id = randomUUID().replace(/-/g, "").slice(0, 12);
      const createdAt = new Date().toISOString();
      const component: RedisComponent = { id, ...validated, createdAt, provenance: "ai-generated" };
      const score = Date.now();
      const pipeline = redis.pipeline();
      pipeline.set(REDIS_KEYS.component(id), component);
      pipeline.zadd(REDIS_KEYS.COMPONENTS_INDEX, { score, member: id });
      pipeline.zadd(REDIS_KEYS.category(category), { score, member: id });
      await pipeline.exec();
      generatedCount += 1;
      console.log(`[${generatedCount}/${countToGenerate}] ${component.name}`);
    } catch (error) {
      console.warn(`Generation ${index + 1} rejected:`, error instanceof Error ? error.message : error);
    }

    if (index < countToGenerate - 1) await delay(2_500);
  }

  console.log(`Generated ${generatedCount}/${countToGenerate} components.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
