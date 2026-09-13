import { createServiceDetailPage } from "@/lib/pages/service-detail-page";

const { generateMetadata, Page } = createServiceDetailPage(
  "services-czech-integrations",
  "/services/czech-integrations",
);

export { generateMetadata };
export default Page;
