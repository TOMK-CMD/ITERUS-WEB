import Script from "next/script";

/**
 * Plausible (cookieless, no consent banner needed). Renders nothing unless
 * NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set at build time, so previews and local runs stay silent.
 */
export function Plausible() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
