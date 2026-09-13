import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { mdxComponents } from "@/components/mdx";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { loadServiceCatalog } from "@/lib/content/service-catalog";
import { loadPage, readPage } from "@/lib/content/loader";
import { buildServiceCatalog } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const { frontmatter } = await readPage(locale, "services");
  return buildMetadata({
    locale,
    href: "/services",
    title: frontmatter.title,
    description: frontmatter.description,
    noindex: frontmatter.status === "draft",
  });
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const [page, catalog, t] = await Promise.all([
    loadPage(locale, "services", mdxComponents),
    loadServiceCatalog(locale),
    getTranslations({ locale, namespace: "services" }),
  ]);

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-12">
      <JsonLd data={buildServiceCatalog(locale, catalog)} />
      <article className="prose-iterus">
        <h1>{page.frontmatter.title}</h1>
        {page.content}
      </article>
      <section aria-labelledby="service-catalog-heading" className="mt-10">
        <h2 id="service-catalog-heading">{t("detailHeading")}</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {catalog.map((service) => (
            <li key={service.slug} className="border-border bg-card rounded-lg border p-4">
              <Link href={service.href} className="font-semibold hover:underline">
                {service.name}
              </Link>
              <p className="text-muted-foreground mt-1 text-sm">{service.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
