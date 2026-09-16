import { describe, expect, it } from "vitest";
import { facts } from "@/lib/facts";
import { PAGE_ROUTES } from "@/lib/seo/paths";
import { CASE_STUDY_PAGES, loadCaseStudyCatalog } from "./case-study-catalog";

describe("loadCaseStudyCatalog", () => {
  it("reads every case-study page with its facts.json name, status and hook, per locale", async () => {
    for (const locale of ["cs", "en"] as const) {
      const catalog = await loadCaseStudyCatalog(locale);
      expect(catalog).toHaveLength(CASE_STUDY_PAGES.length);
      for (const item of catalog) {
        expect(item.name.length).toBeGreaterThan(0);
        expect(item.status.length).toBeGreaterThan(0);
        expect(item.hook.length).toBeGreaterThan(0);
        expect(item.title.length).toBeGreaterThan(0);
        expect(item.description.length).toBeGreaterThan(0);
      }
    }
  });

  it("localises status and hook — the two locales must not read the same", async () => {
    const [cs, en] = await Promise.all([loadCaseStudyCatalog("cs"), loadCaseStudyCatalog("en")]);
    for (const [index, item] of cs.entries()) {
      expect(item.status).not.toBe(en[index].status);
      expect(item.hook).not.toBe(en[index].hook);
    }
  });

  it("only lists projects that facts.json marks as case-study tier", () => {
    for (const { project } of CASE_STUDY_PAGES) {
      const record = facts.projects[project] as { publish?: unknown };
      expect(record.publish, project).toBe("case-study");
    }
  });

  it("keeps every entry's slug registered in PAGE_ROUTES under the same pathname", () => {
    for (const { slug, href } of CASE_STUDY_PAGES) {
      expect(PAGE_ROUTES[slug], slug).toBe(href);
    }
  });

  it("names each case study page after its facts.json project (slug = references-<project>)", () => {
    for (const { slug, project } of CASE_STUDY_PAGES) {
      expect(slug).toBe(`references-${project}`);
    }
  });
});
