import { getLocale } from "next-intl/server";
import { facts } from "@/lib/facts";

/** The approved services list from content/facts.json — the page text must not drift from it. */
export async function ServicesList() {
  const locale = await getLocale();
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {facts.services.map((service) => (
        <li key={service.key} className="border-border bg-card rounded-lg border px-4 py-3">
          {locale === "cs" ? service.cs : service.en}
        </li>
      ))}
    </ul>
  );
}
