type MdastNode = { type: string; value?: string; children?: MdastNode[] };

const NBSP = " ";

// Czech one-letter prepositions and conjunctions that must never be orphaned at the end of a
// line: a, i, k, o, s, u, v, z (docs/CONTENT-GUIDE.md → Style). `\s+` also catches a source
// line-wrap (a literal newline from prose wrapped across lines), which reads identically to a
// plain space once rendered.
const ONE_LETTER_WORD = /\b([aikosuvzAIKOSUVZ])\s+(?=\S|$)/g;

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
