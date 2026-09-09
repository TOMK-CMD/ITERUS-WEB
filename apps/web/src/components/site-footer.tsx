// next/link on purpose (not the next-intl Link): the hrefs arrive already localized from
// getPathname() in the layout, which keeps this component free of i18n context for unit tests.
import Link from "next/link";
import type { Locale } from "@/i18n/routing";
import { legalLine, tagline } from "@/lib/facts";

export type FooterLink = { href: string; label: string };

type Props = {
  locale: Locale;
  navLabel: string;
  /** Pre-localized hrefs (the layout resolves them with `getPathname`). */
  links: FooterLink[];
};

/**
 * Site footer. Presentational on purpose — no i18n context needed — so it can be unit tested.
 * The legal line is mandatory on every page (CLAUDE.md → Content and brand rules).
 */
export function SiteFooter({ locale, navLabel, links }: Props) {
  return (
    <footer className="border-border mt-16 border-t">
      <div className="text-muted-foreground mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 text-sm md:flex-row md:items-start md:justify-between">
        <p>
          <span className="text-foreground font-semibold">Iterus</span>
          <span aria-hidden="true"> — </span>
          {tagline(locale)}
        </p>
        <nav aria-label={navLabel}>
          <ul className="flex gap-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-foreground focus-visible:outline-ring rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p data-testid="legal-line">{legalLine(locale)}</p>
      </div>
    </footer>
  );
}
