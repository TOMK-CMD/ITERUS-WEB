import { describe, expect, it } from "vitest";
import { facts } from "@/lib/facts";
import { PAGE_ROUTES } from "@/lib/seo/paths";
import { listPages } from "./loader";
import { FOUNDER_WORDING_FORBIDDEN } from "./wording-guards";

/**
 * The real content tree, not fixtures: a frontmatter limit broken in content/<locale>/*.mdx used
 * to surface only in `next build` (sitemap → listPages). Here it fails in `pnpm check`.
 */
describe("content/<locale>/*.mdx", () => {
  it("validates every page in both locales, drafts included", async () => {
    const [cs, en] = await Promise.all([
      listPages("cs", { includeDrafts: true }),
      listPages("en", { includeDrafts: true }),
    ]);
    expect(cs.length).toBeGreaterThan(0);
    expect(cs.map((page) => page.slug)).toEqual(en.map((page) => page.slug));
  });

  it("registers every page slug in PAGE_ROUTES (sitemap and llms.txt would throw otherwise)", async () => {
    for (const page of await listPages("cs", { includeDrafts: true })) {
      expect(PAGE_ROUTES[page.slug], page.slug).toBeDefined();
    }
  });

  it("points every case study at a case-study tier project, named after it", async () => {
    for (const locale of ["cs", "en"] as const) {
      const studies = (await listPages(locale, { includeDrafts: true })).filter(
        (page) => page.frontmatter.type === "case-study",
      );
      expect(studies.length).toBeGreaterThan(0);
      for (const page of studies) {
        const project = page.frontmatter.project as keyof typeof facts.projects;
        const record = facts.projects[project] as { publish?: unknown };
        expect(record?.publish, `${page.file}: project "${project}"`).toBe("case-study");
        expect(page.slug).toBe(`references-${project}`);
      }
    }
  });
});

describe("case-study prose (docs/CONTENT-MAP.md → Case-study numbers)", () => {
  // The same wording rules facts.test.ts applies to the founder story, plus the two conditions
  // from Tomas's brief: nothing about paying users, no operational counts.
  const forbidden = [
    /program(átor|ovač|mer|uj)/i,
    /\bvývojář/i,
    /\b(coder|developer)s?\b/i,
    /platíc/i,
    /zaplat/i,
    /\b(paying|paid)\b/i,
  ];
  // Every figure renders through <ProjectMetrics /> or <HowWeWork statement="…" />; prose may
  // carry only dates, the 116 123 helpline and the names of scales and standards. Extend
  // deliberately, not casually.
  const allowedDigits = [
    /\b(19|20)\d{2}\b/g,
    /116 123/g,
    /PHQ-9/g,
    /GAD-7/g,
    /\bAES-256(-GCM)?\b/g,
  ];

  async function caseStudyBodies() {
    const pages = await Promise.all(
      (["cs", "en"] as const).map((locale) => listPages(locale, { includeDrafts: true })),
    );
    return pages.flat().filter((page) => page.frontmatter.type === "case-study");
  }

  it("never uses forbidden wording about the founder or paying users", async () => {
    for (const page of await caseStudyBodies()) {
      for (const pattern of forbidden) {
        expect(pattern.test(page.body), `${page.file}: ${pattern}`).toBe(false);
      }
    }
  });

  it("keeps numbers out of prose — figures come from facts.json through components", async () => {
    for (const page of await caseStudyBodies()) {
      // Only the two facts-driven blocks may carry a figure; any other component's attributes
      // stay in the text, so a digit hidden in `<Foo count="100" />` is still caught.
      let prose = page.body.replace(/<(?:ProjectMetrics|HowWeWork)\b[^>]*\/>/g, "");
      for (const pattern of allowedDigits) prose = prose.replace(pattern, "");
      const leaked = prose.match(/[^\s]*\d[^\s]*/g) ?? [];
      expect(leaked, `${page.file}: digits in prose`).toEqual([]);
    }
  });
});

describe("every page (CLAUDE.md → never state or deny that the founder is a programmer)", () => {
  // The case-study guard above bans the words outright, which only works where the prose is
  // about the founder. Elsewhere "programujeme indikátory" is a legitimate service claim, so
  // the site-wide guard uses the subject-aware phrases shared with facts.test.ts — and scans
  // title and description too, the most-quoted text on the site.
  it("never states or denies it on any page, drafts included, in either locale", async () => {
    const pages = (
      await Promise.all(
        (["cs", "en"] as const).map((locale) => listPages(locale, { includeDrafts: true })),
      )
    ).flat();
    expect(pages.length).toBeGreaterThan(6);
    const violations: string[] = [];
    for (const page of pages) {
      const text = [page.frontmatter.title, page.frontmatter.description, page.body].join("\n");
      for (const pattern of FOUNDER_WORDING_FORBIDDEN) {
        if (pattern.test(text)) violations.push(`${page.file}: ${pattern}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("keeps the hand-typed count of case studies on /o-nas in step with the content tree", async () => {
    // about.mdx says "tři" / "three" case studies; a fourth study must update that copy too.
    const studies = (await listPages("cs", { includeDrafts: true })).filter(
      (page) => page.frontmatter.type === "case-study",
    );
    expect(studies).toHaveLength(3);
  });
});
