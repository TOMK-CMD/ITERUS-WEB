import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests run in Node by default; component tests opt into jsdom with a
// `/** @vitest-environment jsdom */` docblock at the top of the file.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "node",
    server: {
      // next-intl imports extension-less `next/navigation`; let Vite resolve it instead of Node.
      deps: { inline: ["next-intl"] },
    },
  },
});
