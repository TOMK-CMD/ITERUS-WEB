import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 network boundary (formerly middleware.ts): negotiates the locale, redirects
// "/cs/…" to "/…" (as-needed prefix) and adds hreflang `Link` headers.
export default createMiddleware(routing);

export const config = {
  // Skip API routes, the OG image route, Next/Vercel internals and files with an extension.
  matcher: "/((?!api|og|_next|_vercel|.*\\..*).*)",
};
