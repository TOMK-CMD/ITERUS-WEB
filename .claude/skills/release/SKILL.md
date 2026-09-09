---
name: release
description: Ship a change to production safely — pre-release checklist, merge, deployment verification on iterus.cz/iterus.io, post-release smoke tests, IndexNow ping, Linear and changelog housekeeping. Use whenever the user says release, deploy, "nasaď", "pusť to ven", "merge a nasazení", go-live, "spusť web", "hotfix", or asks whether a PR is safe to merge.
---

# release — from green PR to verified production

Production is Vercel (project + region in `docs/RUNBOOK.md`); `main` deploys automatically.
release-please maintains version + `CHANGELOG.md` from Conventional Commits.

## Pre-release checklist (all must be true)
- [ ] PR references its spec/Linear issue; reviewer subagent had no open *Blocking* items
- [ ] CI green: check, e2e, Lighthouse, schema, links
- [ ] Vercel preview opened in both locales on desktop and mobile; screenshots in PR
- [ ] i18n parity green; no `TODO(facts:*)` left in published content
- [ ] Legal/pricing/brand text unchanged, or explicitly approved by Tomas in the PR
- [ ] `docs/` updated where the DoD requires it

## Ship
1. Squash-merge via `gh pr merge --squash --delete-branch` (commit title = conventional).
2. Wait for the production deployment (Vercel MCP or `gh run watch`), note the deployment URL.
3. If release-please opened/updated its release PR, review the generated changelog entry for
   accuracy; merge it when it groups a meaningful set of changes (not necessarily every time).

## Verify (production, not preview)
- Smoke: `/`, `/en`, one service page, references, contact — HTTP 200, correct `<html lang>`,
  footer legal line, no console errors (Playwright MCP).
- `robots.txt`, `sitemap.xml`, `llms.txt` reachable and fresh.
- Contact form end-to-end with the test address from `docs/RUNBOOK.md`.
- Plausible receives the pageview.

## After
- `node scripts/indexnow.mjs` for changed URLs; resubmit sitemap in Search Console if the
  URL set changed (Tomas's account — tell him).
- Move Linear issue(s) to *Done* with the production URL in a comment.
- If anything is off: rollback = Vercel "promote" previous deployment (RUNBOOK § Rollback),
  then fix forward on a new branch. Never hot-edit production.

## Hotfix path
Same checklist, minimal scope, `fix:` commit, PR titled `hotfix: …`, Tomas pinged before merge
unless he pre-approved in the issue.
