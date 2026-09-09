---
name: i18n
description: Everything about locales on the Iterus site — adding a language (de, …), keeping cs/en parity of messages and content, translating pages, fixing hreflang/routing, running and repairing the parity check. Use whenever the user mentions translation, "překlad", "přelož", "němčina", "DE verze", "chybí anglická verze", locale, hreflang, next-intl, or when check:i18n fails.
---

# i18n — locales, parity, translations

Czech is the primary locale (served at `/`), English at `/en`, German planned at `/de`.
Parity is enforced: `pnpm check:i18n` fails on missing message keys or content files.

## Adding a locale (e.g. `de`)

1. Spec + ADR note (why, scope: which pages first — usually home, services, contact, references).
2. Routing: add the locale to `apps/web/src/i18n/routing.ts` (`locales`, `pathnames` for every
   route pair), keep `defaultLocale: 'cs'`, `localePrefix: 'as-needed'`.
3. Messages: copy `messages/en.json` → `messages/de.json`, translate, keep keys identical.
4. Content: create `content/de/` mirroring `content/en/` file by file (same frontmatter keys).
   Untranslated pages must not be published half-empty: either translate or exclude the route
   from that locale explicitly (routing) so hreflang stays truthful.
5. Metadata: `alternates.languages` gains `de`; `x-default` stays `cs`.
6. Legal pages (privacy, terms): draft, then flag for Tomas's review before publishing.
7. Tests: extend the e2e locale matrix; run `pnpm check:i18n`, `pnpm test:e2e`.
8. Docs: `docs/ARCHITECTURE.md` (locales), `docs/CONTENT-GUIDE.md` (terminology table + de column).

## Translating well

- Translate meaning, not words. Keep the answer-first structure and numbers identical.
- Terminology table in `docs/CONTENT-GUIDE.md` is binding (e.g. "vývoj software na zakázku" ↔
  "custom software development"). Extend it when you introduce a new recurring term.
- Keep brand names, product names and the footer legal line as defined in `docs/BRAND.md`.
- Never machine-translate legal or pricing text silently; mark it for review.

## The parity check (`scripts/check-i18n.mjs`)

Compares (a) message keys across `messages/*.json`, (b) file sets under `content/<locale>/`,
(c) frontmatter keys per matching file. When it fails: fix content, do not weaken the check.
If a locale intentionally lacks a page, register the exception in `scripts/i18n-exceptions.json`
with a reason and a Linear issue link.
