# ADR-0001: Web stack

- Status: accepted (versions verified and scaffolded in Sprint 0, 2026-09-09)
- Date: 2026-09-08, accepted 2026-09-09
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

### Versions as scaffolded (2026-09-09, all pinned exactly)

| Piece               | Version                                        | Notes                                                                                              |
| ------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Node / pnpm         | 22 (LTS) / 10.33.0                             | `packageManager` pinned; pnpm 12 exists on the registry — upgrade as a separate chore              |
| Next.js             | 16.3.4                                         | Turbopack default, `proxy.ts` instead of `middleware.ts`, `next lint` removed (ESLint flat config) |
| React               | 19.2.8                                         |                                                                                                    |
| TypeScript          | 5.9.3                                          | TypeScript 7.0 (native compiler) is on the registry; adopting it is its own ADR                    |
| Tailwind CSS        | 4.3.3                                          | CSS-first theme (`@theme`), tokens in `packages/ui`                                                |
| shadcn/ui CLI       | 4.21.0, preset "nova" on Base UI               | Base UI is the CLI default component library; Radix remains available per component                |
| next-intl           | 4.14.2                                         | `next/root-params` for static rendering on Next 16.3+                                              |
| next-mdx-remote     | 6.0.0 (+ gray-matter 4.0.3, zod 4.5.4)         | content loader (ADR-0002)                                                                          |
| Vitest / Playwright | 5.0.0 / 1.63.0 (+ @axe-core/playwright 4.13.0) |                                                                                                    |
| Lighthouse CI       | @lhci/cli 0.15.1                               | budgets in `lighthouserc.json`; CI builds with a localhost canonical for the audit                 |
| Prettier / ESLint   | 3.9.6 / 9.39.5 + eslint-config-next 16.3.4     |                                                                                                    |

## Consequences

- Easier: previews per PR, agent autonomy (content in git), single language (TypeScript).
- Harder: must keep Next.js upgrades disciplined (ADR when major changes); Vercel Pro is a fixed
  ~$20/month (Hobby is non-commercial); Base UI is younger than Radix — watch component gaps.
- Revisit: when the client portal starts (Phase 4) — consider a second app in the workspace;
  TypeScript 7 and pnpm 12 when their ecosystems settle.
