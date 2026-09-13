import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { mdxComponents } from "@/components/mdx";
import { routing } from "@/i18n/routing";
import { loadPage, readPage } from "@/lib/content/loader";
import { getCardProjects } from "@/lib/content/reference-cards";
import { buildReferencesCollection } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const { frontmatter } = await readPage(locale, "references");
  return buildMetadata({
    locale,
    href: "/references",
    title: frontmatter.title,
    description: frontmatter.description,
    noindex: frontmatter.status === "draft",
  });
}

export default async function ReferencesPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const page = await loadPage(locale, "references", mdxComponents);
  const cards = getCardProjects(locale);

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-12">
      <JsonLd
        data={buildReferencesCollection(
          locale,
          "/references",
          { name: page.frontmatter.title, description: page.frontmatter.description },
          cards,
        )}
      />
      <article className="prose-iterus">
        <h1>{page.frontmatter.title}</h1>
        {page.content}
      </article>
    </main>
  );
}
