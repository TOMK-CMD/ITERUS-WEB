import type { Locale } from "@/i18n/routing";
import { SITE_URL } from "./metadata";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_TITLE_MAX = 90;

/** Absolute URL of the dynamic Open Graph image for a page title. */
export function ogImageUrl(locale: Locale, title: string): string {
  const params = new URLSearchParams({ title: title.slice(0, OG_TITLE_MAX), locale });
  return `${SITE_URL}/og?${params.toString()}`;
}

/** Reads and sanitises the query of GET /og. */
export function parseOgParams(searchParams: URLSearchParams): { title: string; locale: Locale } {
  const raw = searchParams.get("title") ?? "";
  const title = raw.replace(/\s+/g, " ").trim().slice(0, OG_TITLE_MAX) || "Iterus";
  const locale: Locale = searchParams.get("locale") === "en" ? "en" : "cs";
  return { title, locale };
}
