import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Loads ./src/i18n/request.ts (default path) for Server Components.
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @iterus/ui ships raw TypeScript from the workspace; Next must compile it.
  transpilePackages: ["@iterus/ui"],
};

export default withNextIntl(nextConfig);
