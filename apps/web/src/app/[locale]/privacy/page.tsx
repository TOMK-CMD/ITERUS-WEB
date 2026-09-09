import type { Metadata } from "next";
import { LegalArticle, legalMetadata } from "@/components/legal-page";

type Props = { params: Promise<{ locale: string }> };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return legalMetadata(params, "privacy");
}

export default function PrivacyPage({ params }: Props) {
  return <LegalArticle params={params} slug="privacy" />;
}
