import { getTranslations } from "next-intl/server";
import { factOrNull } from "@/lib/facts";

/**
 * Cal.com call-to-action. Renders only when NEXT_PUBLIC_CALCOM_LINK is set — no dead buttons.
 * A full inline embed can replace the link once the booking page exists (Sprint 1).
 */
export async function CalcomCta() {
  const link = factOrNull(process.env.NEXT_PUBLIC_CALCOM_LINK);
  if (!link) return null;
  const t = await getTranslations("contact.calcom");

  return (
    <section
      aria-labelledby="calcom-heading"
      className="border-border bg-card rounded-lg border p-6"
    >
      <h2 id="calcom-heading" className="text-xl font-semibold">
        {t("title")}
      </h2>
      <p className="text-muted-foreground mt-2">{t("text")}</p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-primary text-primary-foreground focus-visible:outline-ring mt-4 inline-flex rounded-md px-4 py-2 font-medium hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t("cta")}
      </a>
    </section>
  );
}
