import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Loads ./src/i18n/request.ts (default path) for Server Components.
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
