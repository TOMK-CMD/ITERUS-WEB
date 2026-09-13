import type { AppPathname, Locale } from "@/i18n/routing";
import { readPage } from "./loader";

/**
 * The five service detail pages (ADR-0004: static entries, flat content slugs). Single place that
 * pairs each content slug with its pathname — `/sluzby` reads it to build cards and `Service`
 * JSON-LD; each detail page's own route registers the same pair independently in `PAGE_ROUTES`.
 */
export const SERVICE_DETAIL_PAGES: { slug: string; href: AppPathname }[] = [
  { slug: "services-web-applications", href: "/services/web-applications" },
  { slug: "services-ai-integration", href: "/services/ai-integration" },
  { slug: "services-local-llm", href: "/services/local-llm" },
  { slug: "services-czech-integrations", href: "/services/czech-integrations" },
  { slug: "services-ninjatrader", href: "/services/ninjatrader" },
];

export type ServiceCatalogItem = {
  slug: string;
  href: AppPathname;
  name: string;
  description: string;
};

/** Title and description of every service detail page, read from its own frontmatter. */
export async function loadServiceCatalog(locale: Locale): Promise<ServiceCatalogItem[]> {
  return Promise.all(
    SERVICE_DETAIL_PAGES.map(async ({ slug, href }) => {
      const { frontmatter } = await readPage(locale, slug);
      return { slug, href, name: frontmatter.title, description: frontmatter.description };
    }),
  );
}
