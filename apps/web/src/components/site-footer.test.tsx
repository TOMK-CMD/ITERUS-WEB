/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { facts } from "@/lib/facts";
import { SiteFooter } from "./site-footer";

afterEach(cleanup);

const links = [
  { href: "/", label: "Úvod" },
  { href: "/kontakt", label: "Kontakt" },
];

describe("SiteFooter", () => {
  it("renders the Czech legal line with the company ID", () => {
    render(<SiteFooter locale="cs" navLabel="Patička" links={links} />);
    expect(screen.getByTestId("legal-line").textContent).toBe(facts.brand.legal_line_cs);
    expect(screen.getByText(/IČO 27159884/)).toBeTruthy();
  });

  it("renders the English legal line", () => {
    render(<SiteFooter locale="en" navLabel="Footer" links={links} />);
    expect(screen.getByTestId("legal-line").textContent).toBe(facts.brand.legal_line_en);
    expect(screen.getByText(/Company ID 27159884/)).toBeTruthy();
  });

  it("renders the navigation links it is given", () => {
    render(<SiteFooter locale="cs" navLabel="Patička" links={links} />);
    const nav = screen.getByRole("navigation", { name: "Patička" });
    const anchors = nav.querySelectorAll("a");
    expect([...anchors].map((a) => a.getAttribute("href"))).toEqual(["/", "/kontakt"]);
  });
});
