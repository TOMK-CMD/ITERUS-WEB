import { createCaseStudyPage } from "@/lib/pages/case-study-page";

const { generateMetadata, Page } = createCaseStudyPage({
  slug: "references-innea-pro",
  href: "/references/innea-pro",
  project: "innea-pro",
});

export { generateMetadata };
export default Page;
