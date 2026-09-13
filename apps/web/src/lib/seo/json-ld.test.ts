import { describe, expect, it } from "vitest";
import { facts, isTodo } from "@/lib/facts";
import {
  buildAboutPage,
  buildFAQPage,
  buildHowTo,
  buildOrganization,
  buildPerson,
  buildPricingService,
  buildServiceCatalog,
  buildServiceDetail,
  buildSiteJsonLd,
  sameAsUrls,
  serializeJsonLd,
} from "./json-ld";
import { SITE_URL } from "./metadata";

describe("JSON-LD builders", () => {
  it("never publishes TODO placeholders from facts.json", () => {
    const json = serializeJsonLd(buildSiteJsonLd("cs"));
    expect(json).not.toMatch(/TODO/i);
  });

  it("uses only real profile URLs for sameAs", () => {
    const urls = sameAsUrls();
    expect(urls).toContain(facts.organization.urls.github);
    expect(urls.every((u) => u.startsWith("https://"))).toBe(true);
    expect(urls.some((u) => /TODO/i.test(u))).toBe(false);
  });

  it("describes the organisation with legal name, IČO and city", () => {
    const org = buildOrganization();
    expect(org).toMatchObject({
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Iterus",
      legalName: "SUN Professionals s.r.o.",
      identifier: "27159884",
      address: { "@type": "PostalAddress", addressLocality: "Praha", addressCountry: "CZ" },
    });
  });

  it("includes an optional contact field when the fact is real and omits it while it is TODO", () => {
    // The original version of this test asserted that telephone was absent, which only held
    // because the fact happened to be TODO — it broke the moment a real number arrived.
    // What must hold is the rule: a TODO never reaches the output, a real value always does.
    const org = buildOrganization() as unknown as Record<string, unknown> & {
      address?: Record<string, unknown>;
    };
    const cases: Array<[string, unknown, unknown]> = [
      ["email", facts.organization.email, org.email],
      ["telephone", facts.organization.phone, org.telephone],
      ["streetAddress", facts.organization.registered_address, org.address?.streetAddress],
      ["postalCode", facts.organization.postal_code, org.address?.postalCode],
    ];
    for (const [field, fact, published] of cases) {
      if (isTodo(fact)) {
        expect(published, `${field} must stay absent while the fact is TODO`).toBeUndefined();
      } else {
        expect(published, `${field} must be published once the fact is real`).toBe(fact);
      }
    }
  });

  it("links WebSite and ProfessionalService to the organisation and sets the language", () => {
    const [, site, service] = buildSiteJsonLd("en");
    expect(site).toMatchObject({
      "@type": "WebSite",
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#organization` },
    });
    expect(service).toMatchObject({
      "@type": "ProfessionalService",
      areaServed: ["CZ", "EU"],
      parentOrganization: { "@id": `${SITE_URL}/#organization` },
    });
  });

  it("escapes closing script tags when serialising", () => {
    expect(serializeJsonLd({ x: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });

  it("builds a Service entity for a detail page, linked to the organisation", () => {
    const service = buildServiceDetail("cs", "/services/web-applications", {
      name: "Vývoj webových aplikací na míru",
      description: "Popis služby.",
    });
    expect(service).toMatchObject({
      "@type": "Service",
      name: "Vývoj webových aplikací na míru",
      description: "Popis služby.",
      url: `${SITE_URL}/sluzby/webove-aplikace`,
      provider: { "@id": `${SITE_URL}/#organization` },
    });
  });

  it("builds one Service stub per catalog entry for the /sluzby overview", () => {
    const catalog = buildServiceCatalog("en", [
      { href: "/services/web-applications", name: "A", description: "Desc A" },
      { href: "/services/ai-integration", name: "B", description: "Desc B" },
    ]);
    expect(catalog).toHaveLength(2);
    expect(catalog[0]).toMatchObject({ "@type": "Service", name: "A" });
    expect(catalog[1]).toMatchObject({ "@type": "Service", name: "B" });
  });

  it("builds a pricing Service with an AggregateOffer spanning the price bands", () => {
    const service = buildPricingService("cs", "/pricing", {
      name: "Cena",
      description: "Popis cen.",
    });
    expect(service).toMatchObject({
      "@type": "Service",
      name: "Cena",
      provider: { "@id": `${SITE_URL}/#organization` },
    });
    const offers = (service as unknown as { offers: Record<string, unknown> }).offers;
    const finiteCeilings = facts.pricing.bands.flatMap((b) =>
      b.to_czk !== null ? [b.to_czk] : [],
    );
    expect(offers).toMatchObject({
      "@type": "AggregateOffer",
      priceCurrency: facts.pricing.currency,
      lowPrice: Math.min(...facts.pricing.bands.map((b) => b.from_czk)),
      // The "ai" band's to_czk is null (open-ended); highPrice must come only from bands with a
      // real ceiling, not be skewed by an open-ended band.
      highPrice: Math.max(...finiteCeilings),
    });
    expect(Array.isArray((offers as { offers: unknown[] }).offers)).toBe(true);
    expect((offers as { offers: unknown[] }).offers).toHaveLength(facts.pricing.bands.length);
  });

  it("never publishes the internal hourly rate in the pricing JSON-LD", () => {
    const service = buildPricingService("cs", "/pricing", {
      name: "Cena",
      description: "Popis cen.",
    });
    const json = serializeJsonLd(service);
    expect(json).not.toContain(String(facts.pricing.reference_rate_czk_hour));
    expect(json).not.toContain(String(facts.pricing.reference_rate_czk_day));
  });

  it("builds an FAQPage with one Question/Answer pair per item", () => {
    const faq = buildFAQPage([
      { question: "Otázka jedna?", answer: "Odpověď jedna." },
      { question: "Otázka dva?", answer: "Odpověď dva." },
    ]);
    expect(faq).toMatchObject({
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Otázka jedna?",
          acceptedAnswer: { "@type": "Answer", text: "Odpověď jedna." },
        },
        {
          "@type": "Question",
          name: "Otázka dva?",
          acceptedAnswer: { "@type": "Answer", text: "Odpověď dva." },
        },
      ],
    });
  });

  it("builds the founder Person linked to the organisation", () => {
    const person = buildPerson();
    expect(person).toMatchObject({
      "@type": "Person",
      "@id": `${SITE_URL}/#founder`,
      name: facts.organization.founder_name,
      alternateName: facts.organization.founder_name_alternate,
      jobTitle: facts.organization.founder_title_cs,
      worksFor: { "@id": `${SITE_URL}/#organization` },
    });
  });

  it("links the AboutPage to the founder Person via about", () => {
    const about = buildAboutPage("cs", "/about", { name: "O nás", description: "Popis." });
    expect(about).toMatchObject({
      "@type": "AboutPage",
      name: "O nás",
      about: { "@id": `${SITE_URL}/#founder` },
    });
  });

  it("builds a HowTo with one numbered HowToStep per step, in order", () => {
    const howTo = buildHowTo("cs", "/process", { name: "Jak pracujeme", description: "Popis." }, [
      { name: "Krok jedna", text: "Text jedna." },
      { name: "Krok dva", text: "Text dva." },
    ]);
    expect(howTo).toMatchObject({
      "@type": "HowTo",
      name: "Jak pracujeme",
      step: [
        { "@type": "HowToStep", position: 1, name: "Krok jedna", text: "Text jedna." },
        { "@type": "HowToStep", position: 2, name: "Krok dva", text: "Text dva." },
      ],
    });
  });
});
