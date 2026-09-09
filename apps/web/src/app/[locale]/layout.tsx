import type { ReactNode } from "react";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { Plausible } from "@/components/plausible";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { buildSiteJsonLd } from "@/lib/seo/json-ld";
import "../globals.css";

// Body font (docs/BRAND.md). The heading font is still TODO until the design direction is
// chosen; tokens.css maps --font-heading to the same family for now.
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale });
  const footerLinks = [
    { href: getPathname({ locale, href: "/" }), label: t("nav.home") },
    { href: getPathname({ locale, href: "/contact" }), label: t("nav.contact") },
  ];

  return (
    <html lang={locale} className={inter.variable}>
      <body className="flex min-h-dvh flex-col antialiased">
        <JsonLd data={buildSiteJsonLd(locale)} />
        <Plausible />
        <NextIntlClientProvider>
          <a
            href="#main"
            className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-3 focus:py-2"
          >
            {t("common.skipToContent")}
          </a>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter locale={locale} navLabel={t("footer.navLabel")} links={footerLinks} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
