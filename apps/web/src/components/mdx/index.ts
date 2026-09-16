import type { MDXComponents } from "mdx/types";
import { Link } from "@/i18n/navigation";
import { CaseStudyList } from "./case-study-list";
import { Faq, FaqItem } from "./faq";
import { HowWeWork } from "./how-we-work";
import { NotOffered } from "./not-offered";
import { PricingBands } from "./pricing-bands";
import { ProcessSteps, Step } from "./process-steps";
import { ProjectMetrics } from "./project-metrics";
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
  CaseStudyList,
  ProjectMetrics,
  // Locale-aware internal link for cross-page references in MDX prose — takes the internal
  // pathname (e.g. `/process`), never a raw locale-specific slug. See `@/i18n/navigation`.
  PageLink: Link,
};
