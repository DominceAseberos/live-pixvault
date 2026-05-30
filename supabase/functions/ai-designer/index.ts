import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0"

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

const STYLES = [
  "Glassmorphism", "Cyberpunk", "Neumorphism", "Retro 8-bit",
  "Brutalist", "Minimalist", "Aurora (gradients)", "Holographic",
  "Skeuomorphic", "Dark Mode Neon", "Claymorphism"
];

const CATEGORIES = [
  "Buttons", "Cards", "Inputs", "Loaders", "Checkboxes",
  "Toggles", "Badges", "Alerts", "Avatars", "Tooltips",
  "Progress", "Cursors", "Errors"
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (!GROQ_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new Response(JSON.stringify({ error: "Missing environment variables" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // 1. Fetch recent components to avoid duplicates
  const { data: recent } = await supabase
    .from('components')
    .select('name')
    .order('created_at', { ascending: false })
    .limit(30);
  const recentNames = recent ? recent.map((r: any) => r.name).join(", ") : "";

  const randomStyle = STYLES[Math.floor(Math.random() * STYLES.length)];
  const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

  // ─── STRICT PROMPT ─────────────────────────────────────────────────────────
  // RULE: All styling MUST use Tailwind CSS utility classes or inline styles.
  // NEVER output a <style> tag. Global CSS class names will collide when multiple
  // components are rendered simultaneously on the same page, breaking all designs.
  // ───────────────────────────────────────────────────────────────────────────
  const PROMPT = `You are an expert Frontend UI designer working in a React + Tailwind CSS project.
Generate a SINGLE, visually stunning HTML UI component.
Design category: ${randomCategory} | Design style: ${randomStyle}

=== ABSOLUTE RULES (violating ANY of these will cause the app to break) ===

1. TAILWIND ONLY — You MUST style exclusively with Tailwind CSS utility classes on each element.
   - ✅ ALLOWED: class="flex items-center bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl p-4"
   - ✅ ALLOWED: inline style="..." for values Tailwind cannot express (e.g. custom box-shadow, specific transforms, keyframe animations)
   - ❌ FORBIDDEN: <style> tags of ANY kind — even scoped or @keyframes blocks inside a <style> tag
   - ❌ FORBIDDEN: Custom CSS class names defined in a <style> block (e.g. .my-button { ... })
   WHY: Multiple components render on the same page simultaneously. Global CSS class names will
        collide and destroy ALL visible designs. This is a hard technical requirement.

2. SELF-CONTAINED — The component must fit within a 300px × 200px preview box.
   Do NOT use fixed/absolute positioning that escapes the parent container.

3. SEMANTIC HTML — Match HTML tags to the category:
   - "Buttons"    → use <button>
   - "Inputs"     → use <input>
   - "Checkboxes" → use <input type="checkbox">
   - "Toggles"    → use <input type="checkbox"> with a label
   - All others   → use the most semantically appropriate tag.

4. NO MARKDOWN — Output only the raw HTML. No \`\`\`html fences, no explanations, no prose.

5. AVOID DUPLICATES — Do not generate anything similar to: ${recentNames || "(none yet)"}

Return ONLY this exact JSON shape and nothing else:
{
  "name": "Unique Creative Component Name",
  "category": "${randomCategory}",
  "html": "<div class=\\"flex items-center justify-center w-full h-full...\\">...</div>"
}`;

  try {
    // 2. Call Groq
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: PROMPT }],
        temperature: 0.9,
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${await response.text()}`)
    }

    const data = await response.json()
    const content = JSON.parse(data.choices[0].message.content)

    if (!content.name || !content.category || !content.html) {
      throw new Error("Invalid format received from AI")
    }

    // 3. Validate — reject output that still contains <style> tags (rule enforcement)
    if (content.html.toLowerCase().includes("<style")) {
      throw new Error("AI violated the no-<style>-tag rule. Component rejected to protect page integrity.")
    }

    // 4. Save to Supabase
    const { error: dbError } = await supabase
      .from('components')
      .insert([{
        name: content.name,
        category: content.category,
        html: content.html,
        author: "Groq AI Bot",
        source_url: "Generated by Llama3.3-70b"
      }])

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ success: true, component: content.name }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })

  } catch (error: any) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      status: 500,
    })
  }
})
