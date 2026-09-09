import type { routing } from "@/i18n/routing";
import type messages from "../../../messages/cs.json";

// Typed locales, pathnames and message keys for next-intl (`useTranslations("nav")` etc.).
// Czech is the reference message file; `pnpm check:i18n` keeps en in parity.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Pathnames: typeof routing.pathnames;
    Messages: typeof messages;
  }
}
