# 0002 — Sprint 1: content map, core pages and go-live prerequisites

- Status: **approved** by Tomas 2026-09-10 (scope is binding; open inputs are tracked as questions below)
- Linear: [CRE-34](https://linear.app/innea/issue/CRE-34/sprint-1-content-map-core-pages-go-live-prerequisites)
- Owner: Tomas · Agent: Claude Code
- Skills to use: `web-page`, `case-study`, `seo-geo`, `i18n`, `release`

## Cíl / Goal

Z placeholderu ze Sprintu 0 udělat web, který jde spustit na iterus.cz: stránky služeb, o nás /
jak pracujeme, ceny, reference (vlastní produkty) — vše v cs + en, s FAQ bloky na stránkách,
kterých se otázky týkají, postavené na výzkumu klíčových
slov a obsahových mezer (`docs/CONTENT-MAP.md`), s produkčními službami (Turnstile, Resend,
Plausible) a doménami připravenými ke go-live.

## Kontext / Context

Sprint 0 (PR #2, main `45083e3`) dodal celý základ: routing cs/en, MDX pipeline s `web-page`
skillem, kontaktní formulář, SEO/GEO baseline, testy a CI. `docs/CONTENT-MAP.md` je placeholder;
`content/facts.json` má TODO (adresa, DIČ, zakladatel, e-mail, telefon, LinkedIn) a čísla
projektů označená „confirm before publishing". Legal stránky jsou drafty. Vercel projekt
`iterus-web` deployuje; MCP integrace k němu zatím nemá přístup.

## Kroky / Steps (rozdělené do session podobné náročnosti)

### Session A — výzkum a obsahová mapa (Opus 5 · effort `high`) — ✅ HOTOVO 2026-09-09, PR #5 (`b907a26`)

1. Brief od Tomase (30 min jeho času): cílové segmenty (kdo objednává software na zakázku v ČR),
   priorita služeb z `facts.json → services`, 3 konkurenti / vzory, geografie (Praha / ČR / EU).
2. Rešerše klíčových slov a otázek cs/en: WebSearch + delegace samonosných dotazů na Gemini 3.1 Pro
   (ne citlivá data). Výstup: pro každou launch stránku otázka, fráze cs/en, FAQ kandidáti,
   interní odkazy → `docs/CONTENT-MAP.md` (tabulka existuje).
3. GEO kontrola: entity, na které se web odkazuje (`sameAs`), a co chybí v `facts.json` → seznam
   pro Tomase (adresa, DIČ, LinkedIn URL, čísla projektů k potvrzení).
4. ✅ Spec 0002 → `approved` (Tomas, 2026-09-10), Linear issue → In Progress.

**Co Session A skutečně dodala** (`docs/CONTENT-MAP.md`, `content/facts.json`, `docs/adr/0004-*`):
obsahovou mapu pro 12 launch stránek, schválená cenová pásma, dvoustupňové `/reference`
a závaznou „Evidence policy" — plus guardy v `apps/web/src/lib/facts.test.ts`, ověřené 14 mutacemi.
Review: 4 kola (reviewer subagent + 3× Gemini 3.1 Pro), 21 nálezů, 19 pravých.

**Rozhodnutí Tomase z 2026-09-09** (zodpovídají otázky 1 a 2 ze závěru specu; otevřené zůstávají 3–6):

1. Vlastní stránku dostanou **webové aplikace, AI integrace, lokální/on-prem LLM a české
   integrace**; pátá stránka **NinjaTrader** existuje, ale mimo hlavní menu (jiné publikum,
   převážně anglicky mluvící). Zbylých pět služeb zůstává jako sekce na `/sluzby`.
2. Zveřejnit lze **Innea a Innea Pro** (v provozu) a **Legacy You** (před spuštěním) jako case
   studies; **Koordinační kalendář, gaits, STAMIQ a NT8-Optimizer** jako jednořádkové karty.
   **Iterus Platform, tender-radar a GEO-SEO se nezveřejňují** (u GEO-SEO chybí veřejný název).
3. `organization.software_since` = **2025**; firma existuje od 2005, ale ve stínicí technice —
   oba roky se na webu uvádějí vždy spolu, nikdy 2005 samostatně. (Nad rámec otázek ze specu.)
4. Ceny **jdou ven jako pásma**: pilot 90–250 tis., produkční 250–700 tis., AI od 180 tis.
   (on-prem od 350 tis.) Kč bez DPH; konzultace 60 min zdarma, discovery 25 tis. odečitatelné.
   Hodinová sazba (2 000 Kč) zatím **schválena není** — rozhodnout před psaním `/cena`.

**Proč není samostatná FAQ stránka.** Otázky žijí jako `FAQPage` bloky na stránkách, které je
zodpovídají. Samostatná `/faq` by soutěžila o tytéž dotazy se stránkami služeb a u GEO je
citovanější odstavec na tematické stránce než položka v obecném seznamu. Průřezové otázky
(vlastnictví kódu, kontinuita, NDA, kde leží data) nesou `/jak-pracujeme`, `/cena` a `/kontakt`.
Revidovat, až se otázky začnou opakovat napříč stránkami — pak `/faq` jako rozcestník s odkazy,
ne s vlastními odpověďmi.

### Session B — stránky služeb, o nás, proces (Sonnet 5 · effort `high`)

5. `/sluzby` ↔ `/en/services` (přehled + `Service` JSON-LD + FAQ blok) a **pět** detailních
   stránek: `webove-aplikace`, `ai-integrace`, `lokalni-llm`, `ceske-integrace` a `ninjatrader`
   (poslední mimo hlavní menu). ⚠ **Statické záznamy v `pathnames`, NE dynamický segment** — viz
   `docs/adr/0004-service-page-routing.md`: SEO helpery berou `AppPathname` bez parametrů, takže
   dynamická routa by poslala literál `[slug]` do canonical, hreflang i sitemapy, a vnořené MDX by
   prošlo `check:i18n` a zmizelo ze sitemapy i `llms.txt`. Obsah proto plochý
   (`content/<locale>/services-web-applications.mdx`). Vzor: `contact/page.tsx`, loader,
   `buildMetadata`, `PAGE_ROUTES`. Dvojice cest jsou dané, nevymýšlet je:

   | interní pathname               | cs                        | en                             |
   | ------------------------------ | ------------------------- | ------------------------------ |
   | `/services`                    | `/sluzby`                 | `/services`                    |
   | `/services/web-applications`   | `/sluzby/webove-aplikace` | `/services/web-applications`   |
   | `/services/ai-integration`     | `/sluzby/ai-integrace`    | `/services/ai-integration`     |
   | `/services/local-llm`          | `/sluzby/lokalni-llm`     | `/services/local-llm`          |
   | `/services/czech-integrations` | `/sluzby/ceske-integrace` | `/services/czech-integrations` |
   | `/services/ninjatrader`        | `/sluzby/ninjatrader`     | `/services/ninjatrader`        |

6. `/cena` ↔ `/en/pricing` (`Service` + `offers`/`AggregateOffer`, FAQ blok) — čte pásma
   z `facts.json → pricing`; hodinovou sazbu neuvádět, dokud ji Tomas neschválí
   (`reference_rate_internal_only: true`).
7. `/o-nas` ↔ `/en/about` (`AboutPage` + `Person` zakladatel) a `/jak-pracujeme` ↔ `/en/process`
   (`HowTo` JSON-LD). **Dělba mezi nimi, ať se obsah nezdvojí:** `/o-nas` odpovídá „kdo jsme"
   — původ značky (`facts.json → organization.origin_note_cs/en`, oba roky vždy spolu), zakladatel
   a JEDNA věta o způsobu práce (`how_we_work.approved_cs/en`) s odkazem dál. `/jak-pracujeme`
   odpovídá „jak to probíhá" — kroky spolupráce, kdo dělá review, vlastnictví kódu, kontinuita,
   kde leží data. Schválené znění o AI-native práci se cituje doslova na obou, ale rozvíjí se
   jen na `/jak-pracujeme`.
   ⚠ **Vstupní podmínka:** `/o-nas` a `Person` JSON-LD potřebují `facts.json → organization`
   `founder_name` (+ `registered_address`, `dic` pro `Organization`), které jsou zatím `TODO`
   — viz otevřená otázka 3. Bez nich se `/o-nas` nepíše a jméno se **nevymýšlí**; ostatní stránky
   Session B na tom nezávisí a dají se dodělat dřív.
8. Navigace (header + footer), sitemap/llms se aktualizují samy; `check:i18n/schema/links`, e2e
   matice rozšířená o nové stránky, Lighthouse.
   _Eskalace: pokud se objeví nový architektonický vzor (např. FAQ komponenta s JSON-LD generátorem_
   _sdíleným napříč stránkami), navrhnout `/model opus` na tu část._

### Session C — reference a copy (Opus 5 · effort `high`)

9. Case studies přes `case-study` skill pro **Innea, Innea Pro a Legacy You** (poslední se
   štítkem „před spuštěním") — každá jen po Tomasově briefu a potvrzení čísel. Karty „na čem dál
   pracujeme" pro Koordinační kalendář, gaits, STAMIQ a NT8-Optimizer: jedna věta, štítek stavu,
   technický háček, žádná čísla. **Iterus Platform, tender-radar a GEO-SEO se nezveřejňují**
   (rozhodnutí 2026-09-09). Listing `/reference` ↔ `/en/references` (`CollectionPage`);
   tier každého projektu určuje `facts.json → projects[*].publish` a hlídá ho unit test.
10. Průchod celého obsahu proti `docs/CONTENT-GUIDE.md` (answer-first, terminologie, typografie —
    zvážit remark plugin pro nezlomitelné mezery po jednopísmenných předložkách).
11. Legal stránky: Tomas + právník doplní `TODO(legal:*)` a `TODO(facts:*)` → `status: published`.

### Session D — go-live (Sonnet 5 · effort `medium`, skill `release`)

12. Tomas: DNS iterus.cz → Vercel (Cloudflare jen grey cloud — viz RUNBOOK), Turnstile + Resend +
    Plausible účty a env proměnné ve Vercelu, rozhodnutí iterus.io (ADR-0003), Search Console /
    Bing / Seznam, LinkedIn a Firmy.cz s identickými údaji (`facts.json`).
13. Agent: produkční smoke podle `release` skillu, IndexNow, deployment protection preview, release
    PR (verze), CRE issue → Done.

### Tech-debt dávka (Sonnet 5 · effort `medium`, kdykoli mezi sessions)

14. **`check:i18n` čte `content/` rekurzivně, ale `listPages` a `generate-llms-txt.mjs` jen
    nejvyšší úroveň** — vnořený obsah by prošel paritou a tiše zmizel ze sitemapy a `llms.txt`.
    ADR-0004 to zatím obchází plochými slugy; past ale zůstává a patří zavřít.
15. **`pnpm check` neobsahuje `format:check`** — formátovací drift ve `facts.json` prošel dvěma
    commity nezpozorován a srovnalo ho až CI. Přidat do `check` (jedna řádka).
16. OG font jako asset místo runtime fetchu; `shadcn` jako runtime závislost pro jeden CSS import;
    rozhodnutí o trvalém rate limitu (Upstash); CI na release PR (PAT vs. ruční re-run); e2e pro
    `/api/contact` s Cloudflare test klíči v CI.

## Akceptační kritéria / Acceptance criteria

- [x] `docs/CONTENT-MAP.md` vyplněný pro všechny launch stránky (otázka, fráze cs/en, FAQ, odkazy)
- [x] Cenová pásma a publikační příznaky projektů ve `facts.json`, hlídané unit testy
- [ ] `/cena` uvádí jen pásma z `facts.json → pricing`; žádné číslo mimo tento zdroj
- [ ] Každá nová stránka prošla checklistem `web-page` skillu; cs ↔ en parita; JSON-LD dle
      schema mapy; `check:i18n`, `check:schema`, `check:links`, e2e + axe, Lighthouse nad prahy
      z `CLAUDE.md` → Quality gates (performance ≥ 0,90 · accessibility ≥ 0,95 · SEO ≥ 0,95 ·
      best-practices ≥ 0,90)
- [ ] Žádný `TODO(facts:*)` na publikované stránce; čísla v case studies potvrzená Tomasem
- [ ] Legal stránky `published` po schválení Tomase (a právníka)
- [ ] Produkční smoke na iterus.cz (nebo rozhodnutí odložit DNS) podle `release` skillu

## Mimo rozsah / Out of scope

Blog, CRM, AI intake chat, německá verze, logo/finální vizuál (BRAND tokeny zůstávají
provizorní), klientský portál. (Fáze 2–3.)

## Otázky před startem / Questions before starting

1. ~~Které 3–4 služby mají dostat vlastní stránku v první vlně?~~ — **zodpovězeno 2026-09-09**,
   viz Session A.
2. ~~Které produkty smí být zveřejněny jako reference a s jakými čísly?~~ — **zodpovězeno
   2026-09-09**, viz Session A. Čísla samotná zatím potvrzená nejsou
   (`claims_confirmed: false` u všech).
3. **Otevřené:** jméno zakladatele, adresa sídla, DIČ, LinkedIn URL — doplnit do `facts.json`
   před Session B (`/o-nas`, `/kontakt`, JSON-LD `Organization`/`Person`).
4. **Otevřené:** spustit na iterus.cz hned po Session C, nebo až po logu/vizuálu?
5. **Otevřené (přibylo):** smí na web hodinová sazba 2 000 Kč? Schválení z 2026-09-09 pokrývalo
   jen pásma, ale `/cena` cílí i na frázi „hodinová sazba programátora".
6. **Otevřené (přibylo):** platí `not_offered: "embedded/firmware"`, když je na `/reference`
   aplikace pro Garmin Connect IQ? A veřejný název pro GEO-SEO + potvrzení názvu
   „Koordinační kalendář".

## Poznámky / Notes

- Doporučení modelu a effortu vychází ze zásady „podle nejtěžšího kroku, který session dělá
  sama" (`CLAUDE.md` → Session planning). Fable 5.1 se ve Sprintu 1 nepředpokládá — vyhradit pro
  Fázi 2 (AI intake s EU AI Act povinnostmi, auth/portál) a adversariální review bezpečnostních
  diffů.
- Review každé PR: reviewer subagent (dědí model session) + Gemini 3.1 Pro nad výřezy ≤ 24 kB
  se seznamem záměrných změn, tokem a definicemi helperů (recept ověřený ve Sprintu 0).
