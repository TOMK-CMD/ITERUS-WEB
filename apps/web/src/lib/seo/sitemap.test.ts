import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { listPages } from "@/lib/content/loader";
import { SITE_URL } from "./metadata";
import { buildSitemapEntries } from "./sitemap";

const contentDir = fileURLToPath(new URL("../content/__fixtures__", import.meta.url));

describe("buildSitemapEntries", () => {
  it("emits one entry per published page and locale with hreflang alternates", () => {
    const page = (locale: "cs" | "en", slug: string, type = "page") => ({
      locale,
      slug,
      file: `content/${locale}/${slug}.mdx`,
      body: "",
      frontmatter: {
        title: "T",
        description: "D".repeat(120),
        updated: "2026-09-09",
        type: type as "page" | "home" | "legal" | "contact",
        status: "published" as const,
      },
    });
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
    expect(() =>
      buildSitemapEntries({
        cs: [
          {
            locale: "cs",
            slug: "orphan",
            file: "content/cs/orphan.mdx",
            body: "",
            frontmatter: {
              title: "T",
              description: "D".repeat(120),
              updated: "2026-09-09",
              type: "page",
              status: "published",
            },
          },
        ],
      }),
    ).toThrowError(/no route registered for content slug "orphan"/);
  });

  it("works with real loader output (drafts already filtered)", async () => {
    // Fixture slugs are not routes, so only verify that listPages hands over published pages.
    const pages = await listPages("cs", { contentDir });
    expect(pages.every((p) => p.frontmatter.status === "published")).toBe(true);
  });
});
