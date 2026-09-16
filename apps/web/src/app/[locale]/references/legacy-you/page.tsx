import { createCaseStudyPage } from "@/lib/pages/case-study-page";

const { generateMetadata, Page } = createCaseStudyPage({
  slug: "references-legacy-you",
  href: "/references/legacy-you",
  project: "legacy-you",
});

export { generateMetadata };
export default Page;
