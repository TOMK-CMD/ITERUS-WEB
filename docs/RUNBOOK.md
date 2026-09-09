# RUNBOOK — how the site is operated

> Fill every `TODO` as accounts are created. This is the only place where operational facts live.

## Domains & DNS

| Domain     | Role                       | Registrar            | DNS                  | Notes                                                |
| ---------- | -------------------------- | -------------------- | -------------------- | ---------------------------------------------------- |
| iterus.cz  | primary (cs, en under /en) | TODO                 | Cloudflare (planned) | canonical host (`NEXT_PUBLIC_SITE_URL`)              |
| iterus.io  | international alias        | TODO (already owned) | Cloudflare (planned) | open item (ADR-0003): recommended 301 → iterus.cz/en |
| iterus.com | backorder placed? TODO     | —                    | —                    | expires 2026-09-09, status "pending transfer"        |

## E-mail

- Provider: TODO (Migadu planned). Mailboxes: hello@iterus.cz, TODO.
- DNS: SPF, DKIM, DMARC (`p=quarantine` after 2 weeks of monitoring) — TODO once created.
- Transactional (contact form): Resend, verified domain iterus.cz — TODO. The form sends from
  `CONTACT_FROM_EMAIL` (default `Iterus web <noreply@iterus.cz>`) to `CONTACT_TO_EMAIL`.

## Hosting (Vercel)

- Team: "TOMK-CMD's projects" (`team_viOg0bRhbm2Grrd1eTcucU1B`, plan Pro), region `fra1`
  (`apps/web/vercel.json`).
- Project `iterus-web`: created through the Vercel MCP on 2026-09-09, but the Git link to
  `TOMK-CMD/ITERUS-WEB` could not be verified and the project is not listed by the API (the name
  is reserved: a second create returns 409). **Tomas:** open the Vercel dashboard → if
  `iterus-web` exists, connect the repository in Settings → Git; otherwise import the repository
  as a new project. Either way: root directory `apps/web`, framework Next.js (auto), default
  install/build commands (pnpm workspace detected from the root lockfile), Node 22. Make sure
  the Vercel GitHub App has access to the repository.
- Git integration: every branch → preview; `main` → production. Preview protection: Vercel
  default (team members only). PR screenshots are therefore taken locally against `next start`;
  agents verify previews through the Vercel MCP.
- Environment variables: the table below, set per environment in the project settings.

## Environment variables (names only — values live in Vercel / local `apps/web/.env.local`)

| Name                             | Where   | Purpose                                                                                             |
| -------------------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | all     | canonical origin (default `https://iterus.cz`) — canonical, hreflang, sitemap, robots, llms.txt, OG |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`   | all     | analytics domain; unset → no script                                                                 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | all     | Turnstile widget; unset → form shows "not enabled"                                                  |
| `TURNSTILE_SECRET_KEY`           | server  | Turnstile siteverify                                                                                |
| `RESEND_API_KEY`                 | server  | outbound mail                                                                                       |
| `CONTACT_TO_EMAIL`               | server  | recipient of form submissions                                                                       |
| `CONTACT_FROM_EMAIL`             | server  | sender (verified domain); default `Iterus web <noreply@iterus.cz>`                                  |
| `NEXT_PUBLIC_CALCOM_LINK`        | all     | Cal.com booking URL; unset → no booking CTA                                                         |
| `INDEXNOW_KEY`                   | scripts | `scripts/indexnow.mjs`; the key file must be served at `/<key>.txt`                                 |

Without `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY` or `CONTACT_TO_EMAIL` the API answers 503
`not_configured` and the page tells visitors the form is not enabled — never a silent success.
Cloudflare test keys for local/e2e runs: site `1x00000000000000000000AA`, secret
`1x0000000000000000000000000000000AA`.

`.env.example` at the repository root mirrors this table. Claude Code's permission rules protect
every `.env*` file (read and write, including `.env.example`), so **Tomas creates or updates that
file** from this table when variables change; agents keep the table current.

## Local development (native Windows, PowerShell)

- Node 22 (`.node-version`), pnpm 10 (`packageManager`, installed globally or via corepack).
- `pnpm install` at the root, then `pnpm dev` (http://localhost:3000). Local secrets go to
  `apps/web/.env.local`.
- Full gate before a PR: `pnpm check` (typecheck, lint, unit, i18n parity), `pnpm build`,
  `pnpm test:e2e` (Playwright starts `next start` on :3200; first time run
  `pnpm --filter web exec playwright install chromium`), `pnpm check:schema`, `pnpm check:links`.
- Lighthouse locally, the way CI runs it (canonical must match the served host):
  `$env:NEXT_PUBLIC_SITE_URL="http://localhost:3000"; pnpm build; pnpm exec lhci autorun --config=lighthouserc.json`
  (then `pnpm build` again without the variable).
- Everything is Node-based; hooks run under Git Bash. No bash-only one-liners in `package.json`.

## Deploy, release & rollback

- Deploy: squash-merge to `main` (the PR title becomes the Conventional Commit). Watch: Vercel
  dashboard / MCP.
- Releases: release-please (manifest mode, root `release-please-config.json`) opens a release PR
  that bumps `package.json` + `apps/web/package.json` and writes `CHANGELOG.md`. Its PR is opened
  with `GITHUB_TOKEN`, so **CI does not run on it automatically** — re-run checks manually or
  close/reopen the PR before merging; a PAT-based token would trigger CI (decide when needed).
- Rollback: Vercel → Deployments → previous production deployment → **Promote to Production**.
  Then fix forward on a branch. Never edit production by hand.
- After a release with changed URLs: `node scripts/indexnow.mjs <urls>` (needs `INDEXNOW_KEY`),
  resubmit the sitemap in Search Console (Tomas).

## Monitoring

- Uptime: TODO (Uptime Kuma self-host planned, or Vercel checks).
- Errors: Vercel runtime logs (`[contact] …` warnings mark form failures); consider Sentry (free
  tier) in Phase 2.
- Analytics: Plausible dashboard — TODO URL.

## Search & entity accounts (owner: Tomas)

Google Search Console, Bing Webmaster (IndexNow key), Seznam (Firmy.cz), Google Business Profile,
LinkedIn company page, GitHub (`TOMK-CMD` profile — no org, decided 2026-09-09), Wikidata item,
Clutch — status: TODO each.

## Access

| System                            | Owner | Access for agents                                                                 |
| --------------------------------- | ----- | --------------------------------------------------------------------------------- |
| GitHub repo `TOMK-CMD/ITERUS-WEB` | Tomas | Claude Code via `gh` + GitHub MCP (`GITHUB_PAT`, see below); Codex via GitHub app |
| Vercel                            | Tomas | Vercel MCP (read/deploy)                                                          |
| Linear                            | Tomas | Linear MCP                                                                        |
| Cloudflare / Resend / Plausible   | Tomas | none (env vars only)                                                              |

GitHub MCP (`.mcp.json` → `github`) cannot use OAuth: GitHub's auth server does not support the
dynamic client registration Claude Code relies on, so the server authenticates with a personal
access token sent as `Authorization: Bearer ${GITHUB_PAT:-}`. Setup, once per machine:

1. github.com → Settings → Developer settings → Fine-grained tokens → repository access:
   `ITERUS-WEB` only; permissions: Contents, Issues, Pull requests (read & write), Actions and
   Metadata (read); expiry 90 days (GitHub e-mails before it lapses — regenerate, `setx` again).
2. PowerShell: `setx GITHUB_PAT "<token>"` (user-level variable — never in the repo or `.env`).
   Every process in your session can read it, including `npx` MCP servers and npm postinstall
   scripts — hence the narrow scope. Revoke it when the machine is handed over or wiped.
3. Restart the terminal and Claude Code; `/mcp` then shows `github` as connected.

Without the variable the header is empty and only the `github` server fails, with
`HTTP 400 … Authorization header is badly formatted` — that is the "variable not set" symptom,
not a configuration bug.

## Test data

- Contact form: unit and e2e tests use synthetic names/addresses (`example.com`) and Cloudflare's
  always-pass Turnstile test keys. Never use real client data in tests.

## Incidents

1. Confirm scope (production? which locale?). 2. Rollback if user-facing. 3. Open a Linear issue
   `incident:` with timeline. 4. Fix forward with tests. 5. Add a RUNBOOK note if a runbook gap caused it.
