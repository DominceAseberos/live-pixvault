import { randomUUID } from "node:crypto";
import type { ApiRequest, ApiResponse } from "../lib/api.js";
import { asRecord, errorMessage, setReadOnlyHeaders } from "../lib/api.js";
import { requireServerSecret } from "../lib/auth.js";
import { allowRequest } from "../lib/rate-limit.js";
import { getRedis, REDIS_KEYS, type RedisComponent } from "../lib/redis.js";
import { DEFAULT_ALLOWED_CATEGORIES, sanitizeAndValidateComponent } from "../lib/sanitize-component.js";

const STYLES = [
  "Glassmorphism", "Cyberpunk", "Neumorphism", "Retro 8-bit", "Brutalist",
  "Minimalist", "Aurora gradients", "Holographic", "Skeuomorphic", "Dark Mode Neon", "Claymorphism",
];

interface GroqResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

function pickCategory(raw: unknown): string {
  if (typeof raw === "string") {
    const match = DEFAULT_ALLOWED_CATEGORIES.find((category) => category.toLowerCase() === raw.trim().toLowerCase());
    if (match) return match;
  }
  return DEFAULT_ALLOWED_CATEGORIES[Math.floor(Math.random() * DEFAULT_ALLOWED_CATEGORIES.length)];
}

function pickStyle(raw: unknown): string {
  if (typeof raw === "string" && raw.trim()) return raw.trim().slice(0, 80);
  return STYLES[Math.floor(Math.random() * STYLES.length)];
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setReadOnlyHeaders(res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = requireServerSecret(req, ["AI_DESIGNER_SECRET"]);
  if ("status" in auth) return res.status(auth.status).json({ error: auth.error });

  const groqApiKey = process.env.GROQ_API_KEY?.trim();
  if (!groqApiKey) {
    return res.status(503).json({ error: "Groq AI API key is not configured on the server." });
  }

  try {
    const rate = await allowRequest(req, "ai-generate", 12, 3600);
    res.setHeader("X-RateLimit-Remaining", String(rate.remaining));
    if (!rate.allowed) {
      res.setHeader("Retry-After", String(rate.retryAfter));
      return res.status(429).json({ error: "AI generation rate limit exceeded." });
    }

    const body = asRecord(req.body);
    const requestedCategory = pickCategory(body.category);
    const style = pickStyle(body.style);
    const redis = getRedis();

    const recentIds = await redis.zrange<string[]>(REDIS_KEYS.COMPONENTS_INDEX, 0, 15, { rev: true }) ?? [];
    const recentNames: string[] = [];
    if (recentIds.length > 0) {
      const recentComponents = await redis.mget<RedisComponent[]>(...recentIds.map((id) => REDIS_KEYS.component(id)));
      for (const component of recentComponents) {
        if (component?.name) recentNames.push(component.name);
      }
    }

    const prompt = `You are an expert frontend UI designer.
Generate one polished, self-contained HTML component for a React + Tailwind CSS resource gallery.

Category: ${requestedCategory}
Visual direction: ${style}

Rules:
1. Use semantic HTML and Tailwind utility classes only. Do not output <style> tags.
2. Do not output <script>, <iframe>, <object>, <embed>, <meta>, <base>, <link>, or <applet> tags.
3. Do not use inline JavaScript event attributes such as onclick/onload/onerror.
4. Do not use action, formaction, srcdoc, javascript: URLs, or data:text/html URLs.
5. Fit comfortably inside a 300px by 200px preview.
6. Keep controls keyboard-usable and add accessible labels when visible text is insufficient.
7. Avoid close duplicates of: ${recentNames.join(", ") || "(none yet)"}.
8. Return only JSON with exactly: name, category, html. The category must be "${requestedCategory}".`;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.75,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (!groqResponse.ok) {
      const providerBody = await groqResponse.text();
      console.error("Groq request failed:", groqResponse.status, providerBody.slice(0, 300));
      return res.status(502).json({ error: "AI generation provider failed" });
    }

    const payload = await groqResponse.json() as GroqResponse;
    const rawContent = payload.choices?.[0]?.message?.content;
    if (!rawContent) return res.status(502).json({ error: "AI generator returned an empty response" });

    const parsed = JSON.parse(rawContent) as unknown;
    const validated = sanitizeAndValidateComponent({
      ...asRecord(parsed),
      category: requestedCategory,
      author: "Groq AI Designer",
      sourceUrl: "https://console.groq.com/",
      description: `${style} ${requestedCategory} component`,
    });

    const id = randomUUID().replace(/-/g, "").slice(0, 12);
    const createdAt = new Date().toISOString();
    const newComponent: RedisComponent = {
      id,
      ...validated,
      createdAt,
      provenance: "ai-generated",
    };

    const score = Date.now();
    const pipeline = redis.pipeline();
    pipeline.set(REDIS_KEYS.component(id), newComponent);
    pipeline.zadd(REDIS_KEYS.COMPONENTS_INDEX, { score, member: id });
    pipeline.zadd(REDIS_KEYS.category(newComponent.category), { score, member: id });
    await pipeline.exec();

    return res.status(201).json({ success: true, component: newComponent });
  } catch (error) {
    console.error("API /api/generate error:", error);
    const status = error instanceof Error && error.name === "ComponentValidationError" ? 400 : 500;
    return res.status(status).json({ error: errorMessage(error, "Component generation failed") });
  }
}
