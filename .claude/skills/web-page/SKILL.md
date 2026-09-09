---
name: web-page
description: Create or restructure a public page/route of the Iterus website in both locales (cs + en) with metadata, hreflang, JSON-LD, navigation, sitemap entry, tests and PR evidence. Use this whenever the user asks for a new page, route, landing page, section, "stránka", "podstránka", "landing", "přidej do menu", or wants to redesign an existing page — even if they only describe the content and never say "page".
---

# web-page — add or rework a page (cs + en)

A page is done only when both locales exist, search engines and LLMs can read it, it is
reachable from navigation and sitemap, and CI proves it renders and is accessible.

## Inputs to collect first

1. Purpose in one sentence (what question does the page answer, for whom).
2. Content source: `docs/CONTENT-MAP.md` (keyword/answer plan) if the page is listed there; otherwise
   ask Tomas for a brief (goal, key facts from `content/facts.json`, CTA).
3. Page type → JSON-LD type (see `docs/CONTENT-GUIDE.md` § Schema map).

## Workflow

1. **Spec**: if the page is not covered by an approved spec, write `specs/NNNN-page-<slug>.md`
   from `specs/_template.md` and get approval.
2. **Slugs**: cs slug and en slug (e.g. `/sluzby` ↔ `/en/services`). Register the pair in the
   i18n routing config (pathnames map) so `Link` and hreflang stay consistent.
3. **Content** in `content/cs/<slug>.mdx` and `content/en/<slug>.mdx`, same structure, same
   frontmatter keys (`title`, `description`, `updated`, `type`). Follow answer-first: the first
   paragraph answers the page's question. Keep the mandatory footer line out of MDX — the layout
   renders it.
4. **Route**: `apps/web/src/app/[locale]/(site)/<segment>/page.tsx` with
   `generateMetadata` (title ≤ 60 chars, description 120–155 chars, `alternates.languages`
   incl. `x-default` → cs, canonical), OG image via the OG route.
5. **JSON-LD** component for the page type; validate with `pnpm check:schema`.
6. **Navigation + sitemap**: add to nav config (both labels); `sitemap.ts` picks it up from routing.
7. **Tests**: unit test for the content loader/frontmatter; Playwright smoke: page renders in both
   locales, `<html lang>` correct, hreflang present, footer legal line present, axe has no serious
   violations.
8. **Run** `pnpm check` and `pnpm test:e2e`. Fix before continuing.
9. **PR**: template filled, Vercel preview URL, screenshots desktop + mobile per locale, note
   any `TODO(facts:*)` left for Tomas. Ask the `reviewer` subagent for a review first.

## Checklist (paste into the PR)

- [ ] cs and en exist, structure identical, meaning equivalent
- [ ] answer-first first paragraph; headings as questions where natural
- [ ] metadata + hreflang + canonical + OG
- [ ] JSON-LD valid; sitemap and navigation updated
- [ ] e2e smoke + axe green; Lighthouse in CI green
- [ ] no invented facts; `content/facts.json` referenced

## Anti-patterns

- Writing English first and machine-translating to Czech; Czech is the primary audience.
- Hard-coding company data in JSX (use `content/facts.json`).
- Adding a page to navigation without the sitemap/hreflang pair (silent SEO damage).
