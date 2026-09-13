import type { MDXComponents } from "mdx/types";
import { Faq, FaqItem } from "./faq";
import { HowWeWork } from "./how-we-work";
import { NotOffered } from "./not-offered";
import { ServicesList } from "./services-list";

/** Components available inside content/**\/*.mdx. Add facts-driven blocks here, never inline data. */
export const mdxComponents: MDXComponents = {
  ServicesList,
  HowWeWork,
  Faq,
  FaqItem,
  NotOffered,
};
