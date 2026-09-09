import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 network boundary (formerly middleware.ts): negotiates the locale, redirects
// "/cs/…" to "/…" (as-needed prefix) and adds hreflang `Link` headers.
export default createMiddleware(routing);

export const config = {
  // Skip API routes, generated images (/og, /icon), Next/Vercel internals and files with an
  // extension. Anchored so that a future page such as /ogloop or /iconography is still localized.
  matcher: "/((?!api/|og(?:/|$)|icon(?:/|$)|_next|_vercel|.*\\..*).*)",
};
