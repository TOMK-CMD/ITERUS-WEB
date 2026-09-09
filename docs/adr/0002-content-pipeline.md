# ADR-0002: Content pipeline — MDX in git with a zod-validated loader

- Status: accepted
- Date: 2026-09-09
- Deciders: Tomas (+ Claude Code proposing)

## Context

Site content (pages, later case studies and FAQ) is written mostly by agents through pull
requests, in Czech and English with mandatory parity, and every published fact must come from
`content/facts.json`. The stack is Next.js 16 App Router (React Server Components). Tomas asked
on 2026-09-09 whether a browser editor is needed; the answer decides between a git-based CMS UI and
plain files.

## Options considered

1. **Plain MDX in `content/{cs,en}` + `gray-matter` + `zod` + `next-mdx-remote/rsc` — chosen.**
   Three small dependencies, no admin routes, no OAuth, content diffs reviewed like code; the
   frontmatter schema enforces the content rules (title length, 120–155 char description, ISO
   `updated`, page type, draft status). Cons: no UI for non-technical editing.
2. **Keystatic** (`@keystatic/core` + `@keystatic/next`, compatible with Next 16). Adds a
   `/keystatic` admin UI over the same git files. Cons: two heavy dependencies, a GitHub App +
   OAuth for production mode, one more authentication surface to maintain, and a day of the sprint
   for the spike — for an editor nobody needs yet (content is written by agents via PRs).
3. **`@next/mdx` with `content` imported as modules.** Native Turbopack compilation, but pages
   would need static imports per file; frontmatter validation happens late (at render) and the
   loader is harder to unit test outside Next.

## Decision

Option 1. `apps/web/src/lib/content/schema.ts` (zod) and `loader.ts` (`readPage`, `listPages`,
`loadPage`). gray-matter is the single frontmatter parser for the app and for the Node scripts
(`check-i18n`, `generate-llms-txt`), so both see identical data; the MDX body is compiled with
`compileMDX` and a components map (`apps/web/src/components/mdx`) that renders facts-driven blocks
(`<ServicesList />`, `<HowWeWork />`) — MDX never inlines numbers or claims. Drafts
(`status: draft`) render with `noindex` and are excluded from the sitemap and `llms.txt`.

## Consequences

- Easier: content review in PRs, deterministic builds, unit-tested loader with fixtures, no
  runtime services. Adding a page = two MDX files + a route (see the `web-page` skill).
- Harder: no browser editing. **Revisit trigger:** when a person who does not use Claude Code
  needs to edit content; Keystatic can then be layered over the same files without a migration.
- `content/` sits outside `apps/web`; the loader resolves it from either cwd and
  `outputFileTracingIncludes` keeps it in serverless bundles.
