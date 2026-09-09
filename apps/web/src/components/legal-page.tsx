import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { mdxComponents } from "@/components/mdx";
import { routing, type AppPathname } from "@/i18n/routing";
import { loadPage, readPage } from "@/lib/content/loader";
import { buildMetadata } from "@/lib/seo/metadata";

type LegalSlug = "privacy" | "terms";
const HREFS: Record<LegalSlug, AppPathname> = { privacy: "/privacy", terms: "/terms" };

type Params = Promise<{ locale: string }>;

/** Metadata for a legal page; drafts are noindex until Tomas approves them. */
export async function legalMetadata(params: Params, slug: LegalSlug): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const { frontmatter } = await readPage(locale, slug);
  return buildMetadata({
    locale,
    href: HREFS[slug],
    title: frontmatter.title,
    description: frontmatter.description,
    noindex: frontmatter.status === "draft",
  });
}

/** Renders a legal MDX page with a visible banner while it is still a draft. */
export async function LegalArticle({ params, slug }: { params: Params; slug: LegalSlug }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const page = await loadPage(locale, slug, mdxComponents);
  const t = await getTranslations("legal");

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-12">
      {page.frontmatter.status === "draft" ? (
        <p
          role="status"
          className="border-primary/40 bg-accent mb-8 rounded-lg border px-4 py-3 text-sm"
        >
          {t("draftBanner")}
        </p>
      ) : null}
      <article className="prose-iterus">
        <h1>{page.frontmatter.title}</h1>
        <p className="text-muted-foreground text-sm">
          <time dateTime={page.frontmatter.updated}>
            {t("updated", {
              date: new Intl.DateTimeFormat(locale === "cs" ? "cs-CZ" : "en-GB", {
                dateStyle: "long",
                timeZone: "UTC", // frontmatter dates are calendar days, not instants
              }).format(new Date(page.frontmatter.updated)),
            })}
          </time>
        </p>
        {page.content}
      </article>
    </main>
  );
}
