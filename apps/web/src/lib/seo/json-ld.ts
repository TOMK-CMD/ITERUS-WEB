import type {
  AggregateOffer,
  Answer,
  FAQPage,
  Offer,
  Organization,
  ProfessionalService,
  Question,
  Service,
  WebSite,
  WithContext,
} from "schema-dts";
import type { AppPathname, Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { facts, factOrNull, tagline } from "@/lib/facts";
import { localizedUrl, SITE_URL } from "./metadata";

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const SERVICE_ID = `${SITE_URL}/#professional-service`;

const LANGUAGE_TAGS: Record<Locale, string> = { cs: "cs-CZ", en: "en" };

/** Public profiles that are real (facts.json TODO placeholders are skipped). */
export function sameAsUrls(): string[] {
  const urls = facts.organization.urls;
  return [
    urls.linkedin_company,
    urls.github,
    urls.firmy_cz,
    urls.google_business,
    urls.wikidata,
    urls.clutch,
  ]
    .map(factOrNull)
    .filter((value): value is string => value !== null);
}

function postalAddress() {
  const street = factOrNull(facts.organization.registered_address);
  const postalCode = factOrNull(facts.organization.postal_code);
  return {
    "@type": "PostalAddress" as const,
    ...(street ? { streetAddress: street } : {}),
    ...(postalCode ? { postalCode } : {}),
    addressLocality: facts.organization.city,
    addressCountry: facts.organization.country,
  };
}

export function buildOrganization(): WithContext<Organization> {
  const email = factOrNull(facts.organization.email);
  const phone = factOrNull(facts.organization.phone);
  const sameAs = sameAsUrls();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: facts.brand.name,
    legalName: facts.organization.legal_name,
    identifier: facts.organization.ico,
    url: SITE_URL,
    address: postalAddress(),
    ...(email ? { email } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function buildWebSite(locale: Locale): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: facts.brand.name,
    url: SITE_URL,
    inLanguage: LANGUAGE_TAGS[locale],
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function buildProfessionalService(locale: Locale): WithContext<ProfessionalService> {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": SERVICE_ID,
    name: facts.brand.name,
    description: tagline(locale),
    url: SITE_URL,
    address: postalAddress(),
    areaServed: ["CZ", "EU"],
    parentOrganization: { "@id": ORGANIZATION_ID },
    knowsLanguage: routing.locales.map((l) => LANGUAGE_TAGS[l]),
  };
}

/** Site-wide graph rendered in the locale layout. */
export function buildSiteJsonLd(locale: Locale) {
  return [buildOrganization(), buildWebSite(locale), buildProfessionalService(locale)];
}

export type ServiceContent = { name: string; description: string };

/** A single named service — used on each service detail page. */
export function buildServiceDetail(
  locale: Locale,
  href: AppPathname,
  content: ServiceContent,
): WithContext<Service> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: content.name,
    description: content.description,
    url: localizedUrl(locale, href),
    provider: { "@id": ORGANIZATION_ID },
    areaServed: ["CZ", "EU"],
  };
}

export type ServiceCatalogEntry = ServiceContent & { href: AppPathname };

/** One `Service` stub per detail page, rendered on the `/sluzby` overview. */
export function buildServiceCatalog(
  locale: Locale,
  entries: ServiceCatalogEntry[],
): WithContext<Service>[] {
  return entries.map((entry) => buildServiceDetail(locale, entry.href, entry));
}

export type FaqItem = { question: string; answer: string };

/** FAQ block JSON-LD — used on service pages, pricing and the process page. */
export function buildFAQPage(items: FaqItem[]): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item): Question => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer } satisfies Answer,
    })),
  };
}

/**
 * `/cena` — Service with an AggregateOffer built from `facts.pricing.bands`. Never reads
 * `reference_rate_*`: the hourly rate is `reference_rate_internal_only` and stays unpublished
 * until Tomas approves it (guarded by a unit test).
 */
export function buildPricingService(
  locale: Locale,
  href: AppPathname,
  content: ServiceContent,
): WithContext<Service> {
  const bands = facts.pricing.bands;
  const lowPrice = Math.min(...bands.map((band) => band.from_czk));
  const finiteCeilings = bands.flatMap((band) => (band.to_czk !== null ? [band.to_czk] : []));
  const highPrice = finiteCeilings.length ? Math.max(...finiteCeilings) : lowPrice;

  const offers: Offer[] = bands.map((band) => ({
    "@type": "Offer",
    name: locale === "cs" ? band.cs : band.en,
    description: locale === "cs" ? band.includes_cs : band.includes_en,
    price: band.from_czk,
    priceCurrency: facts.pricing.currency,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: content.name,
    description: content.description,
    url: localizedUrl(locale, href),
    provider: { "@id": ORGANIZATION_ID },
    areaServed: ["CZ", "EU"],
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: facts.pricing.currency,
      lowPrice,
      highPrice,
      offers,
    } satisfies AggregateOffer,
  };
}

/** Serialises for a <script type="application/ld+json"> so "</script>" in data cannot break out. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
