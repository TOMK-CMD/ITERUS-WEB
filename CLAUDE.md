# Iterus — website & studio-ops repository

Iterus is the software-development brand of **SUN Professionals s.r.o.** (IČO 27159884, Prague).
This repo holds the public website (Czech default, English; German later), its content, the
project documentation and the automation around it. Treat the repo as public: a client, a
public-procurement evaluator or an LLM may read anything here.

## How we work — read before touching code

- **Source of truth = this repo.** Specs live in `specs/`, decisions in `docs/adr/`, operations in
  `docs/RUNBOOK.md`, architecture in `docs/ARCHITECTURE.md`. If it is not written down here, it is
  not decided.
- **Spec first.** Every non-trivial task starts from `specs/NNNN-*.md` or a Linear issue that uses
  the spec template. No spec → write one (copy `specs/_template.md`) and get it approved before
  coding. Trivial fixes (typos, one-line bugs) do not need a spec.
- **Plan mode** for anything touching more than ~3 files or involving an architectural choice.
  Present assumptions and open questions (max 5) before implementing.
- **TDD.** Add or adjust tests before the implementation. Keep commits small and atomic
  (Conventional Commits, English): `feat(web): …`, `fix(i18n): …`, `docs(adr): …`, `chore(ci): …`.
- **Definition of Done** is binding: @docs/DEFINITION-OF-DONE.md
- **Languages.** Talk to Tomas in Czech. Code, comments, commits, docs and PRs: English.
  Website content: `cs` + `en` with mandatory parity (a page that exists in one locale exists in
  the other, with equivalent meaning). Specs may be written in Czech.
- **Who you work with.** Tomas is the founder and product owner. He decides pricing, claims,
  legal wording, brand and scope. Propose defaults, explain trade-offs in two sentences, and ask
  before deciding any of those for him. For everything else, act.

## Environment

- Windows 11, native Claude Code (no WSL). PowerShell 7 is the host shell; hooks run in Git Bash.
  Everything must be cross-platform: tooling lives in `scripts/*.mjs` (Node), never bash-only
  one-liners inside `package.json`.
- Package manager: **pnpm** workspace (`apps/*`, `packages/*`). Node 22 LTS. Set `"packageManager"`
  in the root `package.json` so CI and local runs use the same pnpm version.
- Secrets never enter git. `.env*` is ignored; required variables are documented in
  `.env.example` and in `docs/RUNBOOK.md`.
- Local MCP servers that use `npx` need the `cmd /c` wrapper on native Windows (see `.mcp.json`).

## Stack (details and rationale: docs/adr/0001-stack.md)

Next.js App Router (latest stable major — verify with `npm view next version`), TypeScript strict,
Tailwind, shadcn/ui, next-intl, MDX content committed in `content/{cs,en}` (CMS decision:
ADR-0002), Vercel Pro (region `fra1`), Plausible (cookieless), Cloudflare Turnstile, Resend,
Cal.com. Quality: Vitest + Testing Library, Playwright (+ axe), Lighthouse CI, release-please.

## Repository map

```
apps/web/            Next.js app (src/app/[locale]/…)
packages/ui/         design tokens (CSS variables) + shared shadcn/ui components
content/cs, en/      MDX pages, case studies, FAQ; content/facts.json = single source of facts
docs/                ARCHITECTURE, RUNBOOK, BRAND, CONTENT-GUIDE, CONTENT-MAP, AGENT-OPS, adr/
specs/               one spec per feature; DoD applies to all
scripts/             cross-platform Node tooling (hooks, checks, generators)
.claude/             settings (permissions, hooks), skills, subagents
.github/             CI, issue/PR templates
```

## Commands (root)

| Command                                        | Purpose                                                               |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| `pnpm dev`                                     | local dev server                                                      |
| `pnpm build` / `pnpm start`                    | production build / serve                                              |
| `pnpm check`                                   | typecheck + lint + unit tests + i18n parity — must pass before any PR |
| `pnpm check:quick`                             | fast subset used by the Stop hook (typecheck + lint)                  |
| `pnpm test` / `pnpm test:e2e`                  | Vitest / Playwright (+ axe)                                           |
| `pnpm check:i18n`                              | message-key and content parity cs ↔ en                                |
| `pnpm check:schema`                            | validate JSON-LD on built pages                                       |
| `pnpm check:links`                             | broken-link check on built site                                       |
| `pnpm format` / `pnpm lint` / `pnpm typecheck` | formatting / ESLint / tsc                                             |

Sprint 0 creates these scripts; keep this table in sync when scripts change.

## Quality gates

- `pnpm check` green locally before opening a PR. CI adds e2e, Lighthouse (performance ≥ 0.90,
  accessibility ≥ 0.95, SEO ≥ 0.95, best-practices ≥ 0.90), schema and link checks.
- A Stop hook runs `check:quick` whenever you finish with uncommitted changes; if it fails, fix it
  before ending your turn (`docs/AGENT-OPS.md` explains the hooks).
- Before handing a PR to Tomas, ask the `reviewer` subagent for a review and address its
  blocking items. Include the Vercel preview URL and screenshots (desktop + mobile) in the PR.

## Content and brand rules (short version — full: docs/CONTENT-GUIDE.md, docs/BRAND.md)

- **Answer first.** The first ~60 words of every page and article answer the question the page
  exists for. Headings are questions where natural. Concrete numbers, named technologies and named
  entities beat adjectives.
- **Facts come from `content/facts.json`.** Never invent numbers, client names, certifications or
  dates. If a fact is missing, leave a visible `TODO(facts:key)` and tell Tomas.
- **How we describe our way of working (approved):** "AI-native studio", "vývoj akcelerovaný AI
  nástroji (Claude Code, Codex) s lidským dohledem, automatizovanými testy a specialisty na
  vyžádání". Never state that Tomas is a programmer, and never state or imply that he is not one.
- **Mandatory footer line** on every page: `Iterus je značka společnosti SUN Professionals s.r.o.,
IČO 27159884` / `Iterus is a brand of SUN Professionals s.r.o., Company ID 27159884`.
- **AI transparency.** Any chat or AI feature must tell the user it is an AI at the start of the
  interaction (EU AI Act, Art. 50). Not negotiable.
- No superlatives without evidence, no fake testimonials, no logos of companies we have not
  worked with, no claims about ISO 27001 beyond the wording in `content/facts.json`.

## Documentation rules (docs-as-code)

- Architecture change → update `docs/ARCHITECTURE.md`. Operational/config change (env, DNS,
  deploy, service) → `docs/RUNBOOK.md`. A decision with alternatives → new ADR in `docs/adr/`
  (copy `0000-template.md`, next number). New script → this file's Commands table.
- Do not create ad-hoc notes or scratch markdown outside `docs/` and `specs/`.
- `CHANGELOG.md` is generated by release-please from commit messages. Never edit it by hand.
- GDPR: never write client identifiers, contact data or personal data into memory files, notes,
  test fixtures or logs. Use synthetic data in tests.

## Skills and subagents — use them

Project skills in `.claude/skills/`: `web-page` (new route/page cs+en), `case-study` (from brief
to published MDX), `i18n` (locales, parity, translations), `seo-geo` (JSON-LD, sitemap,
llms.txt, answer-first checks), `release` (ship + verify). When a task matches a skill, follow it;
when you improve a workflow, update the skill so the improvement sticks.
Subagent `reviewer` (`.claude/agents/reviewer.md`) reviews PRs independently.

## MCP servers (`.mcp.json`)

Linear (issues, status), Vercel (projects, deployments, preview URLs), GitHub (PRs, reviews),
Playwright (browser checks, screenshots). First use: `/mcp` to authenticate Linear and Vercel;
GitHub needs `GITHUB_PAT` in the environment (`docs/RUNBOOK.md` → Access).
Linear workflow: pick issue → set _In Progress_ → branch `feat/<issue-id>-slug` → PR links the
issue → _In Review_ when the PR is ready for Tomas → he moves it to _Done_ after merge.

## Don'ts

- No new dependency without a one-line justification in the PR description.
- No changes to pricing, legal text, brand claims or the services list without explicit approval.
- No force-push, no branch deletion you did not create, no destructive git or filesystem commands.
- No `TODO` in code without a Linear issue link. No skipped or `.only` tests in commits.
- No hand-written translations of legal pages without Tomas's review.
