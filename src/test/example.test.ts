import { describe, expect, it } from "vitest";
import { COMPONENTS } from "@/data/componentCatalog";
import { componentIdentity } from "@/types/resources";

describe("PIXVAULT component catalog invariants", () => {
  it("keeps component identities unique", () => {
    const identities = COMPONENTS.map(componentIdentity);
    expect(new Set(identities).size).toBe(identities.length);
  });

  it("keeps corrected and essential component categories available", () => {
    expect(COMPONENTS.find((item) => item.name === "Status Badge")?.category).toBe("Badges");
    for (const name of ["Command Palette", "Responsive Action Drawer", "Sortable Data Table", "Validated Sign In Form", "Empty Collection State", "Inline Retry State"]) {
      expect(COMPONENTS.some((item) => item.name === name), `${name} should exist`).toBe(true);
    }
  });

  it("requires complete catalog metadata", () => {
    for (const component of COMPONENTS) {
      expect(component.name.trim()).not.toBe("");
      expect(component.category.trim()).not.toBe("");
      expect(component.author.trim()).not.toBe("");
      expect(component.html.trim()).not.toBe("");
      expect(component.sourceUrl).toMatch(/^https?:\/\//);
    }
  });
});
