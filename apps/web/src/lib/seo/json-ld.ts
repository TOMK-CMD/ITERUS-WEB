import type {
  AboutPage,
  AggregateOffer,
  Answer,
  Article,
  CollectionPage,
  FAQPage,
  HowTo,
  HowToStep,
  Offer,
  Organization,
  Person,
  ProfessionalService,
  Question,
  Service,
  SoftwareApplication,
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
const PERSON_ID = `${SITE_URL}/#founder`;

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
 * by decision (2026-09-15, guarded by a unit test).
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

const FOUNDER_PROFILE_KEYS = ["linkedin_founder"] as const;

/** The founder — referenced by `/o-nas`'s AboutPage via `about: { "@id": ... }`. */
export function buildPerson(locale: Locale): WithContext<Person> {
  const sameAs = FOUNDER_PROFILE_KEYS.map((key) => factOrNull(facts.organization.urls[key])).filter(
    (value): value is string => value !== null,
  );
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: facts.organization.founder_name,
    alternateName: facts.organization.founder_name_alternate,
    jobTitle:
      locale === "cs" ? facts.organization.founder_title_cs : facts.organization.founder_title_en,
    worksFor: { "@id": ORGANIZATION_ID },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** `/o-nas` — AboutPage linked to the founder Person via `about`. */
export function buildAboutPage(
  locale: Locale,
  href: AppPathname,
  content: ServiceContent,
): WithContext<AboutPage> {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: content.name,
    description: content.description,
    url: localizedUrl(locale, href),
    about: { "@id": PERSON_ID },
    inLanguage: LANGUAGE_TAGS[locale],
  };
}

export type ProcessStep = { name: string; text: string };

/** `/jak-pracujeme` — HowTo built from the steps authored on the page. */
export function buildHowTo(
  locale: Locale,
  href: AppPathname,
  content: ServiceContent,
  steps: ProcessStep[],
): WithContext<HowTo> {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: content.name,
    description: content.description,
    url: localizedUrl(locale, href),
    inLanguage: LANGUAGE_TAGS[locale],
    step: steps.map((stepItem, index): HowToStep => ({
      "@type": "HowToStep",
      position: index + 1,
      name: stepItem.name,
      text: stepItem.text,
    })),
  };
}

export type ReferenceCard = { name: string; hook: string };
export type ReferenceCaseStudy = ReferenceCard & { href: AppPathname };

/**
 * `/reference` — CollectionPage listing the case studies that have a page (each linking to it)
 * followed by the "card" tier projects (`facts.json → projects[*].publish === "card"`), all as
 * SoftwareApplication entries. A case-study tier project without a page yet is simply absent.
 */
export function buildReferencesCollection(
  locale: Locale,
  href: AppPathname,
  content: ServiceContent,
  cards: ReferenceCard[],
  caseStudies: ReferenceCaseStudy[] = [],
): WithContext<CollectionPage> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: content.name,
    description: content.description,
    url: localizedUrl(locale, href),
    inLanguage: LANGUAGE_TAGS[locale],
    hasPart: [
      ...caseStudies.map((study): SoftwareApplication => ({
        "@type": "SoftwareApplication",
        name: study.name,
        description: study.hook,
        url: localizedUrl(locale, study.href),
      })),
      ...cards.map((card): SoftwareApplication => ({
        "@type": "SoftwareApplication",
        name: card.name,
        description: card.hook,
      })),
    ],
  };
}

export type CaseStudyContent = {
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
};

type CaseStudyProjectFacts = {
  name: string;
  url?: string;
  hook_cs: string;
  hook_en: string;
};

/**
 * One case-study page — `Article` written and published by the organisation, `about` the product
 * it describes (`SoftwareApplication` from `facts.json → projects[project]`, in the page's locale).
 * Dates come from the page's frontmatter (`published`, `updated`).
 */
export function buildCaseStudyArticle(
  locale: Locale,
  href: AppPathname,
  content: CaseStudyContent,
  project: keyof typeof facts.projects,
): WithContext<Article> {
  const raw = facts.projects[project] as unknown as CaseStudyProjectFacts;
  const url = localizedUrl(locale, href);
  const productUrl = factOrNull(raw.url);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.headline,
    description: content.description,
    datePublished: content.datePublished,
    dateModified: content.dateModified,
    url,
    mainEntityOfPage: url,
    inLanguage: LANGUAGE_TAGS[locale],
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    about: {
      "@type": "SoftwareApplication",
      name: raw.name,
      description: locale === "cs" ? raw.hook_cs : raw.hook_en,
      ...(productUrl ? { url: productUrl } : {}),
    } satisfies SoftwareApplication,
  };
}

/** Serialises for a <script type="application/ld+json"> so "</script>" in data cannot break out. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
