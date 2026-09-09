# Agent operations — Claude Code and Codex in this repository

> Verified against the official docs on 2026-09-09 (links at the end). Keep this file under
> 150 lines; link to the docs instead of copying them. Update it in the same PR as any change to
> `.claude/`, `.mcp.json`, `AGENTS.md` or the hooks.

## What is configured

| Piece              | Where                                                            | What it does here                                                                                                                                                                                                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rules              | `CLAUDE.md` (imports `@docs/DEFINITION-OF-DONE.md`), `AGENTS.md` | Operating manual for Claude Code; Codex reads `AGENTS.md`, which points to `CLAUDE.md`. Next.js generates `apps/web/AGENTS.md` + `apps/web/CLAUDE.md` (pointer to the Next 16 docs in `node_modules`) and re-adds them on `next dev` — keep them committed.                                                                                       |
| Permissions        | `.claude/settings.json` → `permissions`                          | Allow: `pnpm`, `npx`, `node`, non-destructive `git`, `gh pr/issue/run`, `Read(**)`, `Edit(**)`. Deny: force-push (incl. `--force-with-lease`), `git reset --hard`, `git clean`, `rm -rf`, `Remove-Item`, reading `.env*`.                                                                                                                         |
| Personal overrides | `.claude/settings.local.json` (gitignored)                       | `enabledMcpjsonServers`, "don't ask again" approvals.                                                                                                                                                                                                                                                                                             |
| Hooks              | `.claude/settings.json` → `hooks`                                | `PostToolUse` (`Edit\|Write`) → `scripts/hooks/post-edit.mjs` formats the file with Prettier (no-op until `node_modules` exists). `Stop` → `scripts/hooks/on-stop.mjs` runs `pnpm run check:quick` when the tree has uncommitted changes; exit code 2 returns the failure to Claude, which keeps working. `ITERUS_SKIP_STOP_CHECK=1` disables it. |
| Skills             | `.claude/skills/<name>/SKILL.md`                                 | `web-page`, `case-study`, `i18n`, `seo-geo`, `release`. Auto-invoked from the `description`; also `/name`.                                                                                                                                                                                                                                        |
| Subagent           | `.claude/agents/reviewer.md`                                     | Independent PR reviewer (`tools: Read, Grep, Glob, Bash`, `model: inherit`). Mandatory before a PR reaches Tomas.                                                                                                                                                                                                                                 |
| MCP                | `.mcp.json`                                                      | `linear`, `vercel` (HTTP, OAuth via `/mcp`), `github` (HTTP, `Authorization: Bearer ${GITHUB_PAT:-}` — GitHub's server rejects Claude Code's OAuth registration; setup in `docs/RUNBOOK.md` → Access), `playwright` (stdio, `cmd /c npx` wrapper for native Windows).                                                                             |

### Permission rule syntax (current)

- Bash: `Bash(pnpm *)` — the text before `*` is matched as written; a trailing ` *` also matches
  the bare command. The older `:*` suffix is equivalent but only recognised at the end.
- Files: `Read(path)` / `Edit(path)` with gitignore patterns; `./path` = relative to the project,
  `//path` = absolute (`//c/...` on Windows), `~/path` = home. Rules for `Write`, `Glob`,
  `MultiEdit` are accepted but never consulted — `Edit(...)` covers every editing tool.
- Evaluation order is deny → ask → allow; a deny in any scope wins.

### Hook contract

- `PostToolUse` receives JSON on stdin (`tool_name`, `tool_input.file_path`, `tool_result`);
  exit 2 only shows stderr to Claude (the tool already ran).
- `Stop` receives `stop_hook_active` (true when Claude is already continuing because of a stop
  hook — the script exits 0 then to avoid loops) and `last_assistant_message`; exit 2 blocks the
  stop. `timeout` is in seconds.

## Daily workflow (Linear → branch → PR)

1. Pick the issue in Linear (MCP), set _In Progress_, branch `feat/<issue-id>-slug`.
2. Spec first (`specs/`); plan mode for anything touching more than ~3 files.
3. Tests first, then implementation; `pnpm check` green; small Conventional Commits in English.
4. Ask the `reviewer` subagent, fix Blocking items, open the PR from the template with the
   Vercel preview URL and screenshots; move the issue to _In Review_.
5. Tomas merges (squash only — the PR title becomes the commit); release-please keeps the version
   and `CHANGELOG.md`.

## Headless and automation

- CI or n8n can run Claude Code non-interactively: `claude -p "<prompt or /skill>"
--output-format json` (or `stream-json`), with `--allowedTools`, `--max-turns` and `--model`
  as needed. Example: `claude -p "/seo-geo check the services page" --output-format json`.
- GitHub Action: `anthropics/claude-code-action@v1` responds to `@claude` in issues/PRs or runs
  a `prompt` on any event. Not installed yet; when wanted, run `/install-github-app` (needs the
  Claude GitHub App and an `ANTHROPIC_API_KEY` or `CLAUDE_CODE_OAUTH_TOKEN` secret).
- Codex reads the `AGENTS.md` chain (repo root → nested directories, 32 KiB budget,
  `AGENTS.override.md` wins). PR review: enable _Code review_ for the repo in Codex settings,
  then comment `@codex review`; it applies a `## Code Review Rules` section from `AGENTS.md`
  and reports only P0/P1 findings.

## Adding a skill or a subagent

- Skill: `.claude/skills/<name>/SKILL.md` with `name` and a `description` that lists the
  trigger phrases (Czech and English); keep it under ~1,500 characters. Supporting files live in
  the same folder. Optional frontmatter: `disable-model-invocation`, `allowed-tools`, `paths`.
- Subagent: `.claude/agents/<name>.md` with `name`, `description`, `tools` (comma-separated),
  `model` (`inherit`, `sonnet`, `opus`, `haiku`, `fable`).
- Update this file and `CLAUDE.md` in the same PR.

## Windows notes

- Native Windows 11, PowerShell 7 host, hooks run under Git Bash → all tooling is Node
  (`scripts/*.mjs`), never bash-only one-liners in `package.json`.
- MCP stdio servers started with `npx` need the `cmd /c` wrapper.
- Permission paths are normalised to POSIX before matching (`C:\Dev\x` → `/c/Dev/x`).
- Playwright browsers: `pnpm exec playwright install chromium`; document any Windows fix in
  `docs/RUNBOOK.md` instead of working around it silently.

## Working agreements

- One task = one branch = one PR. Plan mode for anything non-trivial.
- Prefer skills over ad-hoc procedures; if you did something twice, make it a skill or a script.
- The reviewer subagent is not optional before a PR reaches Tomas.
- Facts only from `content/facts.json`; no personal data in fixtures, logs or memory files.

## References

- Claude Code: settings — https://code.claude.com/docs/en/settings · permissions —
  https://code.claude.com/docs/en/permissions · hooks — https://code.claude.com/docs/en/hooks ·
  skills — https://code.claude.com/docs/en/skills · subagents —
  https://code.claude.com/docs/en/sub-agents · MCP — https://code.claude.com/docs/en/mcp ·
  GitHub Actions — https://code.claude.com/docs/en/github-actions
- Codex: AGENTS.md — https://learn.chatgpt.com/docs/agent-configuration/agents-md · GitHub
  code review — https://learn.chatgpt.com/docs/third-party/github
