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
      expect(band.weeks_min).toBeGreaterThan(0);
      expect(band.weeks_max).toBeGreaterThanOrEqual(band.weeks_min);
      const onPrem = (band as { on_prem_from_czk?: number }).on_prem_from_czk;
      if (onPrem !== undefined) expect(onPrem).toBeGreaterThanOrEqual(band.from_czk);
    }
  });

  it("pins the entry prices Tomas approved, so changing one has to be deliberate", () => {
    const entries = Object.fromEntries(pricing.bands.map((band) => [band.key, band.from_czk]));
    expect(entries).toStrictEqual({ pilot: 90000, production: 250000, ai: 180000 });
  });

  it("keeps the day rate consistent with the hourly rate", () => {
    expect(pricing.reference_rate_czk_day).toBe(pricing.reference_rate_czk_hour * 8);
  });

  it("records what each band's entry price buys at the reference rate", () => {
    for (const band of pricing.bands) {
      const hours = band.implied_hours_at_reference_rate;
      expect(hours).toBeGreaterThan(0);
      expect(hours * pricing.reference_rate_czk_hour).toBe(band.from_czk);
    }
  });

  it("does not let the two scope bands overlap", () => {
    const byKey = Object.fromEntries(pricing.bands.map((band) => [band.key, band]));
    expect(byKey.pilot.to_czk).toBeLessThanOrEqual(byKey.production.from_czk);
  });

  it("states VAT, the free call and the paid discovery in both locales", () => {
    expect(isTodo(pricing.vat_note_cs)).toBe(false);
    expect(isTodo(pricing.vat_note_en)).toBe(false);
    expect(pricing.consultation.free_minutes).toBeGreaterThan(0);
    expect(isTodo(pricing.consultation.cs)).toBe(false);
    expect(isTodo(pricing.consultation.en)).toBe(false);
    expect(pricing.discovery.czk).toBeGreaterThan(0);
    expect(isTodo(pricing.discovery.cs)).toBe(false);
    expect(isTodo(pricing.discovery.en)).toBe(false);
  });
});

describe("project publication flags", () => {
  const publishable = Object.entries(facts.projects).filter(
    ([, project]) => (project as { publish?: unknown }).publish,
  );

  it("has something to publish", () => {
    expect(publishable.length).toBeGreaterThan(0);
  });

  it("never marks a project for publication without a name, a status label and a hook", () => {
    for (const [key, project] of publishable) {
      const record = project as Record<string, unknown>;
      for (const field of ["name", "status_cs", "status_en", "hook_cs", "hook_en"]) {
        expect(isTodo(record[field]), `${key}.${field}`).toBe(false);
      }
    }
  });

  it("makes a hook that states a measurement name where the measurement came from", () => {
    for (const [key, project] of publishable) {
      const record = project as Record<string, unknown>;
      const statesNumber = [record.hook_cs, record.hook_en].some(
        (hook) => typeof hook === "string" && /\d/.test(hook),
      );
      if (statesNumber) expect(isTodo(record.claims_source), `${key}.claims_source`).toBe(false);
    }
  });
});

describe("bilingual facts", () => {
  it("pairs every _cs value with a different _en value", () => {
    const seen: string[] = [];
    const walk = (node: unknown, path: string) => {
      if (Array.isArray(node)) return node.forEach((item, i) => walk(item, `${path}[${i}]`));
      if (!node || typeof node !== "object") return;
      const record = node as Record<string, unknown>;
      for (const [key, value] of Object.entries(record)) {
        if (key.endsWith("_cs")) {
          const twin = `${key.slice(0, -3)}_en`;
          seen.push(`${path}.${key}`);
          expect(record, `${path}.${twin} missing`).toHaveProperty(twin);
          if (!isTodo(value) && !isTodo(record[twin])) {
            expect(record[twin], `${path}.${twin} repeats the Czech text`).not.toBe(value);
          }
        }
        walk(value, `${path}.${key}`);
      }
    };
    walk(facts, "facts");
    expect(seen.length).toBeGreaterThan(10);
  });
});
