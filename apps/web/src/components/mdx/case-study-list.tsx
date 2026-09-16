import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { loadCaseStudyCatalog } from "@/lib/content/case-study-catalog";

/**
 * "Případové studie" on `/reference` — one card per case-study page that exists: product name,
 * status label and hook from facts.json, the page's own title as the link. The page's
 * `CollectionPage` JSON-LD lists the same entries (built in `page.tsx` from the same catalog).
 */
export async function CaseStudyList() {
  const locale = (await getLocale()) as Locale;
  const studies = await loadCaseStudyCatalog(locale);

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {studies.map((study) => (
        <li key={study.slug} className="border-border bg-card rounded-lg border p-4">
          <p className="font-semibold">{study.name}</p>
          <p className="text-muted-foreground text-sm">{study.status}</p>
          <p className="mt-2 text-sm">{study.hook}</p>
          <p className="mt-3 text-sm">
            <Link href={study.href}>
              {study.title} <span aria-hidden="true">→</span>
            </Link>
          </p>
        </li>
      ))}
    </ul>
  );
}
