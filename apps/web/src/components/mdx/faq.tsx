import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { JsonLd } from "@/components/json-ld";
import { buildFAQPage } from "@/lib/seo/json-ld";

type FaqItemProps = { question: string; children: ReactNode };

/**
 * One FAQ entry. Written as a child of <Faq> rather than a data prop: next-mdx-remote strips
 * JS expression attributes from MDX by default (a defence for untrusted remote content — see
 * `blockJS` in its `serialize` options), so content authors pass plain JSX children and string
 * attributes instead of an `items={[...]}` array.
 */
export function FaqItem({ question, children }: FaqItemProps) {
  // `children` is already a <p> once MDX parses the block text between the tags as markdown —
  // wrapping it in another <p> here produces invalid `<p><p>` nesting and a hydration mismatch.
  return (
    <div>
      <h3>{question}</h3>
      {children}
    </div>
  );
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

/** FAQ block: renders its <FaqItem> children and emits their `FAQPage` JSON-LD. */
export function Faq({ children }: { children: ReactNode }) {
  const items = Children.toArray(children)
    .filter((child): child is ReactElement<FaqItemProps> => isValidElement(child))
    .map((child) => ({ question: child.props.question, answer: textOf(child.props.children) }));

  return (
    <>
      {children}
      <JsonLd data={buildFAQPage(items)} />
    </>
  );
}
