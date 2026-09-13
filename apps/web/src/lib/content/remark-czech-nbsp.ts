type MdastNode = { type: string; value?: string; children?: MdastNode[] };

const NBSP = " ";

// Czech one-letter prepositions and conjunctions that must never be orphaned at the end of a
// line: a, i, k, o, s, u, v, z (docs/CONTENT-GUIDE.md → Style). `\s+` also catches a source
// line-wrap (a literal newline from prose wrapped across lines), which reads identically to a
// plain space once rendered.
//
// The lookbehind is Unicode-aware on purpose: JS's `\b` is ASCII-only (`\w` = [A-Za-z0-9_]), so a
// diacritic (á, č, ě, í, ř, š, ..., all outside `\w`) right before a target letter creates a false
// word boundary there — e.g. the "k" ending "člověk" would look like the standalone word "k" and
// get glued to whatever follows. `[^\p{L}\p{N}]` (or start of string) is the real "not part of a
// word" boundary regardless of script.
const ONE_LETTER_WORD = /(?<=^|[^\p{L}\p{N}])([aikosuvzAIKOSUVZ])\s+(?=\S|$)/gu;

function applyTo(node: MdastNode): void {
  // Only plain prose text — leave `inlineCode`/`code` node values untouched.
  if (node.type === "text" && typeof node.value === "string") {
    node.value = node.value.replace(ONE_LETTER_WORD, `$1${NBSP}`);
  }
  node.children?.forEach(applyTo);
}

/**
 * remark plugin: replaces the space after a one-letter Czech preposition/conjunction with a
 * non-breaking space. Czech-only — wire it into `loadPage`/`compileMDX` for the `cs` locale, not
 * `en` (the rule doesn't exist in English typography).
 */
export function remarkCzechNbsp() {
  return (tree: MdastNode) => {
    applyTo(tree);
  };
}
