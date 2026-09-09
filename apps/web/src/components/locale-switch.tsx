"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/** Switches the locale while staying on the same page (internal pathname → localized slug). */
export function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("localeSwitch");

  return (
    <nav aria-label={t("label")}>
      <ul className="flex items-center gap-1 text-sm">
        {routing.locales.map((candidate) => (
          <li key={candidate}>
            {candidate === locale ? (
              <span
                aria-current="true"
                className="text-foreground rounded-md px-2 py-1 font-medium"
                lang={candidate}
              >
                {t(candidate)}
              </span>
            ) : (
              <Link
                href={pathname}
                locale={candidate}
                hrefLang={candidate}
                lang={candidate}
                className="text-muted-foreground hover:text-foreground focus-visible:outline-ring rounded-md px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {t(candidate)}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
