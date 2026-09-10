# Content map

What every launch page must answer, which phrases it targets in each locale, which FAQ it carries
and where it links. This file drives the `web-page`, `case-study` and `seo-geo` skills: no page is
written without a row here, and no row invents a fact — proof points reference
`content/facts.json` keys.

- Research date: **2026-09-09** (SERP sample + competitor teardown, see _Market baseline_ below).
- Spec: `specs/0002-sprint-1-content-and-go-live.md` · Linear: CRE-34.
- Locale rule: every row exists in cs **and** en with equivalent meaning (`pnpm check:i18n`).

## Market baseline (measured 2026-09-09, refresh before Sprint 2)

| Observation                                                                                                                                                                                                                                                                            | Consequence for us                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| "vývoj software na zakázku Praha" returns established team studios (MEMOS, Expert Dev, Pixelfield, SEVENOAKS, PROGRAMATORI.cz, Etyka Digital) — SERP sample, 2026-09-09                                                                                                                | We do not fight for the generic head term. The generic service page exists to convert, not to rank.                   |
| "AI agenti / AI na míru" is led by <https://apertia.ai/ai-na-miru> (read 2026-09-09): price and delivery time in the opening paragraph, three price bands (180–350k / 350–900k / 0.9–4M CZK), a data-security section (on-prem, anonymisation, audit log, EU AI Act), a 5-step process | Same structural bar. We differentiate on transparency and on offering a smaller first step, not on undercutting them. |
| The "kolik stojí…" cluster is answered by MEMOS, SolutionBox, LE ARTIST, ANFILOV, Progity and dostaljakub.cz. Anchors as published by them (SERP sample, 2026-09-09): MVP from 80k CZK, production app with payments and roles from 180k, enterprise from 400k                         | A pricing page is table stakes. Silence reads as "expensive" and wastes lead-qualification time.                      |
| Nobody in the Czech SERP addresses ARES / datové schránky / NEN / registr smluv integration as a named service                                                                                                                                                                         | Highest-intent, lowest-competition page we can own.                                                                   |
| English "AI-native agency" returns mostly directory listicles (DesignRush, Parallel) rather than studios — SERP sample, 2026-09-09                                                                                                                                                     | Our English edge is specificity and verifiable artefacts, not adjectives.                                             |

## Evidence policy (binding)

We have **no client references**. Every proof point on the site is one of:

1. our own products, explicitly labelled as ours — never as client work;
2. a measured number confirmed by Tomas and stored in `content/facts.json`;
3. a policy statement already approved in `facts.json` (code ownership, EU hosting, how we work).

A product that is not launched may still appear, provided the page states its status plainly
("ve vývoji" / "před spuštěním"), promises no availability date, and carries no unverified numbers.
Presenting unfinished or invented work as delivered client experience is misleading advertising under
§ 2976–2981 obč. zák. (nekalá soutěž); where a reader is a consumer, the blacklist of zákon
č. 634/1992 Sb. applies on top. Neither is a marketing judgement call. ⚠ Legal wording is Tomas's
decision — this note exists to stop an agent inventing proof, not to state legal advice.

### Two tiers on `/reference` (approved 2026-09-09)

`facts.json → projects[*].publish` decides which tier a project belongs to. A project cannot be
published without a public name, a status label and a one-line hook in both locales, and a hook that
states a measurement must name where the measurement came from (`claims_source`). All of that is
guarded by unit tests in `apps/web/src/lib/facts.test.ts`, mutation-checked on 2026-09-09.

| Tier                   | `publish`    | What it shows                                                                                                           | Projects                                                                        |
| ---------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Case study             | `case-study` | Full page: problem, architecture, confirmed numbers, screenshots                                                        | Innea, Innea Pro, Legacy You (`před spuštěním`)                                 |
| "Na čem dál pracujeme" | `card`       | One line with a status label and one concrete technical hook — technical specifics only, no outcome or business metrics | Koordinační kalendář, gaits, STAMIQ, NT8-Optimizer                              |
| Not published          | `false`      | —                                                                                                                       | Iterus Platform (Tomas decides), tender-radar, GEO-SEO (has no public name yet) |

The card tier exists to show the **breadth** we can work across. It carries a technical hook
rather than a benefit claim, because a hook ("25 Hz inertial capture", "95% Wilson interval",
"row-level isolation") is what makes breadth read as competence instead of as scattered hobbies.
Five cards is the cap: beyond that, a list where most entries say "ve vývoji" starts to read as
"nothing finished". GEO-SEO is approved for a card but has no public name, so it stays `false` until
Tomas names it — the guard would fail otherwise.

Every hook currently carries `claims_confirmed: false`: the technical specifics were read from each
project's own README on 2026-09-09, not re-verified by Tomas. Session C confirms them before go-live.

## Launch pages

`⚑` = not in the main navigation (linked from `/sluzby` and `/reference` only).

| Page (cs / en)                                                | Question the page answers                                              | Target phrases cs                                                                                                           | Target phrases en                                                                                                      | FAQ candidates                                                                                                                                              | Links to                                                  |
| ------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `/` · `/en`                                                   | Kdo je Iterus a co pro mě dokáže postavit?                             | AI-native softwarové studio; vývoj aplikací na míru Praha; softwarové studio Praha                                          | AI-native software studio; custom software development Prague; software studio Prague                                  | Kdo za Iterem stojí?; Jak rychle dokážete dodat?; Vlastním potom kód?                                                                                       | sluzby, cena, jak-pracujeme, reference, kontakt           |
| `/sluzby` · `/en/services`                                    | Co všechno Iterus dodává a na jakém stacku?                            | vývoj aplikací na míru; programování na zakázku; vývoj software na míru Praha; tvorba webových aplikací                     | custom software development; custom application development; software development services Prague                      | Děláte i mobilní aplikace?; Převezmete rozdělaný projekt po jiném dodavateli?; Co naopak neděláte?                                                          | všech 5 detailních služeb, cena, jak-pracujeme, reference |
| `/sluzby/webove-aplikace` · `/en/services/web-applications`   | Jak vzniká webová aplikace na míru v Next.js a co v ceně dostanu?      | vývoj webových aplikací na míru; webová aplikace Next.js; tvorba interního systému na míru; React aplikace na zakázku       | custom web application development; next.js development agency; react web app development; internal tools development  | Kolik trvá první použitelná verze?; Kde aplikace poběží a kolik stojí provoz?; Umíte navázat na existující databázi?; Co když budu chtít změnit zadání?     | cena, jak-pracujeme, reference, ai-integrace              |
| `/sluzby/ai-integrace` · `/en/services/ai-integration`        | Jak bezpečně napojit Claude nebo OpenAI na naše firemní data?          | AI integrace do firmy; vývoj AI na míru; integrace Claude API; AI agenti pro firmy; AI automatizace procesů                 | AI integration services; custom AI development; claude api integration; AI agents for business                         | Zůstanou naše data podle GDPR v EU?; Trénuje se model na našich datech?; Co když AI odpoví špatně — kdo za to ručí?; Musíme uživatelům říct, že mluví s AI? | lokalni-llm, ceske-integrace, cena, reference             |
| `/sluzby/lokalni-llm` · `/en/services/local-llm`              | Jak provozovat LLM na vlastním hardwaru, aby data neopustila firmu?    | lokální LLM pro firmy; on-premise AI řešení; nasazení open source LLM; AI bez odesílání dat; firemní AI a GDPR              | on-premise llm deployment; local llm for business; private llm hosting; gdpr compliant ai deployment                   | Jaký hardware na to potřebujeme?; Zvládne lokální model to co ChatGPT?; Kdo model aktualizuje a kdo ho hlídá?; Jde to i bez připojení k internetu?          | ai-integrace, jak-pracujeme, cena                         |
| `/sluzby/ceske-integrace` · `/en/services/czech-integrations` | Jak napojit software na ARES, datové schránky, NEN nebo registr smluv? | integrace ARES API; automatizace datových schránek; napojení na registr smluv; integrace NEN veřejné zakázky; Fakturoid API | czech e-government api integration; ares api integration; datove schranky automation; czech invoicing api integration  | Umíte číst data z ISVZ a NEN?; Zvládnete obousměrnou komunikaci s datovkou?; Co když stát změní formát API?; Jak řešíte výpadky státních rozhraní?          | ai-integrace, webove-aplikace, reference, cena            |
| ⚑ `/sluzby/ninjatrader` · `/en/services/ninjatrader`          | Kdo naprogramuje indikátor nebo strategii pro NinjaTrader 8 v C#?      | programování NinjaTrader 8; vývoj NinjaScript C#; indikátor na míru NinjaTrader; automatický obchodní systém na zakázku     | ninjatrader 8 custom programming; ninjascript developer; custom nt8 indicator development; nt8 strategy programming    | Máte reálné zkušenosti s NT8 API?; Umíte propojit NinjaScript s Pythonem?; Kdo vlastní kód strategie?; Otestujete strategii na historických datech?         | reference, cena                                           |
| `/cena` · `/en/pricing`                                       | Kolik u nás stojí vývoj a od čeho se cena odvíjí?                      | kolik stojí vývoj aplikace; cena vývoje software na míru; ceník vývoje aplikací; hodinová sazba programátora                | custom software development cost; software development pricing; web app development cost; ai integration pricing       | Kolik stojí nejmenší smysluplný projekt?; Fixní cena, nebo hodinově?; Co se stane s cenou při změně zadání?; Co všechno je v ceně?                          | sluzby, jak-pracujeme, kontakt                            |
| `/jak-pracujeme` · `/en/process`                              | Jak konkrétně probíhá spolupráce a kdo ručí za kvalitu?                | jak probíhá vývoj software; AI-native vývoj; automatizované testování aplikace; spolupráce s vývojářem na míru              | ai-native software development; software development process; automated testing and code review; how we build software | Kdo dělá code review, když pracujete AI-native?; Co když onemocníte — kdo projekt převezme?; Kdo vlastní zdrojový kód?; Kde leží naše data?                 | cena, o-nas, reference, sluzby                            |
| `/o-nas` · `/en/about`                                        | Kdo je za Iterem a proč mu svěřit projekt?                             | Iterus softwarové studio; SUN Professionals s.r.o.; kdo je za Iterem                                                        | about Iterus; Iterus software studio Prague; SUN Professionals                                                         | Jak velký tým to je?; Jak dlouho firma existuje?; Na co se specializujete a co neděláte?                                                                    | jak-pracujeme, reference, kontakt                         |
| `/reference` · `/en/references`                               | Co Iterus skutečně postavil a jak to vypadá zevnitř?                   | reference vývoj software; ukázky vývoje aplikací; případové studie AI integrace; portfolio softwarového studia              | software development portfolio; ai integration case studies; what we have built; software studio work                  | Proč tu nejsou loga klientů?; Můžeme vidět kód?; Je ten projekt hotový, nebo rozpracovaný?                                                                  | jednotlivé case studies, sluzby, jak-pracujeme            |
| `/kontakt` · `/en/contact`                                    | Jak se s vámi domluvit a co se stane po odeslání poptávky?             | poptávka vývoje software; kontakt softwarové studio Praha; nezávazná konzultace vývoj aplikace                              | contact software studio prague; request a software quote; book a development consultation                              | Co se stane po odeslání formuláře?; Je konzultace zdarma?; Podepíšete NDA?                                                                                  | cena, sluzby                                              |

FAQ blocks live on the pages above (`FAQPage` JSON-LD per `docs/CONTENT-GUIDE.md` schema map).
There is no standalone FAQ page in the first wave — a single page would compete with its own
service pages for the same questions.

## Content gaps we can own

Each gap names the page that carries it and the artefact that proves it. Nothing here ships until
the referenced `facts.json` key is filled and confirmed.

1. **Price transparency** — `/cena`. Competitors publish bands; so do we, plus a smaller first step
   (a 90–250k CZK validation pilot and a 25k CZK discovery that is deducted from the project). State the
   numbers instead of "individuální kalkulace". ⚠ Do **not** write that we are cheaper than a named
   competitor: our AI band starts at 180k CZK, the same anchor they publish.
2. **Czech e-government integration as a named service** — `/sluzby/ceske-integrace`. No competitor
   in the measured SERP names ARES, datové schránky, NEN or registr smluv. ⚠ This is the page where
   it is easiest to overclaim, so the rule is mechanical:

   **What we may offer** (all of it is in `facts.json → services`, all of it may be named on the
   page as something we build): ARES · datové schránky · registr smluv · NEN · Fakturoid ·
   GoPay/Comgate. Fakturoid and GoPay/Comgate are commercial services, not e-government — keep them
   in a separate sentence so the page does not present them as state systems.

   **What we may prove**, and nothing else:

   | Claim on the page                                                            | Proof that may be attached to it                             |
   | ---------------------------------------------------------------------------- | ------------------------------------------------------------ |
   | "napojujeme ARES"                                                            | the production integration in Innea (`/api/therapist/ares`)  |
   | "čteme data o veřejných zakázkách"                                           | our own internal tooling reading TED and ISVZ, named nowhere |
   | anything about datové schránky, NEN, registr smluv, Fakturoid, GoPay/Comgate | **none — say what we build, show nothing**                   |

   Three prohibitions, because each is a way the page could drift:
   - A proof from one row may **never** be moved to another row. The procurement tooling proves
     reading TED and ISVZ; it does not prove NEN or registr smluv, however related they sound.
   - TED and ISVZ are an **evidence source, not a service**. They are not in
     `facts.json → services` and must not be offered as one; TED is an EU register, not Czech e-gov.
   - No cadence claim ("denně" / "daily") anywhere, until one is recorded in `facts.json`.

3. **Numbers instead of client logos** — `/reference`. Studios have logos but NDAs stop them
   showing architecture; we have no logos and can show test counts, schema size and integrations.
4. **On-prem LLM without an enterprise price tag** — `/sluzby/lokalni-llm`. The competing on-prem
   offer starts near 0.9M CZK; describe a realistic small-hardware deployment instead.
5. **EU AI Act transparency shipped, not promised** — `/sluzby/ai-integrace`. Innea carries a
   transparency layer in production; that is a demonstrable artefact, not a compliance claim.
6. **A named continuity answer** — `/jak-pracujeme`. The obvious objection to a one-person studio
   is bus factor. Answer it in the open: 100% code and documentation handover on payment, standard
   stack, tests and CI so another team can take over.
7. **A stated "what we don't do" list** — `/sluzby`. `facts.json → not_offered` is a trust signal
   and a lead filter; competitors claim everything.

## Open items before pages are written

Resolved 2026-09-09: price bands (`facts.json → pricing`), the `/reference` project list and
status labels, the unnamed mention of the internal tender tool on `/sluzby/ceske-integrace`, and
NT8-Optimizer as proof on `/sluzby/ninjatrader`. What remains:

| Item                                                                                              | Blocks                             | Owner |
| ------------------------------------------------------------------------------------------------- | ---------------------------------- | ----- |
| `facts.json`: `email`, LinkedIn URLs (founder_name, dic, phone, adresa ✅)                        | `/o-nas`, `/kontakt`, JSON-LD      | Tomas |
| Confirm the provisional card name "Koordinační kalendář" (`name_provisional: true`)               | `/reference` cards                 | Tomas |
| Does `not_offered: "embedded/firmware"` still hold with a Garmin Connect IQ app on `/reference`?  | `/sluzby`, `/reference`            | Tomas |
| Whether Iterus Platform may be published, and with which numbers                                  | `/reference` (a fourth case study) | Tomas |
| Public name for `projects.geo-seo`, which stays unpublished until it has one                      | `/reference` cards                 | Tomas |
| Whether the hourly rate (2 000 CZK) may be published — the 2026-09-09 approval covered bands only | `/cena`                            | Tomas |
| Confirm the technical specifics in the card hooks (`claims_confirmed` is false for all)           | `/reference` cards                 | Tomas |
| Fold `/cena` and the removal of a standalone FAQ page into spec 0002 before it leaves `draft`     | spec acceptance criteria           | Tomas |

⚠ **Measured numbers are not confirmed numbers.** Migration files in the Innea repository are
numbered up to `_335` while only 72 files sit in the migrations directory; the difference is a
`migrations_archive_2026-06-16_pre_baseline` folder, so a naive `ls | wc -l` understates the history
fourfold. Neither reading may be published as-is. Every number in a case study is measured, written into
`facts.json`, and confirmed by Tomas before it reaches a page.

## Assumptions recorded (change here, not in a page)

- `/reference` keeps its Czech path (it is the phrase buyers search) but the page's first line
  states that these are our own products, not client work. English stays `/en/references`.
- The NinjaTrader page is published outside the main navigation: its audience and language differ
  from the rest of the site, and putting it in the menu would dilute the B2B positioning.
- Service detail pages are **five static entries in `pathnames`**, not a dynamic `[slug]` segment,
  with flat content slugs (`content/<locale>/services-web-applications.mdx`). Reason, verified in the
  code on 2026-09-09: `localizedPath` (`apps/web/src/lib/seo/paths.ts:20`), `localizedUrl` and
  `languageAlternates` (`src/lib/seo/metadata.ts`), `PAGE_ROUTES` (`paths.ts:9`) and
  `buildSitemapEntries` (`src/lib/seo/sitemap.ts:17`) all take an `AppPathname` and accept no params,
  so a dynamic segment would emit a literal `[slug]` into canonical, hreflang and the sitemap; and
  next-intl substitutes the same param into both locale templates, so a Czech slug paired with a
  different English slug needs a per-locale map on top. Worse, `listPages`
  (`src/lib/content/loader.ts:88`) and `scripts/generate-llms-txt.mjs` read only top-level MDX while
  `scripts/check-i18n.mjs` reads recursively — nested content would pass the parity check and vanish
  from the sitemap and llms.txt without any error. See `docs/adr/0004-service-page-routing.md`.
  The five remaining services from `facts.json → services` stay as sections on `/sluzby`.
- **The 2005 founding year is never stated on its own.** The company has traded since 2005 in
  shading technology; software under the Iterus brand is recent. `/o-nas` states both facts in one
  breath (`facts.json → organization.origin_note_cs/en`). Stating "on the market since 2005" on a
  software site would let the reader infer twenty years of software delivery. Used correctly the
  pair is an asset: the standard objection to a one-person studio is "what if they disappear", and
  a twenty-year-old limited company with a real registered address answers it better than copy.
- `/sluzby/ceske-integrace` may cite the internal tender tool **without naming it or linking it**
  ("vlastní interní nástroj, který čte TED a ISVZ") — no frequency claim, because none is recorded.
  `/sluzby/ninjatrader` may name NT8-Optimizer. Both approved by Tomas on 2026-09-09.
