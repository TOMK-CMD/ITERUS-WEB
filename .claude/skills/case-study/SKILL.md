---
name: case-study
description: Turn a project brief into a published case study (cs + en MDX, numbers from content/facts.json, JSON-LD, OG image, listing card). Use whenever the user mentions a case study, reference, "reference", "případová studie", "portfolio", "napiš o projektu X", "přidej Iterus/Innea/STAMIQ/tender-radar na web", or wants to show proof of work — even when they just paste project notes.
---

# case-study — from brief to published reference

Case studies are the strongest trust element on the site, so they must be concrete, verifiable
and honest about the role of AI tools and human oversight. The infrastructure exists since
2026-09-16 (Innea, Innea Pro) — a new case study is content + one route file + a catalog entry.

## Step 1 — get a brief (ask if missing)

Collect this brief from Tomas (Czech is fine). Do not guess any field; leave `TODO(facts:key)`.

```
Projekt / název:
Typ: vlastní produkt | klientská zakázka | interní nástroj
Klient (jméno smí být veřejné? ano/ne):
Problém (2–3 věty):
Řešení (co jsme postavili, klíčové funkce):
Stack (konkrétní technologie a služby):
Čísla (testy, integrace, uživatelé, rychlost, úspora, termíny) — a která z nich SMÍ ven:
Role AI nástrojů a lidského dohledu (co dělal Claude Code/Codex, co člověk):
Výsledek / stav (v provozu od…, před launchem…):
Citace klienta (volitelné, ověřená):
Odkazy (web, repo, demo):
Obrázky (screenshoty, diagram):
```

Ask explicitly which numbers may be published. Tomas's standing rules (Innea brief, 2026-09-15):
operational counts (accounts, messages, appointments) stay unpublished while they are small or
partly test data; nothing about paying users unless he confirms a paying customer exists today;
no speed/savings claim without a measurement.

## Step 2 — facts first (`content/facts.json → projects.<key>`)

The project must be `publish: "case-study"` with `name`, `status_cs/en`, `hook_cs/en`
(`claims_source`, `claims_confirmed`). Add what the page will render:

- `metrics: [{ key, value (number), label_cs, label_en }]` + `metrics_source`,
  `metrics_measured` (ISO date), `metrics_confirmed: true` — the page renders these through
  `<ProjectMetrics project="<key>" />` and **nowhere else**; `facts.test.ts` refuses unconfirmed
  or unlabelled metrics. Record in `metrics_note` what was deliberately left out and why.
- `url` (public product URL, if Tomas wants it linked), `started`, `production_since`, `stack`.
- Products sharing one codebase keep the engineering numbers on **one** entry and the other page
  links to it (`shares_codebase_with`) — never duplicate a number.

## Step 3 — write the study (cs first, then en)

Files: `content/{cs,en}/references-<key>.mdx` — **flat slug** `references-<project key>`
(ADR-0004: nested folders would pass `check:i18n` and vanish from sitemap and llms.txt).
Frontmatter: `title` (≤ 51), `description` (120–155 — measure with node before and after),
`updated`, `published` (ISO, → `Article.datePublished`), `type: case-study`, `project: <key>`,
`status`. `content-pages.test.ts` validates the real files in `pnpm check`.

Structure (identical in both locales, headings as questions where natural):

1. **Summary** — answer-first, ≤ 60 words: what, for whom, status, "vlastní produkt Iterus".
2. **Jaký problém řeší? / What problem does it solve?**
3. **Co jsme postavili? / What did we build?** — 4–6 bullets, named technologies, written for a
   B2B buyer rather than an engineer (explain or drop terms like "embedding clustering",
   "fail-closed", "red–green"; keep the named products and standards). No digits in prose —
   `content-pages.test.ts` allows only years, the 116 123 helpline and the names of scales and
   standards (its `allowedDigits` list — extend it for a new standard name, never for a figure);
   a figure belongs in `metrics`. No judgement of competitors or the market that the brief does not state.
4. **Čísla / The numbers** — `<ProjectMetrics project="<key>" />` + one sentence on scope.
5. **Jak jsme pracovali? / How did we work?** — `<HowWeWork />` (approved wording, never
   paraphrased), then the concrete human/AI division from the brief, then
   an approved supplementary statement where one fits — `<HowWeWork statement="review-yield" />`
   (Innea) or `statement="human-lead"` (Legacy You); a new one is a `how_we_work.*_cs/en` pair
   plus an entry in `how-we-work.tsx`, never prose. The founder
   is "technický vedoucí projektu" / "the project's technical lead" — never state or deny
   "programátor" (the test guards both locales). Do not describe how the AI's rules were derived
   if that implies reviewing users' data; name the rules, not their source, unless Tomas signs
   the sentence off.
6. **Co dál? / What's next?** — links to the relevant service page(s) and `/contact`; the
   product URL as a Markdown link. An unlaunched product gets **no launch date or quarter**
   (Evidence Policy) — describe what gates the launch instead.

Own products are "what we built", never client work. A sensitive domain (health, finance) states
its boundary plainly ("není zdravotní služba").

## Step 4 — wire it up

- `apps/web/src/i18n/routing.ts` → `"/references/<key>": { cs: "/reference/<key>", en:
"/references/<key>" }`; `apps/web/src/lib/seo/paths.ts` → `"references-<key>":
"/references/<key>"`.
- `apps/web/src/lib/content/case-study-catalog.ts` → add `{ slug, href, project }` to
  `CASE_STUDY_PAGES` — this is what `<CaseStudyList />` on `/reference` and the `CollectionPage`
  JSON-LD list; nothing else needs editing there.
- Route: `apps/web/src/app/[locale]/references/<key>/page.tsx` — a short file that only calls
  `createCaseStudyPage({ slug, href, project })` (`src/lib/pages/case-study-page.tsx`); it emits
  the `Article` (+ `about: SoftwareApplication`) JSON-LD via `buildCaseStudyArticle`.
- OG image: automatic from the title (`buildMetadata` → `/og`); the route has no metric
  parameter.
- Tests: `scripts/check-schema.mjs` `PAGES` (both locales), `apps/web/e2e/smoke.spec.ts` cases
  and `a11y.spec.ts` paths (both locales). Unit tests are generic — `case-study-catalog.test.ts`,
  `content-pages.test.ts` and `facts.test.ts` pick the new page up automatically.
- Docs: `docs/ARCHITECTURE.md` (routes, content slugs), `docs/CONTENT-MAP.md` (tier table,
  assumptions), spec step.

## Step 5 — deliver

`pnpm check`, `pnpm build && pnpm check:schema && pnpm check:links`, `pnpm test:e2e`; `next start`
and read both locales once — no operational number, no "platící"/"paying", no "programátor".
Reviewer subagent with the brief's constraints listed as intentional choices; Gemini 3.1 Pro over
the cs MDX against the Evidence Policy. PR with preview + screenshots. List every `TODO(facts:*)`
in the PR description so Tomas can fill them before merge.

## Honesty rules

- Own products are presented as "what we built", not as client references.
- No client name without explicit permission recorded in the brief.
- If a number cannot be sourced, it is not published — and a sourced number is published once,
  from `facts.json`, through `<ProjectMetrics />`.
