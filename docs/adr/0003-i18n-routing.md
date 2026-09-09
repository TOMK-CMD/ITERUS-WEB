# ADR-0003: i18n routing — Czech at the root, English under /en

- Status: accepted
- Date: 2026-09-09
- Deciders: Tomas (+ Claude Code proposing)

## Context

The site launches in Czech (primary audience) and English, with German planned. Search engines
and LLM answer engines need one canonical URL per page and locale, truthful `hreflang`, and a
stable `x-default`. Two domains exist (`iterus.cz`, `iterus.io`); their relationship is not
decided yet. The app uses Next.js 16 App Router with `next-intl` 4.14.

## Options considered

1. **Czech at the root, other locales prefixed (`/`, `/en`, later `/de`) — chosen.** Clean Czech
   URLs for the main market, one host, `localePrefix: 'as-needed'`. Cons: the default locale has
   no explicit prefix, so the proxy must redirect `/cs/…` → `/…` and the cookie-based locale
   switch always goes through a prefixed URL first (handled by next-intl).
2. Every locale prefixed (`/cs`, `/en`) with `/` redirecting by `Accept-Language`. Symmetric and
   simple, but the root URL is never canonical and every Czech link carries `/cs`, which is
   unusual for a Czech company site.
3. One domain per locale (`iterus.cz` = cs, `iterus.io` = en). Strong signal per market, but two
   hosts double the SEO surface (hreflang across hosts, two sitemaps, two Search Console
   properties, two analytics sites) and complicate previews and tests.

## Decision

Option 1. `apps/web/src/i18n/routing.ts` defines `locales: ['cs', 'en']`, `defaultLocale: 'cs'`,
`localePrefix: 'as-needed'` and a typed `pathnames` map whose keys are English-internal route
names (`/contact`, `/privacy`, `/terms`) mapped to localized slugs (`/kontakt`,
`/ochrana-osobnich-udaju`, `/obchodni-podminky`). `src/proxy.ts` (Next 16 network boundary)
resolves the locale from the URL only (`localeDetection: false` — an English browser or
Googlebot asking for `/` must get the Czech page, not a redirect to `/en`; the e2e suite caught
this on the first run) and emits hreflang `Link` headers. `src/lib/seo/metadata.ts` builds
`canonical`, `alternates.languages` (cs, en) and `x-default` → Czech from the same map, so
metadata, sitemap and links cannot drift apart. The canonical host is `https://iterus.cz`
(`NEXT_PUBLIC_SITE_URL`).

Static rendering: the `[locale]` segment is read through `next/root-params` (Next 16.3+), so
`setRequestLocale` is not needed; if that API changes, the fallback is `setRequestLocale` in
`app/[locale]/layout.tsx`.

## Consequences

- Easier: one host for SEO, previews and tests; adding `de` is a routing entry, a messages file
  and a content folder (see the `i18n` skill); every page gets correct hreflang for free through
  `buildMetadata()`.
- Harder: the Czech slug of every route must be registered in `pathnames`; a page that exists in
  only one locale must be excluded explicitly (`scripts/i18n-exceptions.json`) so hreflang stays
  truthful.
- **Open — iterus.io (decision for Tomas at go-live):** the recommended default is a 301 from
  `iterus.io/*` to `iterus.cz/en/*` (single canonical host); the alternative is option 3. Until
  decided, `iterus.io` is not referenced by any code path.
- Revisit when German launches or if the international share of traffic justifies a separate
  host.
