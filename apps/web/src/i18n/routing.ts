import { defineRouting } from "next-intl/routing";

// Czech is the primary locale and lives at the root ("/"); English is served under "/en".
// Route folders use English-internal names (the keys below); the Czech slugs are mapped here so
// `Link`, `getPathname`, hreflang and the sitemap all agree. Adding a locale: see the `i18n` skill.
export const routing = defineRouting({
  locales: ["cs", "en"],
  defaultLocale: "cs",
  localePrefix: "as-needed",
  // The URL is the only source of truth: no Accept-Language or cookie based redirects. Otherwise
  // an English browser (or Googlebot) requesting "/" or "/kontakt" would be bounced to /en.
  localeDetection: false,
  // No NEXT_LOCALE cookie either: it would never be read, it would need a privacy-policy
  // paragraph, and Set-Cookie responses are excluded from CDN caching.
  localeCookie: false,
  pathnames: {
    "/": "/",
    "/contact": { cs: "/kontakt", en: "/contact" },
    "/privacy": { cs: "/ochrana-osobnich-udaju", en: "/privacy" },
    "/terms": { cs: "/obchodni-podminky", en: "/terms" },
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
