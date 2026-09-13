import { describe, expect, it } from "vitest";
import { facts } from "@/lib/facts";
import { getCardProjects } from "./reference-cards";

describe("getCardProjects", () => {
  it("returns only projects marked publish: card, with a name/status/hook per locale", () => {
    const expectedCount = Object.values(facts.projects).filter(
      (project) => (project as { publish?: unknown }).publish === "card",
    ).length;
    expect(expectedCount).toBeGreaterThan(0);

    for (const locale of ["cs", "en"] as const) {
      const cards = getCardProjects(locale);
      expect(cards).toHaveLength(expectedCount);
      for (const card of cards) {
        expect(card.name.length).toBeGreaterThan(0);
        expect(card.status.length).toBeGreaterThan(0);
        expect(card.hook.length).toBeGreaterThan(0);
      }
    }
  });

  it("returns exactly the card-tier projects named in docs/CONTENT-MAP.md, nothing else", () => {
    const names = getCardProjects("cs")
      .map((card) => card.name)
      .sort();
    expect(names).toStrictEqual(
      [
        facts.projects["super-shared-calendar"].name,
        facts.projects.gaits.name,
        facts.projects.stamiq.name,
        facts.projects["nt8-optimizer"].name,
      ].sort(),
    );
  });

  it("never includes a case-study tier or unpublished project", () => {
    const names = getCardProjects("cs").map((card) => card.name);
    for (const key of [
      "innea",
      "innea-pro",
      "legacy-you",
      "iterus-platform",
      "tender-radar",
      "geo-seo",
    ] as const) {
      expect(names, key).not.toContain(facts.projects[key].name);
    }
  });
});
