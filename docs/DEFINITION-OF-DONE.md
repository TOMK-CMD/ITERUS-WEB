# Definition of Done

A change is done when every line below is true. "Done" is verified by the reviewer subagent and
by Tomas on the preview, not by the author's opinion.

1. **Spec** — an approved spec (or Linear issue in spec format) exists; all acceptance criteria are
   met; nothing outside the spec was changed "while at it".
2. **Tests** — written before the implementation; unit + e2e + axe where UI is involved;
   `pnpm check` and `pnpm test:e2e` green locally; CI green on the PR.
3. **Locales** — cs and en both updated with equivalent meaning; `pnpm check:i18n` green;
   hreflang, canonical and `x-default` correct.
4. **Facts** — every number, name and claim comes from `content/facts.json`; anything missing is a
   visible `TODO(facts:key)` listed in the PR.
5. **Docs** — `ARCHITECTURE.md` for structural change, `RUNBOOK.md` for operational change, an ADR
   for a decision with alternatives, `CLAUDE.md` Commands table for new scripts. Skills updated when
   a workflow improved.
6. **Security & privacy** — no secrets, no personal data in fixtures/logs, inputs validated
   server-side, dependencies justified and pinned, cross-platform Node tooling only.
7. **Content rules** — answer-first, approved wording about the AI-native way of working, footer
   legal line, AI-transparency notice where relevant, no unverifiable claims.
8. **Evidence in the PR** — template filled, Vercel preview URL, desktop + mobile screenshots per
   locale, reviewer verdict addressed, open items for Tomas listed.
9. **Housekeeping** — Conventional Commits, branch named `feat/<issue>-slug` (or `fix/`, `docs/`),
   Linear issue moved to *In Review*.
