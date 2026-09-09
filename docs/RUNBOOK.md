# RUNBOOK — how the site is operated

> Fill every `TODO` as accounts are created. This is the only place where operational facts live.

## Domains & DNS
| Domain | Role | Registrar | DNS | Notes |
|---|---|---|---|---|
| iterus.cz | primary (cs, en under /en) | TODO | Cloudflare (planned) | canonical host |
| iterus.io | international alias | TODO (already owned) | Cloudflare (planned) | 301 → iterus.cz (or /en) — decide in ADR-0003 |
| iterus.com | backorder placed? TODO | — | — | expires 2026-09-09, status "pending transfer" |

## E-mail
- Provider: TODO (Migadu planned). Mailboxes: hello@iterus.cz, TODO.
- DNS: SPF, DKIM, DMARC (`p=quarantine` after 2 weeks of monitoring) — TODO once created.
- Transactional (forms, notifications): Resend, verified domain iterus.cz — TODO.

## Hosting (Vercel)
- Project: TODO (name), team: TODO, plan: Pro (commercial use requires Pro), region: `fra1`.
- Root directory: `apps/web`. Framework: Next.js. Build: `pnpm build`.
- Git integration: PR → preview; `main` → production. Protection: preview deployments are
  password-protected? TODO (decide).

## Environment variables (names only — values live in Vercel / local `.env`)
| Name | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | all | canonical base URL |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | all | analytics domain |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | all | contact-form anti-spam |
| `RESEND_API_KEY` | server | outbound mail |
| `CONTACT_TO_EMAIL` | server | recipient for form submissions |
| `INDEXNOW_KEY` | server/scripts | search engine pings |
| `CAL_COM_LINK` | all | booking embed |

## Deploy & rollback
- Deploy: merge to `main`. Watch: Vercel dashboard / MCP.
- Rollback: Vercel → Deployments → previous production deployment → **Promote to Production**.
  Then fix forward on a branch. Never edit production by hand.

## Monitoring
- Uptime: TODO (Uptime Kuma self-host planned, or Vercel checks).
- Errors: Vercel runtime logs; consider Sentry (free tier) in Phase 2.
- Analytics: Plausible dashboard — TODO URL.

## Search & entity accounts (owner: Tomas)
Google Search Console, Bing Webmaster (IndexNow key), Seznam (Firmy.cz), Google Business Profile,
LinkedIn company page, GitHub (`TOMK-CMD` profile — no org, decided 2026-09-09), Wikidata item,
Clutch — status: TODO each.

## Access
| System | Owner | Access for agents |
|---|---|---|
| GitHub repo `TOMK-CMD/ITERUS-WEB` | Tomas | Claude Code via `gh` + GitHub MCP (`GITHUB_PAT`, see below); Codex via GitHub app |
| Vercel | Tomas | Vercel MCP (read/deploy) |
| Linear | Tomas | Linear MCP |
| Cloudflare / Resend / Plausible | Tomas | none (env vars only) |

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
- Contact form test address: TODO. Never use real client data in tests.

## Incidents
1. Confirm scope (production? which locale?). 2. Rollback if user-facing. 3. Open a Linear issue
`incident:` with timeline. 4. Fix forward with tests. 5. Add a RUNBOOK note if a runbook gap caused it.
