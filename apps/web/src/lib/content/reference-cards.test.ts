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

  it("never includes a case-study tier or unpublished project", () => {
    const names = getCardProjects("cs").map((card) => card.name);
    expect(names).not.toContain(facts.projects.innea.name);
    expect(names).not.toContain(facts.projects["tender-radar"].name);
  });
});
