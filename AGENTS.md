# AGENTS.md — instructions for Codex (and any non-Claude agent)

`CLAUDE.md` is the canonical operating manual for this repository. Read it first and follow it;
this file only summarises what you need most often.

## Non-negotiables
- Work from a spec (`specs/`, or a Linear issue in the spec format). No spec → write one, ask.
- Tests first, small Conventional Commits in English, `pnpm check` green before a PR.
- Definition of Done: `docs/DEFINITION-OF-DONE.md`. Update docs/ADRs as part of the change.
- Content parity cs ↔ en; facts only from `content/facts.json`; footer legal line on every page.
- Never claim Tomas is or is not a programmer. Approved wording in `docs/CONTENT-GUIDE.md`.
- No secrets in git, no personal data in fixtures/logs, cross-platform Node tooling only
  (native Windows environment).

## Commands
`pnpm check` · `pnpm check:quick` · `pnpm test` · `pnpm test:e2e` · `pnpm check:i18n` ·
`pnpm check:schema` · `pnpm check:links` · `pnpm build`

## When reviewing a PR (`@codex review`)
Prioritise: spec compliance → correctness/tests → security & privacy → i18n parity → docs updated →
performance/dependencies → content rules. Report as *Blocking / Should fix / Nit* with file:line.
