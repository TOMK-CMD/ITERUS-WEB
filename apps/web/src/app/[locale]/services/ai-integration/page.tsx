import { createServiceDetailPage } from "@/lib/pages/service-detail-page";

const { generateMetadata, Page } = createServiceDetailPage(
  "services-ai-integration",
  "/services/ai-integration",
);

export { generateMetadata };
export default Page;
