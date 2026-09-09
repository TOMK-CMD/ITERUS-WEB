// Relative import with extension on purpose: scripts/generate-llms-txt.mjs loads this file with
// Node's native type stripping, which resolves neither the "@/" alias nor extension-less paths.
import { routing, type AppPathname, type Locale } from "../../i18n/routing.ts";

/**
 * Content slug (content/<locale>/<slug>.mdx) → internal pathname. Every page that has MDX must be
 * listed here; sitemap and llms.txt derive their URLs from it.
 */
export const PAGE_ROUTES: Record<string, AppPathname> = {
  home: "/",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
};

/**
 * Dependency-free twin of next-intl's getPathname() for the as-needed prefix strategy, usable
 * from Node scripts (scripts/generate-llms-txt.mjs). A unit test keeps it equal to getPathname.
 */
export function localizedPath(locale: Locale, href: AppPathname): string {
  const entry = routing.pathnames[href];
  const path = typeof entry === "string" ? entry : entry[locale];
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const combined = `${prefix}${path === "/" ? "" : path}`;
  return combined === "" ? "/" : combined;
}
