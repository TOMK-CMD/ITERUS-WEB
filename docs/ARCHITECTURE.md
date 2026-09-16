# Architecture

> Status: as built in Sprint 0 (2026-09-09). Keep this file current: any structural change updates
> it in the same PR.

## Overview

Static-first marketing site with a few server routes (contact form, OG image), built with
Next.js 16 App Router and deployed on Vercel (region `fra1`). Content is committed as MDX; facts
live in `content/facts.json`. Two locales (`cs` at `/`, `en` at `/en`), `de` planned.

## Runtime topology

```
Browser ──► Vercel edge/CDN ──► Next.js 16 (fra1, Node runtime)
                                  ├─ proxy.ts (next-intl)  → locale from the URL only, hreflang Link headers
                                  ├─ static pages (SSG)    → MDX + facts.json at build time
                                  ├─ /api/contact (POST)   → zod → honeypot → rate limit → Turnstile → Resend
                                  ├─ /og?title&locale      → dynamic OG image (ImageResponse)
                                  ├─ /icon                 → generated favicon
                                  └─ /sitemap.xml, /robots.txt, /llms.txt (generated in prebuild)
Analytics: Plausible (cookieless, env-gated)   Booking: Cal.com link (env-gated)
```

## Repository layout

- `apps/web` — Next.js app.
  - `src/app/[locale]/` — `layout.tsx` (html lang, Inter, header, footer, site-wide JSON-LD,
    Plausible), `page.tsx` (home), `contact/`, `privacy/`, `terms/`, `services/` (overview +
    `web-applications/`, `ai-integration/`, `local-llm/`, `czech-integrations/`, `ninjatrader/`),
    `pricing/`, `about/`, `process/`, `references/` (listing + one static case-study route per
    written-up product: `innea/`, `innea-pro/`, `legacy-you/`; route folders use English-internal names; Czech
    slugs come from the routing map), `not-found.tsx`, `[...rest]/` (404 inside a valid locale).
  - `src/app/api/contact/route.ts`, `src/app/og/route.tsx`, `src/app/icon.tsx`,
    `src/app/sitemap.ts`, `src/app/robots.ts`.
  - `src/i18n/` — `routing.ts` (locales, `localePrefix: as-needed`, `localeDetection: false`,
    typed `pathnames`), `navigation.ts` (`Link`, `getPathname`, …), `request.ts` (root params).
  - `src/proxy.ts` — next-intl middleware (Next 16 network boundary).
  - `src/lib/content/` — `schema.ts` (zod frontmatter), `loader.ts` (`readPage`, `listPages`,
    `loadPage` via `next-mdx-remote/rsc`; `loadPage` runs `remark-czech-nbsp.ts` for `cs` only —
    a remark plugin that replaces the space after a one-letter Czech preposition/conjunction with
    a non-breaking space, per `docs/CONTENT-GUIDE.md` → Style), `service-catalog.ts` (the five
    service detail slugs + `loadServiceCatalog`, read by the `/sluzby` overview for its cards and
    `Service` JSON-LD),
    `reference-cards.ts` (`getCardProjects`: the `facts.json → projects[*].publish === "card"`
    entries, read by both the `<ReferenceCards />` component and `/reference`'s `page.tsx` so the
    rendered cards and the `CollectionPage` JSON-LD never drift apart),
    `case-study-catalog.ts` (`CASE_STUDY_PAGES`: the case-study pages that exist — slug, pathname
    and `facts.json` project key — plus `loadCaseStudyCatalog` and `caseStudyProjectFacts`; a
    project can sit in the `case-study` tier without a page until its brief is written up, so
    the listing and JSON-LD only ever show what is built). `schema.ts` knows a `case-study` page
    type whose frontmatter must also carry `project` (the facts.json key) and `published`
    (`Article.datePublished`); `content-pages.test.ts` validates the real content tree against the
    schema in `pnpm check`, not only at build time.
  - `src/lib/pages/` — `service-detail-page.tsx` (`createServiceDetailPage`: factors the
    boilerplate shared by the five near-identical service detail routes — locale guard, MDX load,
    metadata, one `Service` JSON-LD entity — per ADR-0004) and `case-study-page.tsx`
    (`createCaseStudyPage({slug, href, project})`: the same shell for `/reference/<project>`
    routes, emitting one `Article` `about` the product and refusing a page whose frontmatter names
    a different project than the route).
  - `src/lib/seo/` — `metadata.ts` (`buildMetadata`: title suffix, canonical, hreflang,
    x-default, OG/Twitter), `paths.ts` (slug → route map, script-safe `localizedPath`),
    `sitemap.ts`, `robots.ts`, `json-ld.ts` (schema-dts builders — `Organization`/`WebSite`/
    `ProfessionalService` site-wide, `Service`/`FAQPage` for service pages, `buildPricingService`
    (`Service` + `AggregateOffer`/`Offer` per band, from `facts.json → pricing` only — the
    unpublished hourly rate is guarded out by a unit test) for `/cena`, `buildAboutPage`/
    `buildPerson` (`AboutPage` linked to the founder `Person` via `about: {"@id": ...}`) for
    `/o-nas`, `buildHowTo` (`HowTo`/`HowToStep`, built from the steps authored on the page) for
    `/jak-pracujeme`, `buildReferencesCollection` (`CollectionPage` with one `SoftwareApplication`
    per case study that has a page — linked by `url` — followed by one per card-tier project) for
    `/reference`, `buildCaseStudyArticle` (`Article` authored and published by the organisation,
    `about` a `SoftwareApplication` read from `facts.json → projects[project]` in the page's
    locale; dates from the page's `published`/`updated` frontmatter) for `/reference/<project>` —
    TODO values omitted), `og.ts`.
  - `src/lib/contact/` — `schema.ts`, `handle.ts` (pure, dependency-injected handler),
    `rate-limit.ts` (best-effort in-memory), `turnstile.ts`, `mail.ts` (Resend REST).
  - `src/lib/facts.ts` — typed access to `content/facts.json`, `isTodo()` guard.
  - `src/components/` — `site-header`, `site-footer` (legal line), `locale-switch`,
    `contact-form` (client, Turnstile explicit render), `calcom-cta`, `legal-page`, `json-ld`,
    `plausible`, `mdx/` (facts-driven blocks available inside MDX, incl. `Faq`/`FaqItem`,
    `NotOffered`, `PricingBands`, `ProcessSteps`/`Step`, `ReferenceCards`, `CaseStudyList` (one
    card per entry of `CASE_STUDY_PAGES`, linking to the page), `ProjectMetrics` (the numbers block
    of a case study — renders `facts.json → projects[project].metrics` and throws unless
    `metrics_confirmed` is true, so a number on a page has exactly one source) and `PageLink` — a
    locale-aware internal link for MDX prose, re-exporting `@/i18n/navigation`'s `Link`).
    `Faq`/`FaqItem` and `ProcessSteps`/`Step` take JSX children rather than an array/object prop:
    `next-mdx-remote`
    strips JS-expression attributes from MDX by default (`blockJS: true`, a defence for
    untrusted remote content) — children and string attributes are unaffected.
  - `e2e/` — Playwright: smoke (metadata, legal footer, locale switch, 404), axe, contact API,
    SEO artefacts. `vitest.config.mts`, `playwright.config.ts`, `components.json`, `vercel.json`.
- `packages/ui` (`@iterus/ui`) — `src/styles/tokens.css` (brand tokens → shadcn semantic
  variables, provisional), `src/styles/globals.css` (Tailwind v4 theme + base layer),
  `src/components/*` (shadcn/ui 4 on Base UI: button, card, input, textarea, sheet),
  `src/lib/utils.ts` (`cn`). Consumed as raw TS (`transpilePackages`), scanned by Tailwind via
  `@source`.
- `content/{cs,en}/*.mdx` — pages (`home`, `contact`, `privacy`, `terms`, `services`,
  `services-web-applications`, `services-ai-integration`, `services-local-llm`,
  `services-czech-integrations`, `services-ninjatrader`, `pricing`, `about`, `process`,
  `references`; case studies `references-innea`, `references-innea-pro`, `references-legacy-you` — flat slugs per
  ADR-0004, `references-<project>` mirrors the `facts.json` project key); `content/facts.json`.
- `messages/{cs,en}.json` — UI strings (next-intl, typed through `AppConfig`).
- `scripts/` — `check-i18n.mjs`, `check-schema.mjs`, `check-links.mjs`, `generate-llms-txt.mjs`
  (apps/web `prebuild`), `indexnow.mjs`, `lib/serve.mjs` (starts `next start` for scripts),
  `hooks/` (Claude Code hooks), `i18n-exceptions.json`.
- `docs/`, `specs/`, `.claude/`, `.github/` — see `CLAUDE.md`.

## Content pipeline (ADR-0002)

`content/<locale>/<slug>.mdx` → gray-matter (single frontmatter parser, also for scripts) → zod
(`title` ≤ 51 chars + " | Iterus", `description` 120–155, `updated` ISO date, `type`, `status`;
`type: case-study` additionally requires `project` and `published`) → `compileMDX` with the
components map. A page's slug must be registered in
`src/lib/seo/paths.ts` (`PAGE_ROUTES`) and its slugs in `src/i18n/routing.ts` (`pathnames`) —
sitemap, llms.txt, links and hreflang all derive from those two maps. Drafts render with
`noindex` and a banner and are excluded from sitemap and llms.txt.

## i18n (ADR-0003)

Czech at the root, English under `/en`, URL is the only source of truth (no Accept-Language
redirects). `buildMetadata()` emits canonical + `alternates.languages` + `x-default` → cs on every
page. Adding a locale: see the `i18n` skill.

## Contact form

Client renders the Turnstile widget and posts JSON; the server decides:
body → schema → honeypot (silent 200) → per-IP limit (5 / 10 min, best effort on serverless) →
503 when env is missing → Turnstile siteverify → Resend (plain text, reply-to visitor). Every
branch is unit-tested with injected dependencies; e2e covers the HTTP contract.

## Key decisions (ADRs)

- 0001 — stack (accepted, versions verified 2026-09-09)
- 0002 — content pipeline: plain MDX + zod loader (accepted)
- 0003 — i18n routing: cs at root, `/en`, URL-only locale (accepted; iterus.io open)
- 0004 — service detail pages are static `pathnames` entries with flat content slugs, not a
  dynamic `[slug]` segment (accepted; revisit past ~10 service pages or a page needing a URL
  parameter)

## Quality architecture

Vitest (unit), Playwright + axe (e2e, desktop + mobile), Lighthouse CI budgets
(perf ≥ 0.90, a11y ≥ 0.95, SEO ≥ 0.95, BP ≥ 0.90 — currently 1.0 across the board on `/` and
`/en`), parity/schema/link scripts, release-please (manifest mode). Hooks in
`.claude/settings.json` run Prettier after edits and `check:quick` before an agent turn ends.

## Environments

- Preview: every branch/PR (Vercel project `iterus-web`, root `apps/web`). Production: `main`.
  Env vars documented in `RUNBOOK.md`.
