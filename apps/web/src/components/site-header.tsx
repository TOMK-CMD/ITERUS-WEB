import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitch } from "./locale-switch";

export async function SiteHeader() {
  const t = await getTranslations();

  return (
    <header className="border-border border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-foreground text-lg font-semibold tracking-tight">
          {t("common.brand")}
        </Link>
        <div className="flex items-center gap-6">
          <nav aria-label={t("nav.label")}>
            <ul className="flex items-center gap-4 text-sm">
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </nav>
          <LocaleSwitch />
        </div>
      </div>
    </header>
  );
}
