import Script from "next/script";

/**
 * Umami (self-hosted, cookieless, no consent banner needed). Renders nothing unless both
 * NEXT_PUBLIC_UMAMI_SCRIPT_URL and NEXT_PUBLIC_UMAMI_WEBSITE_ID are set at build time, so
 * previews and local runs stay silent.
 */
export function Umami() {
  const src = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!src || !websiteId) return null;
  return <Script defer data-website-id={websiteId} src={src} strategy="afterInteractive" />;
}
