import type { MetadataRoute } from "next";
import { SITE_URL } from "./metadata";

/**
 * AI crawlers we explicitly welcome (seo-geo skill): being citable by answer engines is a goal,
 * not a risk, for a public marketing site. Only the API is off limits.
 */
export const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Google-Extended",
  "bingbot",
  "SeznamBot",
] as const;

export const DISALLOWED_PATHS = ["/api/"] as const;

export function buildRobots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: [...DISALLOWED_PATHS] },
      ...AI_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: [...DISALLOWED_PATHS],
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
