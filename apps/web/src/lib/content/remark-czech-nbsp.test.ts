import { describe, expect, it } from "vitest";
import { remarkCzechNbsp } from "./remark-czech-nbsp";

type Node = { type: string; value?: string; children?: Node[] };

function text(value: string): Node {
  return { type: "text", value };
}

function paragraph(...children: Node[]): Node {
  return { type: "paragraph", children };
}

function root(...children: Node[]): Node {
  return { type: "root", children };
}

describe("remarkCzechNbsp", () => {
  it("replaces the space after every one-letter preposition/conjunction with a non-breaking space", () => {
    const tree = root(paragraph(text("Šel jsem k domu a pak v lese, i o půlnoci.")));
    remarkCzechNbsp()(tree);
    expect(tree.children![0].children![0].value).toBe("Šel jsem k domu a pak v lese, i o půlnoci.");
  });

  it("handles a source line-wrap (newline) the same as a literal space", () => {
    const tree = root(paragraph(text("Pracujeme v\nprovozu.")));
    remarkCzechNbsp()(tree);
    expect(tree.children![0].children![0].value).toBe("Pracujeme v provozu.");
  });

  it("adds a non-breaking space at the end of a text node, before a sibling element", () => {
    const tree = root(
      paragraph(text("Odkaz je k "), { type: "strong", children: [text("dispozici")] }),
    );
    remarkCzechNbsp()(tree);
    expect(tree.children![0].children![0].value).toBe("Odkaz je k ");
  });

  it("leaves capitalised one-letter words (sentence start) covered too", () => {
    const tree = root(paragraph(text("V lese bylo ticho.")));
    remarkCzechNbsp()(tree);
    expect(tree.children![0].children![0].value).toBe("V lese bylo ticho.");
  });

  it("does not touch longer words that merely start with the same letter", () => {
    const tree = root(paragraph(text("koupit a stavět verze")));
    remarkCzechNbsp()(tree);
    expect(tree.children![0].children![0].value).toBe("koupit a stavět verze");
  });

  it("does not touch inlineCode or code node values", () => {
    const tree = root({ type: "inlineCode", value: "k value" } as Node);
    remarkCzechNbsp()(tree);
    expect(tree.children![0].value).toBe("k value");
  });

  it("is idempotent — running it twice does not double up nbsp characters", () => {
    const tree = root(paragraph(text("Šel jsem k domu.")));
    remarkCzechNbsp()(tree);
    remarkCzechNbsp()(tree);
    expect(tree.children![0].children![0].value).toBe("Šel jsem k domu.");
  });
});
