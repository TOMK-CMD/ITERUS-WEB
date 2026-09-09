# Content guide — writing for people, search engines and LLMs

Applies to every page, case study, FAQ and post. Czech is the primary audience; English is a
full-quality equivalent, not a translation afterthought.

## Why these rules (evidence, Sept 2026)

- Citations by LLM answer engines cluster in the first third of a page (≈44 % of ChatGPT
  citations came from the first 30 % of content in a 18k-citation study) and correlate with
  entity density (named tools, companies, numbers). → **answer-first, concrete, named.**
- A consistent brand entity across LinkedIn, company registries, GitHub and directories is what
  lets an LLM say "Iterus" instead of "a Prague studio". → **entity consistency.**
- `llms.txt` is cheap but low-impact; schema.org and clean HTML matter more. → **do both, invest
  in the second.**

## Answer-first structure (every page)

1. First paragraph ≤ 60 words: the direct answer to the question the page exists for.
2. Then proof: one number, one named technology, one example.
3. Then detail, then FAQ (2–5 Q&A on service pages), then CTA.
   Headings phrased as questions where natural ("Co dodáváme?", "Jak probíhá spolupráce?").

## Facts and claims

- Every number, name, certification and date comes from `content/facts.json`. No source → no claim.
- Own products are "what we built", never "client references".
- Never write that Tomas is a programmer; never write that he is not. Approved wording:
  `facts.json → how_we_work.approved_cs/en`. Allowed labels: _AI-native studio_,
  _vývoj akcelerovaný AI nástroji s lidským dohledem_, _senior review a specialisté na vyžádání_.
- ISO 27001: only the wording in `facts.json → trust.iso_27001_status_*`.
- Superlatives ("nejlepší", "nejrychlejší") only with a measurable basis in the same sentence.

## Services we claim (from facts.json → services) and what we don't (→ not_offered)

Keep both lists in sync with `content/facts.json`; the page text must not drift from it.

## Terminology (binding; extend when needed)

| cs                          | en                          | note                     |
| --------------------------- | --------------------------- | ------------------------ |
| vývoj software na zakázku   | custom software development | primary service term     |
| webová aplikace             | web application             |                          |
| AI agent / agentní workflow | AI agent / agentic workflow |                          |
| AI-native studio            | AI-native studio            | keep English label in cs |
| lidský dohled               | human oversight             |                          |
| případová studie            | case study                  |                          |
| veřejná zakázka             | public tender               |                          |
| zadavatel                   | contracting authority       |                          |
| vlastnictví kódu            | code ownership              |                          |
| cena pevná / od             | fixed price / from          |                          |

## Schema map (JSON-LD per page type)

| Page                         | Types                                                                      |
| ---------------------------- | -------------------------------------------------------------------------- |
| all pages (layout)           | `Organization` (+ `sameAs`), `WebSite`, `ProfessionalService`              |
| home                         | `Service` list                                                             |
| services / service detail    | `Service`, `FAQPage` (if FAQ block)                                        |
| references list / case study | `CollectionPage` / `Article` (+ `about: SoftwareApplication` for products) |
| process                      | `HowTo`                                                                    |
| pricing                      | `Service` with `offers` (`AggregateOffer`), `FAQPage` if FAQ block         |
| about / founder              | `Person` (founder), `AboutPage`                                            |
| contact                      | `ContactPage`                                                              |
| blog post (Phase 3)          | `Article` / `BlogPosting`, `FAQPage` if applicable                         |

## Frontmatter (enforced by `apps/web/src/lib/content/schema.ts`)

Every `content/<locale>/<slug>.mdx` starts with the same keys in both locales
(`pnpm check:i18n` compares them):

| Key           | Rule                                                                               |
| ------------- | ---------------------------------------------------------------------------------- |
| `title`       | ≤ 51 characters; the app appends " \| Iterus" (total ≤ 60)                         |
| `description` | 120–155 characters, phrased as the answer to the page's question                   |
| `updated`     | `YYYY-MM-DD` of the last meaningful change (sitemap `lastmod`)                     |
| `type`        | `home`, `page`, `contact` or `legal` (drives JSON-LD and sitemap priorities)       |
| `status`      | `published` (default) or `draft` — drafts get `noindex`, a banner, no sitemap/llms |

Facts and numbers never live in MDX: use the components map (`<ServicesList />`,
`<HowWeWork />`, …) which reads `content/facts.json`.

## Metadata

Title ≤ 60 chars, ends with " | Iterus"; description 120–155 chars phrased as the answer;
canonical to the primary locale URL; `alternates.languages` for cs/en (+de later); `x-default` = cs.
OG image 1200×630 from the OG route (title + one proof point).

## AI transparency (EU AI Act, Art. 50 — enforceable since 2 Aug 2026)

Any chat/assistant on the site opens with (cs) _"Jste v konverzaci s AI asistentem studia Iterus.
Odpovědi kontroluje člověk před tím, než se z nich stane nabídka."_ / (en) _"You are talking to
Iterus's AI assistant. A human reviews everything before it becomes an offer."_ Link to the AI
transparency page. Never let the assistant quote prices or make commitments.

## Legal lines

Footer on every page: `facts.json → brand.legal_line_cs/en`. Privacy and terms pages are drafted
by agents and approved by Tomas (ideally a lawyer) before publishing; mark drafts `status: draft`.

## Style

Short sentences. Active voice. No filler intros ("V dnešní době…"). Czech typographic rules
(non-breaking spaces after one-letter prepositions via the MDX post-processor, „uvozovky“,
thin spaces in numbers 2 520). Alt text describes what the image shows for the page's purpose.

## Content map

`docs/CONTENT-MAP.md` (created after the keyword/content-gap research before Sprint 1–2) lists
pages, target questions, keywords cs/en, FAQ candidates and internal-link plan. It drives the
`web-page` and `case-study` skills.
