import type { Organization, ProfessionalService, WebSite, WithContext } from "schema-dts";
import { routing, type Locale } from "@/i18n/routing";
import { facts, factOrNull, tagline } from "@/lib/facts";
import { SITE_URL } from "./metadata";

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

/** Serialises for a <script type="application/ld+json"> so "</script>" in data cannot break out. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
