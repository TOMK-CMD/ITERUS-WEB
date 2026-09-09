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
