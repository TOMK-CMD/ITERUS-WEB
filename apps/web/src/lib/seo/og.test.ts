import { describe, expect, it } from "vitest";
import { SITE_URL } from "./metadata";
import { OG_TITLE_MAX, ogImageUrl, parseOgParams } from "./og";

describe("Open Graph image helpers", () => {
  it("builds an absolute /og URL with encoded title and locale", () => {
    expect(ogImageUrl("cs", "Kontakt & ceník")).toBe(
      `${SITE_URL}/og?title=Kontakt+%26+cen%C3%ADk&locale=cs`,
    );
  });

  it("clamps the title length on both ends", () => {
    const long = "x".repeat(200);
    expect(ogImageUrl("en", long)).toContain(`title=${"x".repeat(OG_TITLE_MAX)}&`);
    expect(parseOgParams(new URLSearchParams({ title: long })).title).toHaveLength(OG_TITLE_MAX);
  });

  it("falls back to the brand name and Czech for missing or unknown params", () => {
    expect(parseOgParams(new URLSearchParams())).toEqual({ title: "Iterus", locale: "cs" });
    expect(parseOgParams(new URLSearchParams({ title: "  A   B ", locale: "de" }))).toEqual({
      title: "A B",
      locale: "cs",
    });
  });
});
