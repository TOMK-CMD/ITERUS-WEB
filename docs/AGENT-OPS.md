# Agent operations (Claude Code, Codex) in this repo

> Sprint 0 rewrites this file from the current official docs. Until then, this is the intended
> setup; treat exact option names as "verify in docs".

## What is configured
- `CLAUDE.md` (+ `@docs/DEFINITION-OF-DONE.md` import) — rules. `AGENTS.md` — Codex pointer.
- `.claude/settings.json` — permissions allow/deny, hooks:
  - `PostToolUse` (Edit|Write|MultiEdit) → `scripts/hooks/post-edit.mjs` formats the file
    (no-op until `node_modules` exists).
  - `Stop` → `scripts/hooks/on-stop.mjs` runs `pnpm run check:quick` when there are uncommitted
    changes; exit code 2 returns the failure to Claude, which keeps working. `stop_hook_active`
    prevents loops; `ITERUS_SKIP_STOP_CHECK=1` disables it.
- `.claude/skills/*` — project skills (auto-triggered by description).
- `.claude/agents/reviewer.md` — independent review subagent.
- `.mcp.json` — Linear, Vercel, GitHub (remote HTTP, OAuth via `/mcp`), Playwright (local, `cmd /c`
  wrapper for native Windows).

## Sprint 0 task for the agent (see specs/0001)
1. Fetch the current Claude Code docs (settings, hooks, skills, subagents, MCP, GitHub Action) and
   the Codex docs (AGENTS.md, cloud tasks, PR review). Confirm the formats used here; fix drift.
2. Rewrite this file: what each mechanism does here, how to run headless (`claude -p`) for CI
   or n8n later, how to add a skill, how Tomas triggers work from Linear/GitHub, Windows notes.
3. Keep it under ~150 lines; link to official docs instead of copying them.

## Working agreements
- One task = one branch = one PR. Plan mode for anything non-trivial.
- Prefer skills over ad-hoc procedures; if you did something twice, make it a skill or a script.
- The reviewer subagent is not optional before a PR reaches Tomas.
