---
name: case-study
description: Turn a project brief into a published case study (cs + en MDX, numbers from content/facts.json, JSON-LD, OG image, listing card). Use whenever the user mentions a case study, reference, "reference", "případová studie", "portfolio", "napiš o projektu X", "přidej Iterus/Innea/STAMIQ/tender-radar na web", or wants to show proof of work — even when they just paste project notes.
---

# case-study — from brief to published reference

Case studies are the strongest trust element on the site, so they must be concrete, verifiable
and honest about the role of AI tools and human oversight.

## Step 1 — get a brief (ask if missing)
Collect this brief from Tomas (Czech is fine). Do not guess any field; leave `TODO(facts:key)`.

```
Projekt / název:
Typ: vlastní produkt | klientská zakázka | interní nástroj
Klient (jméno smí být veřejné? ano/ne):
Problém (2–3 věty):
Řešení (co jsme postavili, klíčové funkce):
Stack (konkrétní technologie a služby):
Čísla (testy, integrace, uživatelé, rychlost, úspora, termíny):
Role AI nástrojů a lidského dohledu (co dělal Claude Code/Codex, co člověk):
Výsledek / stav (v provozu od…, před launchem…):
Citace klienta (volitelné, ověřená):
Odkazy (web, repo, demo):
Obrázky (screenshoty, diagram):
```

## Step 2 — write the study (cs first, then en)
Structure (identical in both locales), file `content/{cs,en}/case-studies/<slug>.mdx`:
1. **Summary** (answer-first, ≤ 60 words: what, for whom, headline result).
2. **Problém / Challenge**
3. **Řešení / Solution** — architecture in 3–6 bullets, named technologies.
4. **Čísla / Results** — every number comes from `content/facts.json` (`projects.<slug>.*`);
   add the keys there if they are new and mark them for Tomas to confirm.
5. **Jak jsme pracovali / How we worked** — AI-native workflow, tests, review, human oversight.
   Use approved wording from `docs/CONTENT-GUIDE.md`; never state that Tomas is or is not a
   programmer.
6. **Co dál / What's next** (optional) and CTA.
Frontmatter: `title`, `description`, `client` (or `own-product`), `stack[]`, `metrics[]`,
`published`, `updated`, `cover`.

## Step 3 — wire it up
- Listing card in the references page (both locales), sorted by `published`.
- JSON-LD: `Article` (+ `about` → `SoftwareApplication` when it is a product) per
  `docs/CONTENT-GUIDE.md`.
- OG image: generate via the OG route using title + one metric.
- Tests: content loader unit test; e2e smoke for the new URL in both locales; axe.

## Step 4 — deliver
`pnpm check`, `pnpm test:e2e`, reviewer subagent, PR with preview + screenshots. List every
`TODO(facts:*)` in the PR description so Tomas can fill them before merge.

## Honesty rules
- Own products are presented as "what we built", not as client references.
- No client name without explicit permission recorded in the brief.
- If a number cannot be sourced, it is not published.
