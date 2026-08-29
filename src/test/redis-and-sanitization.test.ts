import { describe, expect, it } from "vitest";
import { sanitizeAndValidateComponent, ComponentValidationError } from "../../lib/sanitize-component";
import { REDIS_KEYS } from "../../lib/redis";

describe("Upstash Redis and Component Sanitization Tests", () => {
  it("generates correct Redis keys", () => {
    expect(REDIS_KEYS.COMPONENTS_INDEX).toBe("components:index");
    expect(REDIS_KEYS.component("abc-123")).toBe("component:abc-123");
    expect(REDIS_KEYS.crawler("hn")).toBe("crawler:hn");
  });

  it("validates and sanitizes a valid component", () => {
    const valid = {
      name: "Neon Glass Button",
      category: "Buttons",
      html: '<button class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded">Click me</button>',
      author: "Designer",
      sourceUrl: "https://pixvault.dev",
      description: "A neon glass button",
    };

    const result = sanitizeAndValidateComponent(valid);
    expect(result.name).toBe("Neon Glass Button");
    expect(result.category).toBe("Buttons");
    expect(result.html).toContain("bg-indigo-600");
    expect(result.author).toBe("Designer");
  });

  it("rejects dangerous script tags and iframe elements", () => {
    const dangerous = {
      name: "Malicious Component",
      category: "Buttons",
      html: '<button>Click</button><script>alert("xss")</script>',
    };

    expect(() => sanitizeAndValidateComponent(dangerous)).toThrow(ComponentValidationError);
  });

  it("rejects style tags in favor of Tailwind CSS", () => {
    const withStyle = {
      name: "Styled Component",
      category: "Cards",
      html: '<div class="card"><style>.card { color: red; }</style>Hello</div>',
    };

    expect(() => sanitizeAndValidateComponent(withStyle)).toThrow(ComponentValidationError);
  });

  it("rejects javascript: URLs and inline event handlers", () => {
    const withJsUrl = {
      name: "Bad Link",
      category: "Buttons",
      html: '<a href="javascript:alert(1)">Click</a>',
    };
    expect(() => sanitizeAndValidateComponent(withJsUrl)).toThrow(ComponentValidationError);

    const withHandler = {
      name: "Bad Event",
      category: "Buttons",
      html: '<button onclick="alert(1)">Click</button>',
    };
    expect(() => sanitizeAndValidateComponent(withHandler)).toThrow(ComponentValidationError);
  });

  it("rejects invalid categories", () => {
    const invalidCat = {
      name: "Invalid Cat Item",
      category: "NonExistentCategoryXYZ",
      html: '<div class="p-4">Content</div>',
    };

    expect(() => sanitizeAndValidateComponent(invalidCat)).toThrow(ComponentValidationError);
  });
});
