import { getLocale } from "next-intl/server";
import { facts } from "@/lib/facts";

/** What we deliberately don't build (`facts.json → not_offered`) — a trust signal and lead filter. */
export async function NotOffered() {
  const locale = await getLocale();
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {facts.not_offered.map((item) => (
        <li
          key={item.key}
          className="text-muted-foreground border-border rounded-lg border px-4 py-2"
        >
          {locale === "cs" ? item.cs : item.en}
        </li>
      ))}
    </ul>
  );
}
