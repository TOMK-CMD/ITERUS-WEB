import { getLocale } from "next-intl/server";
import { getCardProjects } from "@/lib/content/reference-cards";

/**
 * "Na čem dál pracujeme" — one line, a status label and a technical hook per card-tier project,
 * no business numbers. The page's `CollectionPage` JSON-LD is built separately in `page.tsx`
 * (from the same `getCardProjects` data) so it can use the page's own title/description.
 */
export async function ReferenceCards() {
  const locale = await getLocale();
  const cards = getCardProjects(locale);

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {cards.map((card) => (
        <li key={card.name} className="border-border bg-card rounded-lg border p-4">
          <p className="font-semibold">{card.name}</p>
          <p className="text-muted-foreground text-sm">{card.status}</p>
          <p className="mt-2 text-sm">{card.hook}</p>
        </li>
      ))}
    </ul>
  );
}
