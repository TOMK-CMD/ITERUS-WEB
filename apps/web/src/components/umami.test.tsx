/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Umami } from "./umami";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("Umami", () => {
  it("renders nothing without NEXT_PUBLIC_UMAMI_SCRIPT_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_UMAMI_SCRIPT_URL", "");
    vi.stubEnv("NEXT_PUBLIC_UMAMI_WEBSITE_ID", "a1b2c3d4-e5f6-7890-abcd-ef1234567890");
    const { container } = render(<Umami />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing without NEXT_PUBLIC_UMAMI_WEBSITE_ID", () => {
    vi.stubEnv("NEXT_PUBLIC_UMAMI_SCRIPT_URL", "https://analytics.example.com/script.js");
    vi.stubEnv("NEXT_PUBLIC_UMAMI_WEBSITE_ID", "");
    const { container } = render(<Umami />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the script tag for the configured instance and website", () => {
    vi.stubEnv("NEXT_PUBLIC_UMAMI_SCRIPT_URL", "https://analytics.example.com/script.js");
    vi.stubEnv("NEXT_PUBLIC_UMAMI_WEBSITE_ID", "a1b2c3d4-e5f6-7890-abcd-ef1234567890");
    const { container } = render(<Umami />);
    // next/script injects into document.head in the browser; in jsdom the element is inline.
    const script =
      container.querySelector("script") ??
      document.querySelector('script[data-website-id="a1b2c3d4-e5f6-7890-abcd-ef1234567890"]');
    expect(script?.getAttribute("data-website-id")).toBe("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
    expect(script?.getAttribute("src")).toBe("https://analytics.example.com/script.js");
  });
});
