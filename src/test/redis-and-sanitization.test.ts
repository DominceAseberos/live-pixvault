import { describe, expect, it } from "vitest";
import { COMPONENTS } from "../data/componentCatalog";
import {
  ComponentValidationError,
  recreateLegacyComponent,
  sanitizeAndValidateComponent,
} from "../../lib/sanitize-component";
import { REDIS_KEYS } from "../../lib/redis";
import { requireServerSecret } from "../../lib/auth";
import type { ApiRequest } from "../../lib/api";

describe("Upstash Redis keys", () => {
  it("generates stable component, category, and crawler keys", () => {
    expect(REDIS_KEYS.COMPONENTS_INDEX).toBe("components:index");
    expect(REDIS_KEYS.component("abc-123")).toBe("component:abc-123");
    expect(REDIS_KEYS.category("Empty States")).toBe("components:category:empty-states");
    expect(REDIS_KEYS.crawler("hn")).toBe("crawler:hn");
  });
});

describe("new component validation", () => {
  it("accepts a valid utility-class component", () => {
    const result = sanitizeAndValidateComponent({
      name: "Neon Glass Button",
      category: "Buttons",
      html: '<button class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded">Click me</button>',
      author: "Designer",
      sourceUrl: "https://pixvault.dev",
      description: "A neon glass button",
    });

    expect(result.name).toBe("Neon Glass Button");
    expect(result.category).toBe("Buttons");
    expect(result.html).toContain("bg-indigo-600");
    expect(result.author).toBe("Designer");
  });

  it("rejects executable and document-level tags", () => {
    expect(() => sanitizeAndValidateComponent({
      name: "Malicious Component",
      category: "Buttons",
      html: '<button>Click</button><script>alert("xss")</script>',
    })).toThrow(ComponentValidationError);

    expect(() => sanitizeAndValidateComponent({
      name: "Embedded Frame",
      category: "Cards",
      html: '<iframe src="https://example.com"></iframe>',
    })).toThrow(ComponentValidationError);
  });

  it("rejects style tags for newly created components", () => {
    expect(() => sanitizeAndValidateComponent({
      name: "Styled Component",
      category: "Cards",
      html: '<style>.card { color: red; }</style><div class="card">Hello</div>',
    })).toThrow(ComponentValidationError);
  });

  it("rejects dangerous URI, event, and submission attributes", () => {
    const badHtml = [
      '<a href="javascript:alert(1)">Click</a>',
      '<button onclick="alert(1)">Click</button>',
      '<form action="https://example.com"><input></form>',
      '<button formaction="https://example.com">Send</button>',
      '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
    ];

    for (const html of badHtml) {
      expect(() => sanitizeAndValidateComponent({ name: "Unsafe", category: "Buttons", html })).toThrow(ComponentValidationError);
    }
  });

  it("rejects invalid categories", () => {
    expect(() => sanitizeAndValidateComponent({
      name: "Invalid Cat Item",
      category: "NonExistentCategoryXYZ",
      html: '<div class="p-4">Content</div>',
    })).toThrow(ComponentValidationError);
  });

  it("normalizes invalid source URLs instead of emitting unsafe protocols", () => {
    const result = sanitizeAndValidateComponent({
      name: "Safe Link",
      category: "Buttons",
      html: '<button class="p-2">Safe</button>',
      sourceUrl: "javascript:alert(1)",
    });
    expect(result.sourceUrl).toBe("https://pixvault.dev/");
  });
});

describe("legacy component recreation", () => {
  it("preserves safe legacy CSS while removing executable behavior", () => {
    const result = recreateLegacyComponent({
      name: "Legacy Button",
      category: "Buttons",
      html: '<style>@import url("https://bad.example/x.css"); .legacy{color:red}</style><button class="legacy" onclick="alert(1)">Legacy</button><script>alert(2)</script>',
      author: "Legacy",
    });

    expect(result.html).toContain("<style>");
    expect(result.html).toContain(".legacy{color:red}");
    expect(result.html).not.toMatch(/<script|onclick\s*=|@import/i);
  });

  it("removes legacy form navigation attributes", () => {
    const result = recreateLegacyComponent({
      name: "Legacy Form",
      category: "Forms",
      html: '<form action="https://bad.example"><input class="border"><button formaction="https://bad.example">Save</button></form>',
    });
    expect(result.html).not.toMatch(/\b(?:action|formaction)\s*=/i);
  });
});

describe("curated component catalog safety", () => {
  it("contains no inline DOM event attributes", () => {
    for (const component of COMPONENTS) {
      expect(component.html, component.name).not.toMatch(/\bon[a-z0-9_-]+\s*=/i);
    }
  });

  it("contains no executable script or dangerous navigation patterns", () => {
    for (const component of COMPONENTS) {
      expect(component.html, component.name).not.toMatch(/<script|javascript:|data:text\/html/i);
    }
  });
});

describe("write endpoint authentication", () => {
  it("fails closed when no server secret is configured", () => {
    const oldAdmin = process.env.ADMIN_SECRET;
    const oldWrite = process.env.COMPONENT_WRITE_SECRET;
    delete process.env.ADMIN_SECRET;
    delete process.env.COMPONENT_WRITE_SECRET;

    const request = { headers: {} } as ApiRequest;
    const result = requireServerSecret(request, ["COMPONENT_WRITE_SECRET", "ADMIN_SECRET"]);
    expect(result).toEqual(expect.objectContaining({ ok: false, status: 503 }));

    if (oldAdmin) process.env.ADMIN_SECRET = oldAdmin;
    if (oldWrite) process.env.COMPONENT_WRITE_SECRET = oldWrite;
  });
});
