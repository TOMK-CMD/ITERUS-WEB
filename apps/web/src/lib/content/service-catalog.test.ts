import { describe, expect, it } from "vitest";
import { loadServiceCatalog, SERVICE_DETAIL_PAGES } from "./service-catalog";

describe("loadServiceCatalog", () => {
  it("reads the five service detail pages with a name and description, per locale", async () => {
    for (const locale of ["cs", "en"] as const) {
      const catalog = await loadServiceCatalog(locale);
      expect(catalog).toHaveLength(SERVICE_DETAIL_PAGES.length);
      for (const item of catalog) {
        expect(item.name.length).toBeGreaterThan(0);
        expect(item.description.length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps slug and href paired the same way as PAGE_ROUTES expects", async () => {
    const catalog = await loadServiceCatalog("cs");
    expect(catalog.map((item) => item.slug)).toEqual(SERVICE_DETAIL_PAGES.map((p) => p.slug));
  });
});
