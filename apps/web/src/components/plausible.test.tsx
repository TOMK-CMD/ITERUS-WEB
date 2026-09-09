/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Plausible } from "./plausible";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("Plausible", () => {
  it("renders nothing without NEXT_PUBLIC_PLAUSIBLE_DOMAIN", () => {
    vi.stubEnv("NEXT_PUBLIC_PLAUSIBLE_DOMAIN", "");
    const { container } = render(<Plausible />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the script tag for the configured domain", () => {
    vi.stubEnv("NEXT_PUBLIC_PLAUSIBLE_DOMAIN", "iterus.cz");
    const { container } = render(<Plausible />);
    // next/script injects into document.head in the browser; in jsdom the element is inline.
    const script =
      container.querySelector("script") ??
      document.querySelector('script[data-domain="iterus.cz"]');
    expect(script?.getAttribute("data-domain")).toBe("iterus.cz");
    expect(script?.getAttribute("src")).toBe("https://plausible.io/js/script.js");
  });
});
