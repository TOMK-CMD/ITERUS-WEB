import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Loads ./src/i18n/request.ts (default path) for Server Components.
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @iterus/ui ships raw TypeScript from the workspace; Next must compile it.
  transpilePackages: ["@iterus/ui"],
  // content/ and messages/ live at the repository root; make sure serverless bundles carry them.
  outputFileTracingIncludes: { "/**": ["../../content/**/*", "../../messages/**/*"] },
};

export default withNextIntl(nextConfig);
