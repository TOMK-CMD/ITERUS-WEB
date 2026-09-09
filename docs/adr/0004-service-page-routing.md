# ADR-0004: Service detail pages are static routes, not a dynamic `[slug]` segment

- Status: proposed
- Date: 2026-09-09
- Deciders: Tomas (+ Claude Code proposing)

## Context

`docs/CONTENT-MAP.md` adds five service detail pages in the first wave (`/sluzby/webove-aplikace`,
`/sluzby/ai-integrace`, `/sluzby/lokalni-llm`, `/sluzby/ceske-integrace` and `/sluzby/ninjatrader`),
each with a Czech path and a differently worded English path. More are likely in Sprint 2. The
obvious move — one dynamic `/sluzby/[slug]` route reading nested MDX — collides with how the SEO
helpers built in Sprint 0 actually work. Verified in the code on 2026-09-09:

- `localizedPath` (`apps/web/src/lib/seo/paths.ts:20`), `localizedUrl` and `languageAlternates`
  (`apps/web/src/lib/seo/metadata.ts`) and `buildSitemapEntries` (`apps/web/src/lib/seo/sitemap.ts:17`)
  all take an `AppPathname` and accept no params, so a dynamic segment reaches canonical URLs,
  `hreflang` and the sitemap as the literal string `[slug]`.
- `PAGE_ROUTES` (`apps/web/src/lib/seo/paths.ts:9`) is typed `Record<string, AppPathname>`: one
  content slug maps to one pathname, with no notion of a parameterised route.
- next-intl substitutes the _same_ param value into both locale templates, so
  `/sluzby/webove-aplikace` ↔ `/en/services/web-applications` needs a per-locale slug map anyway.
- `listPages` (`apps/web/src/lib/content/loader.ts:88`) and `scripts/generate-llms-txt.mjs` read only
  top-level `content/<locale>/*.mdx`, while `scripts/check-i18n.mjs` reads recursively. Nested MDX
  would therefore pass the parity gate and silently disappear from the sitemap and `llms.txt` — a
  failure with no error message, which is the worst kind.

## Options considered

1. **Dynamic `/sluzby/[slug]` with nested content** — one route file, no per-page registration.
   Requires teaching `localizedPath`, `localizedUrl`, `languageAlternates`, `buildSitemapEntries`
   and `PAGE_ROUTES` about params, adding a per-locale slug map, and making `listPages` and the
   llms.txt generator recursive. Five helpers and two scripts change before the first page ships,
   and the parity/sitemap mismatch above has to be closed or it becomes a silent trap.
2. **Static entries in `pathnames` with flat content slugs** — one line per page in `routing.ts`
   and `PAGE_ROUTES`, content at `content/<locale>/services-web-applications.mdx`. Zero helper
   changes; per-locale paths work natively because `pathnames` already accepts
   `{ cs: "…", en: "…" }`; the existing recursion mismatch stays irrelevant because nothing nests.
   Cost: one registration line per new service page, and flat filenames that read less tidily.
3. **Static routes now, revisit when the list grows** — option 2 plus an explicit trigger to
   reconsider.

## Decision

Option 3. Each service detail page is a static entry in `routing.pathnames` and `PAGE_ROUTES`, with
a flat content slug. The registration line is cheap and the alternative rewrites five SEO helpers
before a single page exists — a refactor that would be done blind, ahead of any evidence about how
many service pages we actually want.

## Consequences

- Adding a service page means: one `pathnames` entry, one `PAGE_ROUTES` entry, two MDX files, one
  row in `docs/CONTENT-MAP.md`. The `web-page` skill covers the sequence.
- Canonical URLs, `hreflang`, sitemap and `llms.txt` keep working with no helper changes, and the
  `check:i18n` / sitemap recursion mismatch stays out of reach.
- Content filenames are flat and slightly ugly (`services-web-applications.mdx`). Accepted.
- **Revisit when the site has more than ~10 service pages, or when a page needs a URL parameter.**
  At that point the helper refactor pays for itself, and this ADR is superseded.
- Independently of this decision, the recursion mismatch between `check-i18n.mjs` (recursive) and
  `listPages` / `generate-llms-txt.mjs` (top level only) is a latent trap. It is not triggered by
  this ADR, but it should be closed — tracked as a tech-debt item in `specs/0002`.
