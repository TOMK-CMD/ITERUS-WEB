import { createServiceDetailPage } from "@/lib/pages/service-detail-page";

const { generateMetadata, Page } = createServiceDetailPage(
  "services-web-applications",
  "/services/web-applications",
);

export { generateMetadata };
export default Page;
