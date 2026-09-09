import { expect, test } from "@playwright/test";

test("sitemap.xml lists both locales with hreflang alternates", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("xml");
  const xml = await response.text();
  expect(xml).toContain("<loc>https://iterus.cz/</loc>");
  expect(xml).toContain("<loc>https://iterus.cz/en</loc>");
  expect(xml).toContain('hreflang="x-default"');
  expect(xml).not.toContain("obchodni-podminky"); // drafts stay out of the sitemap
});

test("robots.txt welcomes AI crawlers and blocks only the API", async ({ request }) => {
  const text = await (await request.get("/robots.txt")).text();
  expect(text).toContain("User-Agent: GPTBot");
  expect(text).toContain("User-Agent: SeznamBot");
  expect(text).toContain("Disallow: /api/");
  expect(text).toContain("Sitemap: https://iterus.cz/sitemap.xml");
});

test("llms.txt is served and starts with the brand", async ({ request }) => {
  const response = await request.get("/llms.txt");
  expect(response.status()).toBe(200);
  expect(await response.text()).toMatch(/^# Iterus/);
});

test("the OG image route returns a PNG", async ({ request }) => {
  const response = await request.get("/og?title=Test%20%C4%8De%C5%A1tina&locale=cs");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
  expect((await response.body()).byteLength).toBeGreaterThan(5_000);
});

test("draft legal pages are noindex", async ({ page }) => {
  await page.goto("/ochrana-osobnich-udaju");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("status")).toContainText("Návrh");
});
