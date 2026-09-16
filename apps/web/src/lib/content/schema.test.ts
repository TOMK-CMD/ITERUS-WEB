import { describe, expect, it } from "vitest";
import { pageFrontmatterSchema } from "./schema";

const base = {
  title: "Innea: AI podpora mezi sezeními",
  description:
    "Případová studie vlastního produktu Iterus: česká AI podpora mezi terapeutickými sezeními, krizová vrstva a architektura. Čísla z repozitáře.",
  updated: "2026-09-16",
};

describe("pageFrontmatterSchema — case studies", () => {
  it("accepts a case study that names its facts.json project and a publication date", () => {
    const result = pageFrontmatterSchema.safeParse({
      ...base,
      type: "case-study",
      project: "innea",
      published: "2026-09-16",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.project).toBe("innea");
      expect(result.data.published).toBe("2026-09-16");
    }
  });

  it("normalises a YAML date in `published` the same way as `updated`", () => {
    const result = pageFrontmatterSchema.safeParse({
      ...base,
      type: "case-study",
      project: "innea",
      published: new Date("2026-09-16T00:00:00Z"),
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.published).toBe("2026-09-16");
  });

  it("rejects a case study without a project key", () => {
    const result = pageFrontmatterSchema.safeParse({
      ...base,
      type: "case-study",
      published: "2026-09-16",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toContain("project");
    }
  });

  it("rejects a case study without a publication date", () => {
    const result = pageFrontmatterSchema.safeParse({
      ...base,
      type: "case-study",
      project: "innea",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toContain("published");
    }
  });

  it("does not require project or published on ordinary pages", () => {
    const result = pageFrontmatterSchema.safeParse({ ...base, type: "page" });
    expect(result.success).toBe(true);
  });
});
