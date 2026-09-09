# 0002 — Sprint 1: content map, core pages and go-live prerequisites

- Status: draft (Tomas approves before the first Sprint 1 session)
- Linear: [CRE-34](https://linear.app/innea/issue/CRE-34/sprint-1-content-map-core-pages-go-live-prerequisites)
- Owner: Tomas · Agent: Claude Code
- Skills to use: `web-page`, `case-study`, `seo-geo`, `i18n`, `release`

## Cíl / Goal

Z placeholderu ze Sprintu 0 udělat web, který jde spustit na iterus.cz: stránky služeb, o nás /
jak pracujeme, reference (vlastní produkty), FAQ — vše v cs + en, postavené na výzkumu klíčových
slov a obsahových mezer (`docs/CONTENT-MAP.md`), s produkčními službami (Turnstile, Resend,
Plausible) a doménami připravenými ke go-live.

## Kontext / Context

Sprint 0 (PR #2, main `45083e3`) dodal celý základ: routing cs/en, MDX pipeline s `web-page`
skillem, kontaktní formulář, SEO/GEO baseline, testy a CI. `docs/CONTENT-MAP.md` je placeholder;
`content/facts.json` má TODO (adresa, DIČ, zakladatel, e-mail, telefon, LinkedIn) a čísla
projektů označená „confirm before publishing". Legal stránky jsou drafty. Vercel projekt
`iterus-web` deployuje; MCP integrace k němu zatím nemá přístup.

## Kroky / Steps (rozdělené do session podobné náročnosti)

### Session A — výzkum a obsahová mapa (Opus 5 · effort `high`)

1. Brief od Tomase (30 min jeho času): cílové segmenty (kdo objednává software na zakázku v ČR),
   priorita služeb z `facts.json → services`, 3 konkurenti / vzory, geografie (Praha / ČR / EU).
2. Rešerše klíčových slov a otázek cs/en: WebSearch + delegace samonosných dotazů na Gemini 3.1 Pro
   (ne citlivá data). Výstup: pro každou launch stránku otázka, fráze cs/en, FAQ kandidáti,
   interní odkazy → `docs/CONTENT-MAP.md` (tabulka existuje).
3. GEO kontrola: entity, na které se web odkazuje (`sameAs`), a co chybí v `facts.json` → seznam
   pro Tomase (adresa, DIČ, LinkedIn URL, čísla projektů k potvrzení).
4. Spec 0002 → `approved` (Tomas), Linear issue → In Progress.
   _Přepnutí v průběhu: po schválení mapy je zbytek session mechanický (tabulky, seznamy) →_
   _`/model sonnet` + `/effort medium`._

### Session B — stránky služeb, o nás, proces (Sonnet 5 · effort `high`)

5. `/sluzby` ↔ `/en/services` (přehled + `Service` JSON-LD + FAQ blok) a detailní stránky pro
   3–4 prioritní služby (`/sluzby/<slug>` ↔ `/en/services/<slug>`, dynamický segment v
   `pathnames`). Vzor: `contact/page.tsx`, loader, `buildMetadata`, `PAGE_ROUTES`.
6. `/o-nas` ↔ `/en/about` (`AboutPage` + `Person` zakladatel — jméno z `facts.json`, schválené
   znění „jak pracujeme") a `/jak-pracujeme` ↔ `/en/process` (`HowTo` JSON-LD).
7. Navigace (header + footer), sitemap/llms se aktualizují samy; `check:i18n/schema/links`, e2e
   matice rozšířená o nové stránky, Lighthouse.
   _Eskalace: pokud se objeví nový architektonický vzor (např. FAQ komponenta s JSON-LD generátorem_
   _sdíleným napříč stránkami), navrhnout `/model opus` na tu část._

### Session C — reference a copy (Opus 5 · effort `high`)

8. Case studies přes `case-study` skill pro vlastní produkty (Iterus Platform, Innea, tender-radar,
   NT8-Optimizer podle briefů) — každá jen po Tomasově briefu a potvrzení čísel; listing
   `/reference` ↔ `/en/references` (`CollectionPage`).
9. Průchod celého obsahu proti `docs/CONTENT-GUIDE.md` (answer-first, terminologie, typografie —
   zvážit remark plugin pro nezlomitelné mezery po jednopísmenných předložkách).
10. Legal stránky: Tomas + právník doplní `TODO(legal:*)` a `TODO(facts:*)` → `status: published`.

### Session D — go-live (Sonnet 5 · effort `medium`, skill `release`)

11. Tomas: DNS iterus.cz → Vercel (Cloudflare jen grey cloud — viz RUNBOOK), Turnstile + Resend +
    Plausible účty a env proměnné ve Vercelu, rozhodnutí iterus.io (ADR-0003), Search Console /
    Bing / Seznam, LinkedIn a Firmy.cz s identickými údaji (`facts.json`).
12. Agent: produkční smoke podle `release` skillu, IndexNow, deployment protection preview, release
    PR (verze), CRE issue → Done.

### Tech-debt dávka (Sonnet 5 · effort `medium`, kdykoli mezi sessions)

13. OG font jako asset místo runtime fetchu; `shadcn` jako runtime závislost pro jeden CSS import;
    rozhodnutí o trvalém rate limitu (Upstash); CI na release PR (PAT vs. ruční re-run); e2e pro
    `/api/contact` s Cloudflare test klíči v CI.

## Akceptační kritéria / Acceptance criteria

- [ ] `docs/CONTENT-MAP.md` vyplněný pro všechny launch stránky (otázka, fráze cs/en, FAQ, odkazy)
- [ ] Každá nová stránka prošla checklistem `web-page` skillu; cs ↔ en parita; JSON-LD dle
      schema mapy; `check:i18n`, `check:schema`, `check:links`, e2e + axe, Lighthouse ≥ prahy
- [ ] Žádný `TODO(facts:*)` na publikované stránce; čísla v case studies potvrzená Tomasem
- [ ] Legal stránky `published` po schválení Tomase (a právníka)
- [ ] Produkční smoke na iterus.cz (nebo rozhodnutí odložit DNS) podle `release` skillu

## Mimo rozsah / Out of scope

Blog, CRM, AI intake chat, německá verze, logo/finální vizuál (BRAND tokeny zůstávají
provizorní), klientský portál. (Fáze 2–3.)

## Otázky před startem / Questions before starting

1. Které 3–4 služby mají dostat vlastní stránku v první vlně?
2. Které produkty smí být zveřejněny jako reference (Iterus Platform, Innea, STAMIQ, tender-radar,
   NT8-Optimizer) a s jakými čísly?
3. Jméno zakladatele, adresa sídla, DIČ, LinkedIn URL — doplnit do `facts.json` před Session B.
4. Spustit na iterus.cz hned po Session C, nebo až po logu/vizuálu?

## Poznámky / Notes

- Doporučení modelu a effortu vychází ze zásady „podle nejtěžšího kroku, který session dělá
  sama" (`CLAUDE.md` → Session planning). Fable 5.1 se ve Sprintu 1 nepředpokládá — vyhradit pro
  Fázi 2 (AI intake s EU AI Act povinnostmi, auth/portál) a adversariální review bezpečnostních
  diffů.
- Review každé PR: reviewer subagent (dědí model session) + Gemini 3.1 Pro nad výřezy ≤ 24 kB
  se seznamem záměrných změn, tokem a definicemi helperů (recept ověřený ve Sprintu 0).
