import { expect, test, type Page } from "@playwright/test";
import facts from "../../../content/facts.json" with { type: "json" };

const SITE = "https://iterus.cz";

type Case = {
  path: string;
  locale: "cs" | "en";
  canonical: string;
  alternates: { cs: string; en: string };
};

const cases: Case[] = [
  {
    path: "/",
    locale: "cs",
    canonical: `${SITE}/`,
    alternates: { cs: `${SITE}/`, en: `${SITE}/en` },
  },
  {
    path: "/en",
    locale: "en",
    canonical: `${SITE}/en`,
    alternates: { cs: `${SITE}/`, en: `${SITE}/en` },
  },
  {
    path: "/kontakt",
    locale: "cs",
    canonical: `${SITE}/kontakt`,
    alternates: { cs: `${SITE}/kontakt`, en: `${SITE}/en/contact` },
  },
  {
    path: "/en/contact",
    locale: "en",
    canonical: `${SITE}/en/contact`,
    alternates: { cs: `${SITE}/kontakt`, en: `${SITE}/en/contact` },
  },
];

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

for (const c of cases) {
  test(`${c.path} renders in ${c.locale} with correct metadata and the legal footer`, async ({
    page,
  }) => {
    const errors = collectErrors(page);
    const response = await page.goto(c.path);
    expect(response?.status()).toBe(200);

    await expect(page.locator("html")).toHaveAttribute("lang", c.locale);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", c.canonical);
    await expect(page.locator('link[rel="alternate"][hreflang="cs"]')).toHaveAttribute(
      "href",
      c.alternates.cs,
    );
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
      "href",
      c.alternates.en,
    );
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
      "href",
      c.alternates.cs,
    );

    const legal = c.locale === "cs" ? facts.brand.legal_line_cs : facts.brand.legal_line_en;
    await expect(page.locator("footer")).toContainText(legal);
    await expect(page.locator("main h1")).toBeVisible();

    expect(errors, `console/page errors on ${c.path}`).toEqual([]);
  });
}

test("the locale switch keeps the current page", async ({ page }) => {
  await page.goto("/kontakt");
  await page
    .getByRole("navigation", { name: "Jazyk" })
    .getByRole("link", { name: "English" })
    .click();
  await expect(page).toHaveURL(/\/en\/contact$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page
    .getByRole("navigation", { name: "Language" })
    .getByRole("link", { name: "Čeština" })
    .click();
  await expect(page).toHaveURL(/\/kontakt$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "cs");
});

test("/cs redirects to the unprefixed Czech root", async ({ request }) => {
  const response = await request.get("/cs", { maxRedirects: 0 });
  expect([301, 302, 307, 308]).toContain(response.status());
  expect(response.headers().location).toMatch(/\/$/);
});

test("unknown paths render the localized 404 with the legal footer", async ({ page }) => {
  const response = await page.goto("/en/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("footer")).toContainText(facts.brand.legal_line_en);
});

test("responses set no cookies (no locale cookie, CDN-cacheable)", async ({ request }) => {
  for (const path of ["/", "/en", "/kontakt", "/en/does-not-exist"]) {
    const response = await request.get(path);
    expect(response.headers()["set-cookie"], path).toBeUndefined();
  }
});

test("paths that merely start with og/api/icon stay localized", async ({ page }) => {
  const response = await page.goto("/ogloop");
  expect(response?.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "cs");
  await expect(page.locator("footer")).toContainText(facts.brand.legal_line_cs);
});
