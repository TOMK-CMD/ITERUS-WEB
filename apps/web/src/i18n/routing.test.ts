import { describe, expect, it } from "vitest";
import { routing } from "./routing";

describe("routing", () => {
  it("uses Czech as the default locale without a prefix", () => {
    expect(routing.defaultLocale).toBe("cs");
    expect(routing.localePrefix).toBe("as-needed");
  });

  it("never redirects based on Accept-Language or cookies (URL is the source of truth)", () => {
    expect(routing.localeDetection).toBe(false);
  });

  it("defines every localized pathname for every locale", () => {
    const locales = [...routing.locales].sort();
    for (const [internal, value] of Object.entries(routing.pathnames)) {
      if (typeof value === "string") continue;
      expect(Object.keys(value).sort(), `pathnames["${internal}"]`).toEqual(locales);
    }
  });

  it("keeps slugs lowercase, ASCII and slash-prefixed", () => {
    const slugs = Object.values(routing.pathnames).flatMap((value) =>
      typeof value === "string" ? [value] : Object.values(value),
    );
    for (const slug of slugs) {
      expect(slug).toMatch(/^\/[a-z0-9\-/[\]]*$/);
    }
  });
});
