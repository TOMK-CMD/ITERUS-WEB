import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { mdxComponents } from "@/components/mdx";
import { routing, type AppPathname } from "@/i18n/routing";
import { loadPage, readPage } from "@/lib/content/loader";
import { buildServiceDetail } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string }> };

/**
 * Factory for the five service detail routes (`/sluzby/<slug>`): identical shape (locale guard,
 * MDX load, metadata, one `Service` JSON-LD entity) — see docs/adr/0004-service-page-routing.md.
 * Each route file just supplies its content slug and registered pathname.
 */
export function createServiceDetailPage(slug: string, href: AppPathname) {
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

    return (
      <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-12">
        <JsonLd
          data={buildServiceDetail(locale, href, {
            name: page.frontmatter.title,
            description: page.frontmatter.description,
          })}
        />
        <article className="prose-iterus">
          <h1>{page.frontmatter.title}</h1>
          {page.content}
        </article>
      </main>
    );
  }

  return { generateMetadata, Page };
}
