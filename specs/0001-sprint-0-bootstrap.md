# 0001 — Sprint 0: bootstrap the Iterus web repository

- Status: approved
- Linear: [CRE-33](https://linear.app/innea/issue/CRE-33/sprint-0-bootstrap)
- Owner: Tomas · Agent: Claude Code
- Skills to use: none yet (this sprint creates the ground the skills stand on)

## Cíl / Goal
A production-grade foundation in which every later task can be delivered autonomously with
proof: Next.js app in cs+en, design tokens, content pipeline, all quality gates green in CI,
first preview deployment on Vercel, docs and ADRs accurate.

## Kontext / Context
Read first: `CLAUDE.md`, `docs/*.md`, `docs/adr/0001-stack.md`, `.claude/settings.json`,
`.github/workflows/ci.yml`, `lighthouserc.json`, `content/facts.json`.
Tomas is not a full-time engineer: explain choices briefly, ask before deciding product matters.

## Plan-first rule
Before writing code: produce a numbered plan, list assumptions, and ask at most 5 questions.
Wait for approval. Then execute step by step, committing after each logical step.

## Steps
1. **Verify the toolchain**: Node 22 LTS, pnpm (set `"packageManager"` in root `package.json`),
   `git`, `gh` auth, `claude` MCP auth (`/mcp`). Report versions.
2. **Agent-ops refresh**: fetch current official docs for Claude Code (settings/permissions, hooks,
   skills, subagents, MCP on Windows, GitHub Action) and Codex (AGENTS.md, PR review). Fix any
   format drift in `.claude/settings.json`, `.mcp.json`, skills, subagent. Rewrite
   `docs/AGENT-OPS.md` (≤ 150 lines). Commit `docs(agent-ops): …`.
3. **Workspace**: `pnpm-workspace.yaml` (`apps/*`, `packages/*`), root `package.json` with scripts
   from the Commands table in `CLAUDE.md` (delegating to `apps/web` via `pnpm --filter`),
   Prettier + ESLint config, `.nvmrc`/`.node-version`, `.vscode/extensions.json`.
4. **App**: scaffold `apps/web` with the latest stable Next.js major (check `npm view next
   version`; if a newer major than assumed exists, note it in ADR-0001), TypeScript strict,
   App Router, Tailwind, `src/` dir, alias `@/`. Remove template boilerplate.
5. **i18n**: next-intl with `cs` (default, no prefix) and `en` (`/en`), `localePrefix:
   'as-needed'`, typed `pathnames` map, `messages/{cs,en}.json`, `<html lang>` per locale,
   `generateMetadata` helper producing canonical + `alternates.languages` + `x-default: cs`.
   Write ADR-0003 (i18n routing) — accepted.
6. **Design tokens + UI**: `packages/ui` with `tokens.css` (values from `docs/BRAND.md`,
   marked provisional), Tailwind theme wired to tokens, shadcn/ui initialised (button, card,
   input, textarea, sheet/nav), Inter loaded via `next/font`. Layout with header, locale switch,
   footer that renders `facts.json → brand.legal_line_*`.
7. **Content pipeline spike (timebox 1 day)**: compare Keystatic (git-based CMS UI) vs. plain
   MDX + zod frontmatter loader. Decide, implement the winner, write ADR-0002 (accepted).
   Provide `content/{cs,en}/home.mdx` placeholders with answer-first text using facts.json.
8. **Pages (placeholders only)**: `/` and `/en` home; `/kontakt` ↔ `/en/contact` with a form
   (Turnstile + Resend behind env vars, server-side validation, honeypot, rate limit) and a
   Cal.com embed placeholder. Legal pages as `status: draft` stubs (privacy, terms).
9. **SEO/GEO baseline**: `sitemap.ts`, `robots.ts` (AI bots allowed per `seo-geo` skill),
   `Organization`/`WebSite`/`ProfessionalService` JSON-LD in layout from facts.json,
   OG image route, `scripts/generate-llms-txt.mjs` → `public/llms.txt`, `scripts/indexnow.mjs`
   (no-op without key).
10. **Quality gates**: Vitest + Testing Library (content loader, metadata helper, form
    validation); Playwright config with `webServer`, smoke tests for both locales (200, lang,
    hreflang, footer legal line), `@axe-core/playwright` no serious violations;
    `scripts/check-i18n.mjs`, `scripts/check-schema.mjs` (parse JSON-LD from built HTML and
    validate required fields), `scripts/check-links.mjs`; `@lhci/cli` dev dependency;
    `check` / `check:quick` scripts. All cross-platform (Node only).
11. **Analytics**: Plausible script component gated by `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.
12. **Release tooling**: `release-please-config.json` + `.release-please-manifest.json`
    (node, `apps/web`), `CHANGELOG.md` initialised by the tool, not by hand.
13. **Vercel**: `vercel.json` with `regions: ["fra1"]`; document project settings (root dir
    `apps/web`) in `RUNBOOK.md`; ensure a preview deployment appears on the PR (Tomas creates
    the Vercel project if the MCP cannot).
14. **Docs**: update `ARCHITECTURE.md` to reality, `RUNBOOK.md` env table, `CLAUDE.md`
    Commands table, ADR-0001 → accepted with the verified versions. `.env.example` complete.
15. **PR**: `feat: bootstrap Iterus web (sprint 0)`, template filled, preview URL, screenshots
    (cs/en, desktop/mobile), reviewer subagent verdict addressed.

## Akceptační kritéria / Acceptance criteria
- [ ] `pnpm check`, `pnpm test:e2e`, `pnpm check:schema`, `pnpm check:links` green locally and in CI
- [ ] Lighthouse CI passes the budgets in `lighthouserc.json` for `/` and `/en`
- [ ] `/` renders Czech, `/en` English; hreflang + canonical + `x-default` correct; footer legal
      line present on every page; `<html lang>` correct
- [ ] Contact form validates server-side, rejects without Turnstile token, sends via Resend when
      env is set, degrades gracefully when not
- [ ] `sitemap.xml`, `robots.txt`, `llms.txt`, OG image route work on the preview
- [ ] No secrets in git; `.env.example` lists every variable used
- [ ] ADR-0001 accepted, ADR-0002 and ADR-0003 written and accepted; docs match reality
- [ ] Every script in `CLAUDE.md` Commands table exists and runs on native Windows
- [ ] Vercel preview URL in the PR; CI green

## Mimo rozsah / Out of scope
Final copy, case studies, services detail pages, pricing, blog, CRM, AI intake chat, German
locale, logo. (These are Sprint 1–3 and Phase 2.)

## Otázky před startem / Questions before starting
Ask Tomas only what blocks you (e.g. Vercel project exists? GitHub org name? domain live?).

## Poznámky / Notes
- Keep dependencies minimal and pinned; justify each in the PR.
- If the Windows environment blocks a tool (e.g. Playwright browsers), document the fix in
  `RUNBOOK.md` rather than working around it silently.
- Update the skills if reality differs from their assumed paths.
