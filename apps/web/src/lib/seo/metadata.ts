import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppPathname, type Locale } from "@/i18n/routing";
import { OG_HEIGHT, OG_WIDTH, ogImageUrl } from "./og";

const BRAND = "Iterus";
const TITLE_SUFFIX = ` | ${BRAND}`;

/** Canonical origin of the site (no trailing slash). Overridable per environment. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://iterus.cz").replace(
  /\/+$/,
  "",
);

const OG_LOCALES: Record<Locale, string> = { cs: "cs_CZ", en: "en_US" };

/** Absolute URL of an internal pathname in the given locale (respects the as-needed prefix). */
export function localizedUrl(locale: Locale, href: AppPathname): string {
  return SITE_URL + getPathname({ locale, href });
}

/** All locale variants of a pathname plus `x-default` → Czech, ready for `alternates.languages`. */
export function languageAlternates(href: AppPathname): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = localizedUrl(locale, href);
  }
  languages["x-default"] = localizedUrl(routing.defaultLocale, href);
  return languages;
}

export type PageMetadataInput = {
  locale: Locale;
  href: AppPathname;
  /** Page title without the brand suffix; the suffix is appended here. */
  title: string;
  /** 120–155 characters, phrased as the answer to the page's question. */
  description: string;
  /** Drafts and internal pages: noindex + nofollow. */
  noindex?: boolean;
};

/** Builds the Next.js `Metadata` object every page uses: title, canonical, hreflang, Open Graph. */
export function buildMetadata({
  locale,
  href,
  title,
  description,
  noindex = false,
}: PageMetadataInput): Metadata {
  const fullTitle = title.endsWith(TITLE_SUFFIX) ? title : `${title}${TITLE_SUFFIX}`;
  const url = localizedUrl(locale, href);

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(href),
    },
    openGraph: {
      type: "website",
      siteName: BRAND,
      locale: OG_LOCALES[locale],
      url,
      title: fullTitle,
      description,
      images: [{ url: ogImageUrl(locale, title), width: OG_WIDTH, height: OG_HEIGHT, alt: fullTitle }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
