import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { JsonLd } from "@/components/json-ld";
import type { AppPathname } from "@/i18n/routing";
import { buildHowTo } from "@/lib/seo/json-ld";

type StepProps = { name: string; children: ReactNode };

/** One step, written as a child of <ProcessSteps> — same children-based pattern as <Faq>/<FaqItem>. */
export function Step({ name, children }: StepProps) {
  return (
    <li>
      <h3>{name}</h3>
      {children}
    </li>
  );
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

type Props = {
  name: string;
  description: string;
  href: AppPathname;
  children: ReactNode;
};

/** Renders its <Step> children as an ordered list and emits the page's `HowTo` JSON-LD. */
export async function ProcessSteps({ name, description, href, children }: Props) {
  const locale = await getLocale();
  const steps = Children.toArray(children)
    .filter((child): child is ReactElement<StepProps> => isValidElement(child))
    .map((child) => ({ name: child.props.name, text: textOf(child.props.children) }));

  return (
    <>
      <ol>{children}</ol>
      <JsonLd data={buildHowTo(locale as "cs" | "en", href, { name, description }, steps)} />
    </>
  );
}
