# ADR-0001: Web stack

- Status: proposed (accept in Sprint 0 after verifying current versions)
- Date: 2026-09-08
- Deciders: Tomas

## Context

Czech-first, multilingual marketing site for an AI-native studio, built and maintained mostly by
Claude Code/Codex, low fixed cost, EU hosting, later growing into app features (AI intake, client
portal). Native Windows dev environment.

## Options considered

1. **Next.js App Router + MDX in repo (chosen)** — one stack for site and future app features;
   first-class Vercel previews; agents know it well. Cons: heavier than a pure static generator.
2. Astro — best for content-only sites, lighter output; cons: second stack once app features
   arrive (portal, chat), weaker fit for Vercel MCP-driven workflows.
3. No-code (Webflow/Framer) — fast visuals; cons: outside the repo, no CI, poor agent autonomy.

## Decision

Next.js (latest stable major, App Router) + TypeScript strict + Tailwind + shadcn/ui + next-intl;
content as MDX in `content/{locale}` with zod-validated frontmatter (CMS approach: ADR-0002);
Vercel Pro in `fra1`; Plausible (cookieless), Cloudflare Turnstile, Resend, Cal.com; Vitest,
Playwright + axe, Lighthouse CI; release-please; pnpm workspace.

## Consequences

- Easier: previews per PR, agent autonomy (content in git), single language (TypeScript).
- Harder: must keep Next.js upgrades disciplined (ADR when major changes); Vercel Pro is a fixed
  ~$20/month (Hobby is non-commercial).
- Revisit: when the client portal starts (Phase 4) — consider a second app in the workspace.
