import type { MDXComponents } from "mdx/types";
import { HowWeWork } from "./how-we-work";
import { ServicesList } from "./services-list";

/** Components available inside content/**\/*.mdx. Add facts-driven blocks here, never inline data. */
export const mdxComponents: MDXComponents = {
  ServicesList,
  HowWeWork,
};
