import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContentError, listPages, loadPage, readPage } from "./loader";

const contentDir = fileURLToPath(new URL("./__fixtures__", import.meta.url));
// A separate root for broken content: a single invalid page must fail listing loudly, so it
// cannot live next to the valid fixtures.
const brokenDir = fileURLToPath(new URL("./__fixtures__/broken", import.meta.url));

describe("readPage", () => {
  it("parses frontmatter and strips it from the body", async () => {
    const page = await readPage("cs", "valid", { contentDir });
    expect(page.frontmatter).toEqual({
      title: "Testovací stránka",
      description:
        "Testovací popis stránky, který má přesně tolik znaků, kolik pravidla obsahu vyžadují pro meta description — mezi sto dvaceti a sto padesáti pěti.",
      updated: "2026-09-09",
      type: "page",
      status: "published",
    });
    expect(page.body).not.toContain("title:");
    expect(page.body).toContain("# Nadpis");
    expect(page.file).toBe("__fixtures__/cs/valid.mdx");
  });

  it("rejects a page with missing or invalid keys and names the file", async () => {
    const options = { contentDir: brokenDir };
    await expect(readPage("cs", "invalid", options)).rejects.toThrowError(ContentError);
    await expect(readPage("cs", "invalid", options)).rejects.toThrowError(
      /broken\/cs\/invalid\.mdx: invalid frontmatter — description/,
    );
  });

  it("makes listing fail loudly when any page is invalid (a broken page must break the build)", async () => {
    await expect(listPages("cs", { contentDir: brokenDir })).rejects.toThrowError(ContentError);
  });

  it("reports a missing page", async () => {
    await expect(readPage("en", "nope", { contentDir })).rejects.toThrowError(/page not found/);
  });
});

describe("listPages", () => {
  it("lists published pages only by default, drafts on request", async () => {
    const published = await listPages("cs", { contentDir });
    expect(published.map((page) => page.slug)).toEqual(["valid"]);

    const all = await listPages("cs", { contentDir, includeDrafts: true });
    expect(all.map((page) => page.slug)).toEqual(["draft", "valid"]);
  });
});

describe("loadPage", () => {
  it("compiles MDX to React with custom components", async () => {
    const Badge = () => "custom-component-rendered";
    const page = await loadPage("cs", "valid", { Badge }, { contentDir });
    const html = renderToStaticMarkup(page.content);
    expect(html).toContain("<h1>Nadpis</h1>");
    expect(html).toContain("custom-component-rendered");
  });
});
