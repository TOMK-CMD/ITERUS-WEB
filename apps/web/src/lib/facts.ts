import type { Locale } from "@/i18n/routing";
import factsJson from "../../../../content/facts.json";

/**
 * Single source of truth for every published fact (content/facts.json). Values that still
 * start with "TODO" are placeholders for Tomas and must never reach the rendered site.
 */
export const facts = factsJson;
export type Facts = typeof factsJson;

export function isTodo(value: unknown): boolean {
  if (typeof value !== "string") return true;
  const trimmed = value.trim();
  return trimmed === "" || trimmed.toUpperCase().startsWith("TODO");
}

/** The value when it is a real fact, otherwise `null` (so callers can omit the field). */
export function factOrNull(value: unknown): string | null {
  return isTodo(value) ? null : (value as string);
}

/** Mandatory footer line — rendered by the layout on every page. */
export function legalLine(locale: Locale): string {
  return locale === "cs" ? facts.brand.legal_line_cs : facts.brand.legal_line_en;
}

export function tagline(locale: Locale): string {
  return locale === "cs" ? facts.brand.tagline_cs : facts.brand.tagline_en;
}

/** Approved wording about the AI-native way of working (docs/CONTENT-GUIDE.md). */
export function howWeWork(locale: Locale): string {
  return locale === "cs" ? facts.how_we_work.approved_cs : facts.how_we_work.approved_en;
}
