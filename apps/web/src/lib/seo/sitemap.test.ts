import { describe, expect, it } from "vitest";
import type { ContentPage } from "@/lib/content/loader";
import { SITE_URL } from "./metadata";
import { buildSitemapEntries } from "./sitemap";

function page(
  locale: "cs" | "en",
  slug: string,
  type: ContentPage["frontmatter"]["type"],
): ContentPage {
  return {
    locale,
    slug,
    file: `content/${locale}/${slug}.mdx`,
    body: "",
    frontmatter: {
      title: "T",
      description: "D".repeat(120),
      updated: "2026-09-09",
      type,
      status: "published",
    },
  };
}

describe("buildSitemapEntries", () => {
  it("emits one entry per published page and locale with hreflang alternates", () => {
    const entries = buildSitemapEntries({
      cs: [page("cs", "home", "home"), page("cs", "terms", "legal")],
      en: [page("en", "home", "home")],
    });
    expect(entries.map((e) => e.url)).toEqual([
      `${SITE_URL}/`,
      `${SITE_URL}/obchodni-podminky`,
      `${SITE_URL}/en`,
    ]);
    expect(entries[0]).toMatchObject({
      lastModified: "2026-09-09",
      priority: 1,
      alternates: {
        languages: { cs: `${SITE_URL}/`, en: `${SITE_URL}/en`, "x-default": `${SITE_URL}/` },
      },
    });
    expect(entries[1]).toMatchObject({ changeFrequency: "yearly", priority: 0.3 });
  });

  it("refuses a content slug without a registered route", () => {
    expect(() => buildSitemapEntries({ cs: [page("cs", "orphan", "page")] })).toThrowError(
      /no route registered for content slug "orphan"/,
    );
  });
});
