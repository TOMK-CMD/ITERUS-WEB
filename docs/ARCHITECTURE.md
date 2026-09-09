# Architecture

> Status: target architecture, to be confirmed by Sprint 0 (specs/0001). Keep this file current:
> any structural change updates it in the same PR.

## Overview
Static-first marketing site with a few server routes (contact form, OG images, later AI intake),
built with Next.js App Router and deployed on Vercel (region `fra1`). Content is committed as MDX;
facts live in `content/facts.json`. Two locales at launch (`cs` at `/`, `en` at `/en`), `de`
planned.

## Runtime topology
```
Browser ──► Vercel edge/CDN ──► Next.js (fra1)
                                  ├─ /api/contact  → Turnstile verify → Resend (email) → (Phase 2: CRM webhook)
                                  ├─ /og/*         → dynamic OG images
                                  └─ static pages  → MDX + facts.json at build time
Analytics: Plausible (cookieless script)   Booking: Cal.com embed
```

## Repository layout
- `apps/web` — Next.js app. `src/app/[locale]/(site)/…` routes; `src/i18n/` (routing,
  request config, messages loader); `src/components/`; `src/lib/content` (MDX + frontmatter
  loader, zod-validated); `src/lib/seo` (metadata helpers, JSON-LD builders).
- `packages/ui` — design tokens as CSS variables (`tokens.css`) and shared shadcn/ui components.
- `content/{cs,en}` — MDX pages and `case-studies/`; `content/facts.json`.
- `messages/{cs,en}.json` — UI strings (next-intl).
- `scripts/` — Node tooling: `check-i18n.mjs`, `check-schema.mjs`, `check-links.mjs`,
  `generate-llms-txt.mjs`, `indexnow.mjs`, `hooks/`.
- `docs/`, `specs/`, `.claude/`, `.github/` — see `CLAUDE.md`.

## Key decisions (ADRs)
- 0001 — stack (proposed)
- 0002 — content/CMS approach (to be written in Sprint 0 after the spike)
- 0003 — i18n routing strategy (cs at root, `as-needed` prefix, `x-default` = cs)

## Quality architecture
Vitest (unit), Playwright + axe (e2e/a11y), Lighthouse CI budgets, parity/schema/link scripts,
release-please. Hooks in `.claude/settings.json` run formatting after edits and `check:quick`
before an agent turn ends.

## Environments
- Preview: every PR (Vercel). Production: `main`. Env vars documented in `RUNBOOK.md`.
