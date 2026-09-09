import type { MetadataRoute } from "next";
import { routing, type Locale } from "@/i18n/routing";
import type { ContentPage } from "@/lib/content/loader";
import { languageAlternates, localizedUrl } from "./metadata";
import { PAGE_ROUTES } from "./paths";

/**
 * Builds sitemap entries from already-loaded (published) pages. One entry per page and locale,
 * each carrying hreflang alternates; drafts never reach this function (listPages filters them).
 */
export function buildSitemapEntries(
  pagesByLocale: Partial<Record<Locale, ContentPage[]>>,
): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    for (const page of pagesByLocale[locale] ?? []) {
      const href = PAGE_ROUTES[page.slug];
      if (!href) {
        throw new Error(`sitemap: no route registered for content slug "${page.slug}"`);
      }
      entries.push({
        url: localizedUrl(locale, href),
        lastModified: page.frontmatter.updated,
        changeFrequency: page.frontmatter.type === "legal" ? "yearly" : "monthly",
        priority: href === "/" ? 1 : page.frontmatter.type === "legal" ? 0.3 : 0.7,
        alternates: { languages: languageAlternates(href) },
      });
    }
  }
  return entries;
}
