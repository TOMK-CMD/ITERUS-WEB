import type { Locale } from "@/i18n/routing";
import { facts } from "@/lib/facts";

export type CardProject = { name: string; status: string; hook: string };

type RawProject = {
  name: string;
  publish?: unknown;
  status_cs: string;
  status_en: string;
  hook_cs: string;
  hook_en: string;
};

/** The "na čem dál pracujeme" card-tier projects (`facts.json → projects[*].publish === "card"`). */
export function getCardProjects(locale: Locale): CardProject[] {
  // facts.json's project entries have per-key shapes (each project's own literal fields), so TS
  // can't narrow Object.values() to a single interface via a type guard — cast once, then filter
  // on the field every project entry does carry (`publish`).
  const projects = Object.values(facts.projects) as unknown as RawProject[];
  return projects
    .filter((project) => project.publish === "card")
    .map((project) => ({
      name: project.name,
      status: locale === "cs" ? project.status_cs : project.status_en,
      hook: locale === "cs" ? project.hook_cs : project.hook_en,
    }));
}
