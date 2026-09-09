import type { Metadata } from "next";
import { LegalArticle, legalMetadata } from "@/components/legal-page";

type Props = { params: Promise<{ locale: string }> };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return legalMetadata(params, "terms");
}

export default function TermsPage({ params }: Props) {
  return <LegalArticle params={params} slug="terms" />;
}
