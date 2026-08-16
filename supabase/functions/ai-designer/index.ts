import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const AI_DESIGNER_SECRET = Deno.env.get("AI_DESIGNER_SECRET");
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "*";

const STYLES = [
  "Glassmorphism", "Cyberpunk", "Neumorphism", "Retro 8-bit", "Brutalist",
  "Minimalist", "Aurora gradients", "Holographic", "Skeuomorphic", "Dark Mode Neon", "Claymorphism",
];
const CATEGORIES = [
  "Buttons", "Cards", "Inputs", "Forms", "Navigation", "Dialogs", "Tables",
  "Loaders", "Checkboxes", "Toggles", "Badges", "Alerts", "Avatars",
  "Tooltips", "Progress", "Empty States", "Cursors", "Errors",
];

interface GeneratedComponent {
  name: string;
  category: string;
  html: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });

const isGeneratedComponent = (value: unknown): value is GeneratedComponent => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.name === "string" &&
    typeof candidate.category === "string" &&
    typeof candidate.html === "string";
};

const validateComponent = (component: GeneratedComponent, expectedCategory: string) => {
  const name = component.name.trim();
  const html = component.html.trim();

  if (!name || name.length > 120) throw new Error("Generated component name is invalid.");
  if (component.category !== expectedCategory) throw new Error("Generated category did not match the requested category.");
  if (!html || html.length > 20_000) throw new Error("Generated component HTML is outside the allowed size.");
  if (/<\s*style\b/i.test(html)) throw new Error("Generated component contained a style tag.");
  if (/<\s*(script|iframe|object|embed|meta|base)\b/i.test(html)) throw new Error("Generated component contained a blocked HTML element.");
  if (/javascript\s*:/i.test(html)) throw new Error("Generated component contained a javascript URL.");

  return { name, category: component.category, html };
};

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  if (!GROQ_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !AI_DESIGNER_SECRET) {
    console.error("ai-designer is missing one or more required secrets");
    return json({ error: "Generator is not configured" }, 503);
  }

  if (request.headers.get("authorization") !== `Bearer ${AI_DESIGNER_SECRET}`) {
    return json({ error: "Unauthorized" }, 401);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data: recent, error: recentError } = await supabase
      .from("components")
      .select("name")
      .order("created_at", { ascending: false })
      .limit(30);

    if (recentError) throw recentError;

    const recentNames = (recent ?? [])
      .map((row: { name: string }) => row.name)
      .filter(Boolean)
      .join(", ");

    const style = STYLES[Math.floor(Math.random() * STYLES.length)];
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

    const prompt = `You are an expert frontend UI designer.
Generate one polished, self-contained HTML component for a React + Tailwind CSS resource gallery.

Category: ${category}
Visual direction: ${style}

Rules:
1. Use Tailwind utility classes and semantic HTML. Inline style is allowed only when Tailwind cannot express a value.
2. Do not output <style>, <script>, <iframe>, <object>, <embed>, <meta>, or <base> tags.
3. Do not use javascript: URLs.
4. Fit comfortably inside a 300px by 200px preview.
5. Keep controls keyboard-usable and add accessible labels when visible text is insufficient.
6. Avoid close duplicates of: ${recentNames || "(none yet)"}.
7. Return only JSON with exactly: name, category, html. The category must be "${category}".`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (!response.ok) {
      console.error("Groq request failed", response.status, await response.text());
      return json({ error: "Generator provider failed" }, 502);
    }

    const payload: unknown = await response.json();
    const choices = (payload as { choices?: Array<{ message?: { content?: string } }> }).choices;
    const rawContent = choices?.[0]?.message?.content;
    if (!rawContent) throw new Error("Generator returned no content.");

    const parsed: unknown = JSON.parse(rawContent);
    if (!isGeneratedComponent(parsed)) throw new Error("Generator returned an invalid shape.");

    const component = validateComponent(parsed, category);
    const { error: insertError } = await supabase.from("components").insert([{
      ...component,
      author: "Groq AI Bot",
      source_url: "Generated by Llama 3.3 70B",
    }]);

    if (insertError) throw insertError;

    return json({ success: true, component: component.name }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown generator error";
    console.error("ai-designer failed", message);
    return json({ error: "Component generation failed" }, 500);
  }
});
