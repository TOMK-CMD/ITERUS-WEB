import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const paths = [
  "/",
  "/en",
  "/kontakt",
  "/en/contact",
  "/ochrana-osobnich-udaju",
  "/sluzby",
  "/en/services",
  "/sluzby/webove-aplikace",
  "/en/services/web-applications",
  "/sluzby/ai-integrace",
  "/en/services/ai-integration",
  "/sluzby/lokalni-llm",
  "/en/services/local-llm",
  "/sluzby/ceske-integrace",
  "/en/services/czech-integrations",
  "/sluzby/ninjatrader",
  "/en/services/ninjatrader",
  "/cena",
  "/en/pricing",
  "/o-nas",
  "/en/about",
  "/jak-pracujeme",
  "/en/process",
  "/reference",
  "/en/references",
];

for (const path of paths) {
  test(`${path} has no serious or critical accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
      .analyze();
    const blocking = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
    expect(
      blocking.map(
        (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
      ),
    ).toEqual([]);
  });
}
