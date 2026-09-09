import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { mdxComponents } from "@/components/mdx";
import { routing } from "@/i18n/routing";
import { loadPage, readPage } from "@/lib/content/loader";
import { buildMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const { frontmatter } = await readPage(locale, "home");
  return buildMetadata({
    locale,
    href: "/",
    title: frontmatter.title,
    description: frontmatter.description,
    noindex: frontmatter.status === "draft",
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const page = await loadPage(locale, "home", mdxComponents);

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-12">
      <article className="prose-iterus">
        <h1>{page.frontmatter.title}</h1>
        {page.content}
      </article>
    </main>
  );
}
