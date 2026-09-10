import { describe, expect, it } from "vitest";
import { facts, isTodo } from "@/lib/facts";
import { buildOrganization, buildSiteJsonLd, sameAsUrls, serializeJsonLd } from "./json-ld";
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
});
