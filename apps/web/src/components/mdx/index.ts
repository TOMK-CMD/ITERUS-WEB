import type { MDXComponents } from "mdx/types";
import { Link } from "@/i18n/navigation";
import { Faq, FaqItem } from "./faq";
import { HowWeWork } from "./how-we-work";
import { NotOffered } from "./not-offered";
import { PricingBands } from "./pricing-bands";
import { ProcessSteps, Step } from "./process-steps";
import { ReferenceCards } from "./reference-cards";
import { ServicesList } from "./services-list";

/** Components available inside content/**\/*.mdx. Add facts-driven blocks here, never inline data. */
export const mdxComponents: MDXComponents = {
  ServicesList,
  HowWeWork,
  Faq,
  FaqItem,
  NotOffered,
  PricingBands,
  ProcessSteps,
  Step,
  ReferenceCards,
  // Locale-aware internal link for cross-page references in MDX prose — takes the internal
  // pathname (e.g. `/process`), never a raw locale-specific slug. See `@/i18n/navigation`.
  PageLink: Link,
};
