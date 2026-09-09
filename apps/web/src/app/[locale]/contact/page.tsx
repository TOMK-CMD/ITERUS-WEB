import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { CalcomCta } from "@/components/calcom-cta";
import { ContactForm } from "@/components/contact-form";
import { mdxComponents } from "@/components/mdx";
import { routing } from "@/i18n/routing";
import { loadPage, readPage } from "@/lib/content/loader";
import { factOrNull } from "@/lib/facts";
import { buildMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const { frontmatter } = await readPage(locale, "contact");
  return buildMetadata({
    locale,
    href: "/contact",
    title: frontmatter.title,
    description: frontmatter.description,
    noindex: frontmatter.status === "draft",
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const page = await loadPage(locale, "contact", mdxComponents);
  const t = await getTranslations({ locale, namespace: "contact.form" });

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-12">
      <article className="prose-iterus">
        <h1>{page.frontmatter.title}</h1>
        {page.content}
      </article>
      <div className="mt-10 grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="contact-form-heading" className="relative">
          <h2 id="contact-form-heading" className="sr-only">
            {t("heading")}
          </h2>
          <ContactForm siteKey={factOrNull(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)} />
        </section>
        <CalcomCta />
      </div>
    </main>
  );
}
