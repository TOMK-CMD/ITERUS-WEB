import { describe, expect, it } from "vitest";
import { buildMetadata, languageAlternates, localizedUrl, SITE_URL } from "./metadata";

describe("localizedUrl", () => {
  it("serves Czech at the root and English under /en (as-needed prefix)", () => {
    expect(localizedUrl("cs", "/")).toBe(`${SITE_URL}/`);
    expect(localizedUrl("en", "/")).toBe(`${SITE_URL}/en`);
  });

  it("maps internal route names to localized slugs", () => {
    expect(localizedUrl("cs", "/contact")).toBe(`${SITE_URL}/kontakt`);
    expect(localizedUrl("en", "/contact")).toBe(`${SITE_URL}/en/contact`);
  });
});

describe("languageAlternates", () => {
  it("lists every locale and points x-default to Czech", () => {
    expect(languageAlternates("/contact")).toEqual({
      cs: `${SITE_URL}/kontakt`,
      en: `${SITE_URL}/en/contact`,
      "x-default": `${SITE_URL}/kontakt`,
    });
  });
});

describe("buildMetadata", () => {
  const input = {
    locale: "en" as const,
    href: "/contact" as const,
    title: "Contact",
    description: "How to reach Iterus.",
  };

  it("appends the brand suffix exactly once", () => {
    expect(buildMetadata(input).title).toBe("Contact | Iterus");
    expect(buildMetadata({ ...input, title: "Contact | Iterus" }).title).toBe("Contact | Iterus");
  });

  it("sets canonical to the current locale URL and hreflang for all locales", () => {
    const meta = buildMetadata(input);
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/en/contact`);
    expect(meta.alternates?.languages).toEqual(languageAlternates("/contact"));
  });

  it("fills Open Graph with the locale-specific values", () => {
    const og = buildMetadata(input).openGraph as Record<string, unknown>;
    expect(og.url).toBe(`${SITE_URL}/en/contact`);
    expect(og.locale).toBe("en_US");
    expect(og.siteName).toBe("Iterus");
    expect(og.images).toEqual([
      { url: `${SITE_URL}/og?title=Contact&locale=en`, width: 1200, height: 630, alt: "Contact | Iterus" },
    ]);
    expect(buildMetadata(input).twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("only emits robots noindex when asked", () => {
    expect(buildMetadata(input).robots).toBeUndefined();
    expect(buildMetadata({ ...input, noindex: true }).robots).toEqual({
      index: false,
      follow: false,
    });
  });
});
