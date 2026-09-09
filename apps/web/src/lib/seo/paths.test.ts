import { describe, expect, it } from "vitest";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppPathname } from "@/i18n/routing";
import { localizedPath, PAGE_ROUTES } from "./paths";

describe("localizedPath", () => {
  it("matches next-intl getPathname for every route and locale", () => {
    for (const href of Object.keys(routing.pathnames) as AppPathname[]) {
      for (const locale of routing.locales) {
        expect(localizedPath(locale, href), `${locale} ${href}`).toBe(
          getPathname({ locale, href }),
        );
      }
    }
  });

  it("maps every content slug to a known route", () => {
    for (const href of Object.values(PAGE_ROUTES)) {
      expect(routing.pathnames).toHaveProperty(href);
    }
  });
});
