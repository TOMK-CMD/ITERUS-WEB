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
      if ("on_prem_from_czk" in band) {
        const onPrem = (band as { on_prem_from_czk: unknown }).on_prem_from_czk;
        expect(typeof onPrem, `${band.key}.on_prem_from_czk`).toBe("number");
        expect(onPrem as number).toBeGreaterThanOrEqual(band.from_czk);
      }
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
    // Pinned so that adding a band forces someone to decide where it sits: `pilot` and
    // `production` are scope bands on one axis, `ai` is priced on a different one.
    expect(Object.keys(byKey).sort()).toStrictEqual(["ai", "pilot", "production"]);
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
      expect(typeof record.claims_confirmed, `${key}.claims_confirmed`).toBe("boolean");
    }
  });
});

describe("bilingual facts", () => {
  // Keys where the Czech and English text is legitimately identical (proper nouns, stack names).
  // Empty today; add a key here rather than weakening the assertion below.
  const IDENTICAL_BY_DESIGN: string[] = [];

  it("pairs every _cs value with a different _en value, in both directions", () => {
    const seen: string[] = [];
    const walk = (node: unknown, path: string) => {
      if (Array.isArray(node)) return node.forEach((item, i) => walk(item, `${path}[${i}]`));
      if (!node || typeof node !== "object") return;
      const record = node as Record<string, unknown>;
      for (const [key, value] of Object.entries(record)) {
        const suffix = key.endsWith("_cs") ? "_cs" : key.endsWith("_en") ? "_en" : null;
        if (suffix) {
          const base = key.slice(0, -3);
          const twin = `${base}${suffix === "_cs" ? "_en" : "_cs"}`;
          seen.push(`${path}.${key}`);
          expect(record, `${path}.${twin} missing`).toHaveProperty(twin);
          const identicalAllowed = IDENTICAL_BY_DESIGN.includes(base);
          if (suffix === "_cs" && !identicalAllowed && !isTodo(value) && !isTodo(record[twin])) {
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

describe("founder identity", () => {
  const org = facts.organization;

  it("keeps one canonical spelling and an ASCII-only alternate", () => {
    expect(isTodo(org.founder_name)).toBe(false);
    expect(isTodo(org.founder_name_alternate)).toBe(false);
    // The alternate exists for Person.alternateName, so it must be the stripped form —
    // swapping the two would publish the diacritics-free name as the person's actual name.
    expect(org.founder_name_alternate).toMatch(/^[ -~]+$/);
    expect(org.founder_name).not.toBe(org.founder_name_alternate);
  });
});

describe("organization identifiers", () => {
  const org = facts.organization;

  it("keeps the VAT number derived from the company ID", () => {
    // A typo here would ship a wrong identifier into Organization JSON-LD on every page.
    expect(org.dic).toBe(`CZ${org.ico}`);
  });

  it("keeps the printed address assembled from its own parts", () => {
    // The display string and the structured fields feed different surfaces (contact page vs
    // JSON-LD). If they drift, the site and the register stop agreeing about the same address.
    const { registered_address, district, postal_code, address_display, city } = org;
    for (const part of [registered_address, district, postal_code, city]) {
      expect(isTodo(part)).toBe(false);
      expect(address_display, `${part} missing from address_display`).toContain(part as string);
    }
    expect(postal_code).toMatch(/^\d{3} \d{2}$/);
  });

  it("carries the by-appointment note in both locales, because the address is a home", () => {
    expect(isTodo(org.address_note_cs)).toBe(false);
    expect(isTodo(org.address_note_en)).toBe(false);
    expect(isTodo(org.address_note_rule)).toBe(false);
  });

  it("keeps the contact e-mail on the site's own domain", () => {
    // A contact address on a foreign domain (gmail, seznam) undercuts the entity consistency
    // the whole SEO/GEO approach rests on, and reads as a hobby project.
    expect(isTodo(org.email)).toBe(false);
    const host = new URL(org.urls.primary).hostname.replace(/^www\./, "");
    expect(org.email).toMatch(new RegExp(`@${host.replace(/\./g, "\.")}$`));
  });

  it("keeps the dialable phone equal to the printed one", () => {
    expect(org.phone_e164).toBe(org.phone.replace(/\s/g, ""));
    expect(org.phone_e164).toMatch(/^\+[1-9]\d{6,14}$/);
  });
});

describe("founder story", () => {
  const org = facts.organization;

  it("is only publishable once approved, and then must have real text in both locales", () => {
    expect(typeof org.founder_story_approved).toBe("boolean");
    if (org.founder_story_approved) {
      expect(isTodo(org.founder_story_cs)).toBe(false);
      expect(isTodo(org.founder_story_en)).toBe(false);
    }
  });

  it("never states or denies that the founder is a programmer", () => {
    // CLAUDE.md forbids both directions. The draft is framed around time, not ability;
    // this stops a later edit from quietly crossing the line in either direction.
    const forbidden = [
      /neum(ěl|ím)\s+programovat/i,
      /nejsem\s+program(átor|ovač)/i,
      /jsem\s+program(átor|ovač)/i,
      /programátorsk[éá]\s+schopnosti/i,
      /(not|never)\s+a\s+(programmer|developer|coder)/i,
      /\bI(?:'m| am)\s+a\s+(programmer|developer|coder)\b/i,
    ];
    for (const text of [org.founder_story_cs, org.founder_story_en]) {
      for (const pattern of forbidden) {
        expect(pattern.test(text as string), `${pattern} matched: ${text}`).toBe(false);
      }
    }
  });
});
