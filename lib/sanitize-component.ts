export interface SanitizeOptions {
  allowedCategories?: string[];
  maxNameLength?: number;
  maxHtmlLength?: number;
}

export const DEFAULT_ALLOWED_CATEGORIES = [
  "Buttons", "Cards", "Inputs", "Forms", "Navigation", "Dialogs", "Tables",
  "Loaders", "Checkboxes", "Toggles", "Badges", "Alerts", "Avatars",
  "Tooltips", "Progress", "Empty States", "Cursors", "Errors",
];

export class ComponentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ComponentValidationError";
  }
}

type ComponentInput = {
  name?: unknown;
  category?: unknown;
  html?: unknown;
  author?: unknown;
  sourceUrl?: unknown;
  description?: unknown;
};

export interface SanitizedComponent {
  name: string;
  category: string;
  html: string;
  author: string;
  sourceUrl: string;
  description?: string;
}

const DANGEROUS_TAG = /<\s*(script|iframe|object|embed|meta|base|link|applet)\b/i;
const INLINE_HANDLER = /\bon[a-z0-9_-]+\s*=/i;
const DANGEROUS_URI = /javascript\s*:|data\s*:\s*text\/html/i;
const DANGEROUS_FORM_ATTR = /\b(?:action|formaction|srcdoc)\s*=/i;
const DANGEROUS_CSS = /@import\b|expression\s*\(|javascript\s*:|data\s*:\s*text\/html|-moz-binding\s*:|behavior\s*:/i;

function normalizeUrl(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

function validateCommon(input: ComponentInput, options: SanitizeOptions) {
  if (!input || typeof input !== "object") {
    throw new ComponentValidationError("Component data must be an object.");
  }

  const maxName = options.maxNameLength ?? 120;
  const maxHtml = options.maxHtmlLength ?? 30_000;
  const categories = options.allowedCategories ?? DEFAULT_ALLOWED_CATEGORIES;

  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name || name.length > maxName) {
    throw new ComponentValidationError(`Component name is invalid or exceeds ${maxName} characters.`);
  }

  const category = typeof input.category === "string" ? input.category.trim() : "";
  const matchedCategory = categories.find((candidate) => candidate.toLowerCase() === category.toLowerCase());
  if (!matchedCategory) {
    throw new ComponentValidationError(`Category "${category}" is not in the allowed categories list.`);
  }

  const html = typeof input.html === "string" ? input.html.trim() : "";
  if (!html || html.length > maxHtml) {
    throw new ComponentValidationError(`Component HTML is empty or exceeds ${maxHtml} characters.`);
  }

  const author = typeof input.author === "string" && input.author.trim()
    ? input.author.trim().slice(0, 80)
    : "Community";

  const description = typeof input.description === "string" && input.description.trim()
    ? input.description.trim().slice(0, 300)
    : undefined;

  return {
    name,
    category: matchedCategory,
    html,
    author,
    description,
    sourceUrl: normalizeUrl(input.sourceUrl, "https://pixvault.dev/"),
  };
}

function assertSafeHtml(html: string, allowStyleTag: boolean): void {
  if (!allowStyleTag && /<\s*style\b/i.test(html)) {
    throw new ComponentValidationError("New component HTML must use utility classes and cannot contain <style> tags.");
  }
  if (DANGEROUS_TAG.test(html)) {
    throw new ComponentValidationError("Component HTML contains disallowed executable or document-level elements.");
  }
  if (DANGEROUS_URI.test(html)) {
    throw new ComponentValidationError("Component HTML contains a dangerous URI scheme.");
  }
  if (INLINE_HANDLER.test(html)) {
    throw new ComponentValidationError("Component HTML cannot contain inline JavaScript event handlers.");
  }
  if (DANGEROUS_FORM_ATTR.test(html)) {
    throw new ComponentValidationError("Component HTML cannot contain navigation/submission attributes such as action, formaction, or srcdoc.");
  }
  if (allowStyleTag) {
    const styleBlocks = html.match(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi) ?? [];
    if (styleBlocks.some((style) => DANGEROUS_CSS.test(style))) {
      throw new ComponentValidationError("Legacy component CSS contains a disallowed executable or remote-import pattern.");
    }
  }
}

export function sanitizeAndValidateComponent(
  input: ComponentInput,
  options: SanitizeOptions = {},
): SanitizedComponent {
  const validated = validateCommon(input, options);
  assertSafeHtml(validated.html, false);
  return validated;
}

function cleanLegacyCss(css: string): string {
  return css
    .replace(/@import\s+[^;]+;?/gi, "")
    .replace(/expression\s*\([^)]*\)/gi, "")
    .replace(/(?:javascript\s*:|data\s*:\s*text\/html)/gi, "")
    .replace(/(?:-moz-binding|behavior)\s*:[^;}]*/gi, "");
}

export function recreateLegacyHtml(html: string): string {
  let clean = html;

  clean = clean.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "");
  clean = clean.replace(/<(iframe|object|embed|applet)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  clean = clean.replace(/<\/?(?:meta|base|link)\b[^>]*>/gi, "");

  clean = clean.replace(/\s+on[a-z0-9_-]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  clean = clean.replace(/\s+(?:action|formaction|srcdoc)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  clean = clean.replace(/\b(?:javascript\s*:|data\s*:\s*text\/html)/gi, "");

  clean = clean.replace(/<style\b([^>]*)>([\s\S]*?)<\/style\s*>/gi, (_match, attrs: string, css: string) => {
    const safeCss = cleanLegacyCss(css).trim();
    return safeCss ? `<style${attrs}>${safeCss}</style>` : "";
  });

  return clean.trim();
}

export function recreateLegacyComponent(
  input: ComponentInput,
  options: SanitizeOptions = {},
): SanitizedComponent {
  const common = validateCommon(input, options);
  const html = recreateLegacyHtml(common.html);

  if (!html) {
    throw new ComponentValidationError("Legacy component became empty after executable content was removed.");
  }

  if (html.length > (options.maxHtmlLength ?? 30_000)) {
    throw new ComponentValidationError("Recreated legacy component exceeds the maximum HTML size.");
  }

  assertSafeHtml(html, true);
  return { ...common, html };
}
