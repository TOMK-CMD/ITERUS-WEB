import { describe, expect, it } from "vitest";
import { facts } from "@/lib/facts";
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
    // Address street, e-mail and phone are still TODO → must be absent, not empty strings.
    expect(org).not.toHaveProperty("email");
    expect(org).not.toHaveProperty("telephone");
    expect(org).not.toHaveProperty("address.streetAddress");
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
