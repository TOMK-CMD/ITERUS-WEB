import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { mdxComponents } from "@/components/mdx";
import { routing, type AppPathname } from "@/i18n/routing";
import { caseStudyProjectFacts, type CaseStudyProject } from "@/lib/content/case-study-catalog";
import { ContentError, loadPage, readPage } from "@/lib/content/loader";
import { buildCaseStudyArticle } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string }> };

type CaseStudyRoute = { slug: string; href: AppPathname; project: CaseStudyProject };

/**
 * Factory for case-study routes (`/reference/<project>`): locale guard, MDX load, metadata, one
 * `Article` JSON-LD entity `about` the product — the same shell as `service-detail-page.tsx`
 * (ADR-0004: static entries, flat slugs). The page's frontmatter must be `type: case-study` and
 * name the same `project` as the route, so numbers, hook and JSON-LD all read one facts.json entry.
 */
export function createCaseStudyPage({ slug, href, project }: CaseStudyRoute) {
  async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) notFound();
    const { frontmatter } = await readPage(locale, slug);
    return buildMetadata({
      locale,
      href,
      title: frontmatter.title,
      description: frontmatter.description,
      noindex: frontmatter.status === "draft",
    });
  }

  async function Page({ params }: Props) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) notFound();
    const page = await loadPage(locale, slug, mdxComponents);
    const { frontmatter } = page;
    // `published` is already enforced by the schema for case studies; the check narrows the type.
    if (
      frontmatter.type !== "case-study" ||
      frontmatter.project !== project ||
      !frontmatter.published
    ) {
      throw new ContentError(page.file, `expected a case study for project "${project}"`);
    }
    const product = caseStudyProjectFacts(project, locale);

    return (
      <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-12">
        <JsonLd
          data={buildCaseStudyArticle(
            locale,
            href,
            {
              headline: frontmatter.title,
              description: frontmatter.description,
              datePublished: frontmatter.published,
              dateModified: frontmatter.updated,
            },
            project,
          )}
        />
        <article className="prose-iterus">
          <p className="text-muted-foreground text-sm">
            {product.name} · {product.status}
          </p>
          <h1>{frontmatter.title}</h1>
          {page.content}
        </article>
      </main>
    );
  }

  return { generateMetadata, Page };
}
