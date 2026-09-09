import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { listPages } from "@/lib/content/loader";
import { buildSitemapEntries } from "@/lib/seo/sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pagesByLocale = Object.fromEntries(
    await Promise.all(routing.locales.map(async (locale) => [locale, await listPages(locale)])),
  );
  return buildSitemapEntries(pagesByLocale);
}
