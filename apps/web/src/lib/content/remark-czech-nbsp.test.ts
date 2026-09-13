import { describe, expect, it } from "vitest";
import { remarkCzechNbsp } from "./remark-czech-nbsp";

type Node = { type: string; value?: string; children?: Node[] };
const NBSP = " ";

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
    expect(tree.children![0].children![0].value).toBe(
      `Šel jsem k${NBSP}domu a${NBSP}pak v${NBSP}lese, i${NBSP}o${NBSP}půlnoci.`,
    );
  });

  it("handles a source line-wrap (newline) the same as a literal space", () => {
    const tree = root(paragraph(text("Pracujeme v\nprovozu.")));
    remarkCzechNbsp()(tree);
    expect(tree.children![0].children![0].value).toBe(`Pracujeme v${NBSP}provozu.`);
  });

  it("adds a non-breaking space at the end of a text node, before a sibling element", () => {
    const tree = root(
      paragraph(text("Odkaz je k "), { type: "strong", children: [text("dispozici")] }),
    );
    remarkCzechNbsp()(tree);
    expect(tree.children![0].children![0].value).toBe(`Odkaz je k${NBSP}`);
  });

  it("leaves capitalised one-letter words (sentence start) covered too", () => {
    const tree = root(paragraph(text("V lese bylo ticho.")));
    remarkCzechNbsp()(tree);
    expect(tree.children![0].children![0].value).toBe(`V${NBSP}lese bylo ticho.`);
  });

  it("does not touch longer words that merely start with the same letter", () => {
    const tree = root(paragraph(text("koupit a stavět verze")));
    remarkCzechNbsp()(tree);
    expect(tree.children![0].children![0].value).toBe(`koupit a${NBSP}stavět verze`);
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
    expect(tree.children![0].children![0].value).toBe(`Šel jsem k${NBSP}domu.`);
  });

  // Regression: JS's `\b` is ASCII-only ([A-Za-z0-9_]), so a diacritic right before a target
  // letter used to create a false word boundary there — the plugin would treat the last letter
  // of an ordinary word as if it were the standalone preposition and glue it to the next word.
  // Found by the reviewer subagent against the real built site (/o-nas, /sluzby/ai-integrace).
  describe("word boundaries next to diacritics (regression)", () => {
    it("does not glue the trailing 'k' of 'člověk' to the next word", () => {
      const tree = root(paragraph(text("Jádro tvoří jeden člověk s AI nástroji")));
      remarkCzechNbsp()(tree);
      expect(tree.children![0].children![0].value).toBe(
        `Jádro tvoří jeden člověk s${NBSP}AI nástroji`,
      );
    });

    it("does not touch 'člověk' when the next word is not a one-letter preposition either", () => {
      const tree = root(paragraph(text("Odpovědi kontroluje člověk dřív, než")));
      remarkCzechNbsp()(tree);
      expect(tree.children![0].children![0].value).toBe("Odpovědi kontroluje člověk dřív, než");
    });

    it("does not touch the real preposition 'při' (ends in a diacritic + vowel)", () => {
      const tree = root(paragraph(text("přesto chtějí těžit z AI při vyhledávání")));
      remarkCzechNbsp()(tree);
      expect(tree.children![0].children![0].value).toBe(
        `přesto chtějí těžit z${NBSP}AI při vyhledávání`,
      );
    });

    it("does not touch a masculine possessive ending in a target letter ('Otcův')", () => {
      const tree = root(paragraph(text("Otcův dům")));
      remarkCzechNbsp()(tree);
      expect(tree.children![0].children![0].value).toBe("Otcův dům");
    });

    it("does not touch an agentive noun ending in a target letter ('pracovník')", () => {
      const tree = root(paragraph(text("pracovník v IT")));
      remarkCzechNbsp()(tree);
      expect(tree.children![0].children![0].value).toBe(`pracovník v${NBSP}IT`);
    });
  });
});
