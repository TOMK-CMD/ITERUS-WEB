import { z } from "zod";

/** Title without the " | Iterus" suffix (9 chars) so the rendered title stays ≤ 60. */
export const TITLE_MAX = 51;
export const DESCRIPTION_MIN = 120;
export const DESCRIPTION_MAX = 155;

export const pageTypes = ["home", "page", "contact", "legal"] as const;
export type PageType = (typeof pageTypes)[number];

/**
 * Frontmatter every MDX page in content/<locale>/ must carry. The same keys exist in both
 * locales (enforced by scripts/check-i18n.mjs); the limits follow docs/CONTENT-GUIDE.md.
 */
export const pageFrontmatterSchema = z.object({
  title: z.string().trim().min(1).max(TITLE_MAX),
  description: z.string().trim().min(DESCRIPTION_MIN).max(DESCRIPTION_MAX),
  /** ISO date (YYYY-MM-DD) of the last meaningful content change; feeds sitemap lastModified. */
  updated: z.preprocess(
    // YAML parses an unquoted 2026-09-09 as a Date; normalise it back to the ISO day.
    (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD"),
  ),
  type: z.enum(pageTypes),
  /** Drafts render with noindex and are excluded from sitemap and llms.txt. */
  status: z.enum(["draft", "published"]).default("published"),
});

export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;
