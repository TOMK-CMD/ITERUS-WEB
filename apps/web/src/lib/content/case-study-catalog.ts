import type { AppPathname, Locale } from "@/i18n/routing";
import { facts } from "@/lib/facts";
import { readPage } from "./loader";

export type CaseStudyProject = keyof typeof facts.projects;

/**
 * Case-study pages that exist (ADR-0004: static entries, flat content slugs). A project may sit in
 * the `case-study` tier of facts.json without appearing here — it has no page until its brief is
 * written up — so `/reference` and the `CollectionPage` JSON-LD list only what is actually built.
 */
export const CASE_STUDY_PAGES: { slug: string; href: AppPathname; project: CaseStudyProject }[] = [
  { slug: "references-innea", href: "/references/innea", project: "innea" },
  { slug: "references-innea-pro", href: "/references/innea-pro", project: "innea-pro" },
];

export type CaseStudyCatalogItem = {
  slug: string;
  href: AppPathname;
  project: CaseStudyProject;
  /** From facts.json — the product's canonical name, status label and one-line hook. */
  name: string;
  status: string;
  hook: string;
  /** From the page's own frontmatter. */
  title: string;
  description: string;
};

type RawProject = {
  name: string;
  status_cs: string;
  status_en: string;
  hook_cs: string;
  hook_en: string;
};

export function caseStudyProjectFacts(
  project: CaseStudyProject,
  locale: Locale,
): Pick<CaseStudyCatalogItem, "name" | "status" | "hook"> {
  const raw = facts.projects[project] as unknown as RawProject;
  return {
    name: raw.name,
    status: locale === "cs" ? raw.status_cs : raw.status_en,
    hook: locale === "cs" ? raw.hook_cs : raw.hook_en,
  };
}

export async function loadCaseStudyCatalog(locale: Locale): Promise<CaseStudyCatalogItem[]> {
  return Promise.all(
    CASE_STUDY_PAGES.map(async ({ slug, href, project }) => {
      const { frontmatter } = await readPage(locale, slug);
      return {
        slug,
        href,
        project,
        ...caseStudyProjectFacts(project, locale),
        title: frontmatter.title,
        description: frontmatter.description,
      };
    }),
  );
}
