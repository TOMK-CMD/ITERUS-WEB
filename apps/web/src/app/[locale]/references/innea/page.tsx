import { createCaseStudyPage } from "@/lib/pages/case-study-page";

const { generateMetadata, Page } = createCaseStudyPage({
  slug: "references-innea",
  href: "/references/innea",
  project: "innea",
});

export { generateMetadata };
export default Page;
