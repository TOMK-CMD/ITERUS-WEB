# RUNBOOK — how the site is operated

> Fill every `TODO` as accounts are created. This is the only place where operational facts live.

## Domains & DNS

| Domain     | Role                       | Registrar                     | DNS                                  | Notes                                                                    |
| ---------- | -------------------------- | ----------------------------- | ------------------------------------ | ------------------------------------------------------------------------ |
| iterus.cz  | primary (cs, en under /en) | Active24 (expires 2027-09-08) | Active24 (`ns1-3.websupport.cz/.eu`) | canonical host (`NEXT_PUBLIC_SITE_URL`); live on Vercel since 2026-09-16 |
| iterus.io  | international alias        | Porkbun (already owned)       | Porkbun (parking)                    | open item (ADR-0003): recommended 301 → iterus.cz/en                     |
| iterus.com | backorder placed? TODO     | —                             | —                                    | expires 2026-09-09, status "pending transfer"                            |

Vercel domains for project `iterus-web` (Settings → Domains): `iterus.cz` = Production,
`www.iterus.cz` → 308 → `iterus.cz`, `iterus-web.vercel.app` stays a production alias (no
`noindex`; the canonical tag points every page at `iterus.cz`). Set the redirect in that order —
apex to "No Redirect" first, then `www` → apex — or Vercel refuses the save as a redirect loop.

DNS records at Active24 (admin.active24.cz → iterus.cz → DNS), as required by the Vercel domain
page on 2026-09-16 (Vercel's newer IP range; the legacy `76.76.21.21` / `cname.vercel-dns.com`
keep working):

| Type  | Name  | Value                                  |
| ----- | ----- | -------------------------------------- |
| A     | `@`   | `216.150.1.1`                          |
| CNAME | `www` | `5725df981be055d8.vercel-dns-016.com.` |

No `AAAA` for `@` or `www` (Vercel does not need one; the old hosting records were removed).
Everything else in the zone is mail (Migadu — MX, SPF/DMARC TXT, `key1-3._domainkey` CNAMEs,
`_autodiscover`/`_submissions`/`_imaps`/`_pop3s` SRV) plus Active24 legacy subdomains
(`admin`, `mail`, `webmail`, `smtp`, `pop3`, `imap`, wildcard `*`) — leave them alone. Active24's
"Rychlá nastavení DNS" page offers one-click presets (Active24 Web / Mail / Webadmin, …) that
**overwrite** A/AAAA/CNAME/MX records — never click "Nastavit" there; the "Aktivní" badge is only
a detection of matching records, not a background service.

Cloudflare is **not** in front of the site. If it ever is, keep the records DNS-only (grey cloud):
behind the Cloudflare proxy Vercel sees Cloudflare's edge IPs in `x-real-ip`/`x-forwarded-for`, so
the contact-form rate limit (5 requests / 10 min per IP) would lock out real visitors who share an
edge, and Vercel's own edge caching is bypassed.

## E-mail

- Provider: Migadu (its MX, DKIM CNAMEs and SRV records are in the Active24 zone as of
  2026-09-16). Mailboxes: hello@iterus.cz, TODO — confirm which exist.
- DNS (verified 2026-09-17): MX `aspmx1/aspmx2.migadu.com`, SPF `v=spf1 include:spf.migadu.com
-all`, DMARC `v=DMARC1; p=quarantine` (no `rua` reporting address — add one when someone will
  read the reports), DKIM via `key1-3._domainkey` CNAMEs.
- Transactional (contact form): Resend, verified domain iterus.cz — TODO. The form sends from
  `CONTACT_FROM_EMAIL` (default `Iterus web <noreply@iterus.cz>`) to `CONTACT_TO_EMAIL`.

## Hosting (Vercel)

- Team: "TOMK-CMD's projects" (`team_viOg0bRhbm2Grrd1eTcucU1B`, plan Pro), region `fra1`
  (`apps/web/vercel.json`).
- Project `iterus-web` (`prj_1LAtDroYuASQYTcPcS4q3bvYnQMK`): created through the Vercel MCP on
  2026-09-09 and linked to `TOMK-CMD/ITERUS-WEB` — the first branch push produced a preview
  deployment (GitHub check "Vercel"). Root directory `apps/web`, framework Next.js (auto), default
  install/build commands (pnpm workspace detected from the root lockfile), Node 22.
  **Fix applied 2026-09-17, pending restart to confirm:** the global Vercel MCP connection couldn't
  read this project (404/403 on project and deployment reads) — there is no such grant under
  Vercel → Settings → Integrations; that page lists Marketplace integrations, not the MCP
  connection. The fix is `vercel link --yes --project iterus-web --team
team_viOg0bRhbm2Grrd1eTcucU1B` (writes local `.vercel/`, gitignored) followed by `vercel mcp
--project --clients "Claude Code"`, which rewrites this repo's MCP entry in the local Claude Code
  config to the project-scoped endpoint `https://mcp.vercel.com/tomk-cmds-projects/iterus-web` — an
  MCP client restart is required before this takes effect. Re-run `vercel mcp --project` if the
  project MCP entry is ever lost (new machine, config reset).
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

- Node ≥ 22.18 (`.node-version`; `scripts/generate-llms-txt.mjs` relies on native TypeScript type
  stripping, unflagged since 22.18), pnpm 10 (`packageManager`, installed globally or via corepack).
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
