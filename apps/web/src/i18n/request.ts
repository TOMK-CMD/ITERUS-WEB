import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { routing } from "./routing";

// Resolves the locale for Server Components. With `next/root-params` (Next.js 16.3+) the
// `[locale]` segment is readable without `setRequestLocale`, so pages stay statically rendered.
export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const value = await rootParams.locale();
    if (hasLocale(routing.locales, value)) {
      locale = value;
    } else {
      notFound();
    }
  }

  return {
    locale,
    messages: (await import(`../../../../messages/${locale}.json`)).default,
  };
});
