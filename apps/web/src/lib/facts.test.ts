import { describe, expect, it } from "vitest";
import { facts, factOrNull, howWeWork, isTodo, legalLine, tagline } from "./facts";

describe("isTodo", () => {
  it("treats TODO placeholders, empty strings and non-strings as missing facts", () => {
    expect(isTodo("TODO")).toBe(true);
    expect(isTodo("TODO(hello@iterus.cz)")).toBe(true);
    expect(isTodo("  todo — approved wording")).toBe(true);
    expect(isTodo("")).toBe(true);
    expect(isTodo(undefined)).toBe(true);
    expect(isTodo(42)).toBe(true);
  });

  it("accepts real values", () => {
    expect(isTodo("https://github.com/TOMK-CMD")).toBe(false);
    expect(factOrNull("Praha")).toBe("Praha");
    expect(factOrNull("TODO")).toBeNull();
  });
});

describe("brand facts", () => {
  it("returns the mandatory legal line per locale with the company ID", () => {
    expect(legalLine("cs")).toBe(facts.brand.legal_line_cs);
    expect(legalLine("en")).toBe(facts.brand.legal_line_en);
    expect(legalLine("cs")).toContain("SUN Professionals s.r.o.");
    expect(legalLine("cs")).toContain("27159884");
    expect(legalLine("en")).toContain("27159884");
  });

  it("exposes approved wording only (no TODO placeholders)", () => {
    for (const value of [tagline("cs"), tagline("en"), howWeWork("cs"), howWeWork("en")]) {
      expect(isTodo(value)).toBe(false);
    }
  });
});

describe("pricing facts", () => {
  const { pricing } = facts;

  it("keeps every band internally consistent and free of placeholders", () => {
    expect(pricing.bands.length).toBeGreaterThan(0);
    for (const band of pricing.bands) {
      expect(isTodo(band.cs)).toBe(false);
      expect(isTodo(band.en)).toBe(false);
      expect(isTodo(band.includes_cs)).toBe(false);
      expect(isTodo(band.includes_en)).toBe(false);
      expect(band.from_czk).toBeGreaterThan(0);
      if (band.to_czk !== null) expect(band.to_czk).toBeGreaterThan(band.from_czk);
      expect(band.weeks_max).toBeGreaterThanOrEqual(band.weeks_min);
    }
  });

  it("pins the entry prices Tomas approved, so changing one has to be deliberate", () => {
    const entries = Object.fromEntries(pricing.bands.map((band) => [band.key, band.from_czk]));
    expect(entries).toStrictEqual({ pilot: 90000, production: 250000, ai: 180000 });
  });

  it("states that amounts exclude VAT in both locales", () => {
    expect(isTodo(pricing.vat_note_cs)).toBe(false);
    expect(isTodo(pricing.vat_note_en)).toBe(false);
  });
});

describe("project publication flags", () => {
  it("never marks a project for publication without a status label and a hook", () => {
    for (const [key, project] of Object.entries(facts.projects)) {
      const record = project as Record<string, unknown>;
      if (!record.publish) continue;
      expect(isTodo(record.status_cs), `${key}.status_cs`).toBe(false);
      expect(isTodo(record.status_en), `${key}.status_en`).toBe(false);
      expect(isTodo(record.hook_cs), `${key}.hook_cs`).toBe(false);
      expect(isTodo(record.hook_en), `${key}.hook_en`).toBe(false);
    }
  });
});
