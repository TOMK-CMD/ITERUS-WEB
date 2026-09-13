import { createServiceDetailPage } from "@/lib/pages/service-detail-page";

const { generateMetadata, Page } = createServiceDetailPage(
  "services-local-llm",
  "/services/local-llm",
);

export { generateMetadata };
export default Page;
