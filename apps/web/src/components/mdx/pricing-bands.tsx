import { getLocale } from "next-intl/server";
import { facts } from "@/lib/facts";

function formatCzk(value: number): string {
  return new Intl.NumberFormat("cs-CZ").format(value);
}

/**
 * Renders the approved price bands, consultation and discovery terms from
 * `facts.json → pricing`. Never reads `reference_rate_*` — the hourly rate is
 * `reference_rate_internal_only` and stays unpublished until Tomas approves it.
 */
export async function PricingBands() {
  const locale = await getLocale();
  const { bands, consultation, discovery } = facts.pricing;

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-3">
        {bands.map((band) => (
          <li key={band.key} className="border-border bg-card rounded-lg border p-4">
            <p className="font-semibold">{locale === "cs" ? band.cs : band.en}</p>
            <p className="text-lg">
              {locale === "cs" ? "od " : "from "}
              {formatCzk(band.from_czk)}
              {band.to_czk !== null ? ` – ${formatCzk(band.to_czk)}` : ""} {facts.pricing.currency}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {locale === "cs" ? band.includes_cs : band.includes_en}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-4">{locale === "cs" ? consultation.cs : consultation.en}</p>
      <p>{locale === "cs" ? discovery.cs : discovery.en}</p>
    </>
  );
}
