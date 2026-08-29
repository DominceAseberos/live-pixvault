import { Redis } from "@upstash/redis";
import * as fs from "node:fs";
import * as path from "node:path";
import { sanitizeAndValidateComponent, DEFAULT_ALLOWED_CATEGORIES } from "../lib/sanitize-component.ts";
import { randomUUID } from "node:crypto";

// Load .env.local
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

const groqApiKey = process.env.GROQ_API_KEY;
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const STYLES = [
  "Glassmorphism", "Cyberpunk", "Neumorphism", "Retro 8-bit", "Brutalist",
  "Minimalist", "Aurora gradients", "Holographic", "Skeuomorphic", "Dark Mode Neon", "Claymorphism",
];

// Top Groq models suitable for frontend generation:
// 1. llama-3.3-70b-versatile (Best balance of JSON adherence & UI aesthetics)
// 2. qwen-2.5-coder-32b (Dedicated coding model)
// 3. deepseek-r1-distill-llama-70b (Reasoning)
const MODEL = "llama-3.3-70b-versatile";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function main() {
  console.log("=========================================");
  console.log("PIXVAULT: AI Component Generator Script");
  console.log(`Using Model: ${MODEL}`);
  console.log("=========================================\n");

  if (!groqApiKey) {
    console.error("Error: Missing GROQ_API_KEY in .env.local or environment.");
    console.log("Please add GROQ_API_KEY=\"gsk_...\" to your .env.local file.");
    process.exit(1);
  }

  if (!redisUrl || !redisToken) {
    console.error("Error: Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN.");
    process.exit(1);
  }

  const redis = new Redis({ url: redisUrl, token: redisToken });
  const ping = await redis.ping();
  console.log("Connected to Upstash Redis:", ping);

  // How many components to generate in this run (can be adjusted via args)
  const countToGenerate = parseInt(process.argv[2] || "10", 10);
  console.log(`Will generate ${countToGenerate} premium UI components slowly (with rate-limit throttling)...\n`);

  let generatedCount = 0;

  for (let i = 0; i < countToGenerate; i++) {
    const category = DEFAULT_ALLOWED_CATEGORIES[i % DEFAULT_ALLOWED_CATEGORIES.length];
    const style = STYLES[Math.floor(Math.random() * STYLES.length)];

    console.log(`[${i + 1}/${countToGenerate}] Generating [${category}] with [${style}] aesthetic...`);

    const prompt = `You are an elite, award-winning frontend UI designer.
Generate one stunning, state-of-the-art HTML component for a React + Tailwind CSS UI library.

Category: ${category}
Visual Theme: ${style}

Design Requirements:
1. Use Tailwind CSS utility classes and modern semantic HTML.
2. Premium micro-interactions, subtle transitions, glowing borders or smooth hover states.
3. Must fit comfortably inside a 320px by 220px preview canvas.
4. Do not output <style>, <script>, <iframe>, <object>, <embed>, <meta>, or <base> tags.
5. Do not use javascript: URLs or inline onclick handlers.
6. Return only a raw JSON object with exactly:
   - "name": descriptive, creative name (e.g. "Prism Pulse Button")
   - "category": "${category}"
   - "html": clean HTML string using Tailwind classes.`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.85,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Groq API returned ${response.status}:`, errText);
        if (response.status === 429) {
          console.log("Rate limited by Groq. Pausing for 10 seconds before retrying...");
          await delay(10000);
        }
        continue;
      }

      const payload: any = await response.json();
      const raw = payload?.choices?.[0]?.message?.content;
      if (!raw) {
        console.warn("Empty response from Groq. Skipping.");
        continue;
      }

      const parsed = JSON.parse(raw);
      const validated = sanitizeAndValidateComponent({
        ...parsed,
        author: `Groq ${MODEL}`,
        sourceUrl: "https://pixvault.dev",
      });

      const id = randomUUID().replace(/-/g, "").slice(0, 12);
      const createdAt = new Date().toISOString();

      const newComponent = {
        id,
        name: validated.name,
        category: validated.category,
        author: validated.author,
        sourceUrl: validated.sourceUrl,
        html: validated.html,
        description: validated.description || `${style} ${validated.category}`,
        createdAt,
      };

      const score = Date.now();
      const pipeline = redis.pipeline();
      pipeline.set(`component:${id}`, newComponent);
      pipeline.zadd("components:index", { score, member: id });
      await pipeline.exec();

      generatedCount++;
      console.log(`✓ Saved: "${validated.name}" (ID: ${id})`);
    } catch (err: any) {
      console.error(`Failed on item ${i + 1}:`, err.message);
    }

    // Delay 2.5 seconds between generations to prevent hitting Groq rate limits
    if (i < countToGenerate - 1) {
      await delay(2500);
    }
  }

  console.log(`\nDone! Successfully generated and added ${generatedCount} components to Upstash Redis.`);
}

main().catch((err) => {
  console.error("Generator script encountered fatal error:", err);
  process.exit(1);
});
