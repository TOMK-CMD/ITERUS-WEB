import { createServiceDetailPage } from "@/lib/pages/service-detail-page";

const { generateMetadata, Page } = createServiceDetailPage(
  "services-ninjatrader",
  "/services/ninjatrader",
);

export { generateMetadata };
export default Page;
