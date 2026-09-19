# ADR-0005: Analytics — Umami, not Plausible

- Status: accepted
- Date: 2026-09-19
- Deciders: Tomas

## Context

ADR-0001 scaffolded Plausible as the analytics provider during Sprint 0, but that line was never
weighed against alternatives or the recurring cost — it was a default, not a decision. At go-live
task 6, Tomas questioned paying for Plausible (~$9/month from 10k pageviews, 30-day trial) when he
already runs Umami self-hosted for other projects, for free.

## Options considered

1. **Plausible** (SaaS, EU-hosted) — zero setup once paid; recurring cost; a new third-party
   sub-processor (Plausible Insights OÜ) to disclose in `privacy.mdx`.
2. **Umami Cloud** — hosted, has a free tier at low volume; still a new third-party processor, and
   a second analytics account to operate alongside the self-hosted one already used elsewhere.
3. **Umami, self-hosted (chosen)** — reuses infrastructure Tomas already operates and pays for; no
   new recurring cost; no new third-party sub-processor, since the data stays on infrastructure he
   controls. Cons: he — not Vercel or this repo — owns that instance's uptime and backups.
4. No analytics for now — defers the decision but leaves go-live without any traffic visibility.

## Decision

Self-hosted Umami. Same env-gated, cookieless integration pattern as Plausible (a `<Script>` tag
rendered only when configured), just two env vars instead of one: `NEXT_PUBLIC_UMAMI_SCRIPT_URL`
(the instance's script URL) and `NEXT_PUBLIC_UMAMI_WEBSITE_ID` (the per-site id from that
instance's dashboard) — see `docs/RUNBOOK.md`.

## Consequences

- Easier: no new recurring cost; one analytics tool to operate across Tomas's projects instead of
  two; `privacy.mdx` (cs+en) drops the "Plausible Insights OÜ" sub-processor line, since analytics
  no longer leave infrastructure Tomas controls.
- Harder: the analytics instance's availability is now Tomas's operational responsibility, not a
  managed SaaS's; if that instance goes down, `iterus.cz` loses pageview data silently (the
  component fails open — missing env vars just mean no script, not a build or runtime error).
- Revisit: if that self-hosted instance is ever migrated to a third-party host Tomas does not
  control, re-check whether `privacy.mdx` needs a sub-processor line again.
