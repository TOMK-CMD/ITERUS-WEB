import { isValidElement, type ReactNode } from "react";

/**
 * Flattens a React node tree to plain text for JSON-LD (FAQPage answers, HowToStep text).
 * Collapses the line-wrap whitespace MDX source introduces — without it, a multi-line MDX
 * paragraph produces literal "\n" characters mid-sentence in the published structured data.
 */
export function textOf(node: ReactNode): string {
  return flatten(node).replace(/\s+/g, " ").trim();
}

function flatten(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flatten).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return flatten(node.props.children);
  return "";
}
