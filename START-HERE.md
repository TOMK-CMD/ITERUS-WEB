# Iterus – startovací sada (Sprint 0)

Tahle sada je „operační manuál" pro Claude Code (a Codex) v novém repozitáři webu **iterus.cz / iterus.io**.
Nakopíruj obsah do prázdného repa, commitni a Claude Code od toho převezme Sprint 0.

## Co je uvnitř

| Soubor / složka | K čemu |
|---|---|
| `CLAUDE.md` | Pravidla pro Claude Code: jak pracujeme, stack, příkazy, dokumentace, zákazy. Importuje `docs/DEFINITION-OF-DONE.md`. |
| `AGENTS.md` | Totéž ve zkratce pro Codex (ukazuje na `CLAUDE.md`). |
| `.claude/settings.json` | Oprávnění (co smí Claude spouštět bez ptaní, co nikdy) a hooky (formátování po editaci, kontrola před ukončením). |
| `.claude/skills/*` | Pět projektových skills: `web-page`, `case-study`, `i18n`, `seo-geo`, `release`. Spouští se samy podle popisu. |
| `.claude/agents/reviewer.md` | Nezávislý reviewer (subagent), který každé PR zkontroluje před tebou. |
| `.mcp.json` | MCP servery: Linear, Vercel, GitHub, Playwright. Přihlášení přes `/mcp` (GitHub přes env `GITHUB_PAT`). |
| `.github/workflows/ci.yml` | CI brány: typecheck, lint, testy, parita CZ/EN, build, Playwright e2e, Lighthouse, schema.org, odkazy. |
| `.github/ISSUE_TEMPLATE/spec.md`, `PULL_REQUEST_TEMPLATE.md` | Šablona zadání a šablona PR (checklist DoD). |
| `docs/` | Architektura, RUNBOOK (provoz), BRAND, CONTENT-GUIDE (pravidla obsahu a GEO), AGENT-OPS, ADR. |
| `specs/_template.md` | Šablona specifikace. |
| `specs/0001-sprint-0-bootstrap.md` | **První úkol pro Claude Code** – kompletní Sprint 0. |
| `content/facts.json` | Jediný zdroj pravdy pro fakta a čísla (doplníš ty). |
| `scripts/hooks/*.mjs` | Skripty hooků (multiplatformní, Node). |
| `lighthouserc.json` | Prahy kvality pro Lighthouse CI. |

## Jak to použít (5 kroků)

1. Založ prázdný repozitář (GitHub `TOMK-CMD/ITERUS-WEB`), naklonuj ho do `C:\Dev\projects\ITERUS-WEB`.
2. Nakopíruj do něj **celý obsah** této složky včetně skrytých souborů (`.claude`, `.github`, `.mcp.json`, `.gitignore`, `.gitattributes`, `.editorconfig`).
3. `git add -A && git commit -m "chore: bootstrap agent operating manual" && git push`.
4. V repu spusť `claude`. Při prvním použití MCP dej `/mcp` a přihlas Linear a Vercel; GitHub MCP potřebuje proměnnou `GITHUB_PAT` (viz `docs/RUNBOOK.md` → Access).
5. Vlož tento první prompt:

```
Přečti si CLAUDE.md, složku docs/ a specs/0001-sprint-0-bootstrap.md.
Pracuj podle specifikace 0001. Nejdřív připrav plán, vypiš své předpoklady a max. 5 otázek,
na které potřebuješ odpověď, a čekej na můj souhlas. Až odsouhlasím, proveď Sprint 0 krok
po kroku, po každém logickém kroku commituj (Conventional Commits) a na konci otevři PR
podle šablony.
```

## Pojistky, které jsou zapnuté

- **Oprávnění**: `pnpm`, `git` (bez force-push), `gh`, `node` běží bez ptaní; mazání, force-push a čtení `.env*` je zakázané.
- **Hook po editaci**: automaticky zformátuje upravený soubor (Prettier), jakmile projekt existuje.
- **Hook před ukončením**: pokud máš necommitnuté změny a `pnpm run check:quick` selže, Claude musí chybu opravit, než skončí. Vypnout lze proměnnou `ITERUS_SKIP_STOP_CHECK=1` nebo smazáním hooku v `.claude/settings.json`.

## Co doplníš jen ty

- `content/facts.json` – IČO, sídlo, DIČ, kontakty, čísla k projektům (hledej `TODO`).
- `docs/BRAND.md` – vybraný vizuální směr po Claude Design (do té doby platí návrh).
- `docs/RUNBOOK.md` – registrátor domén, Vercel projekt, e-mail (hledej `TODO`).

## Co přijde dál

Postup ti dávám v chatu krok po kroku. Před psaním obsahu (Sprint 1–2) proběhne průzkum klíčových slov
a obsahových mezer pro CZ/EN; jeho výstup (mapa obsahu + FAQ) se uloží do `docs/CONTENT-MAP.md`
a stane se vstupem pro skills `web-page` a `case-study`.
