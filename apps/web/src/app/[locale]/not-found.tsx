import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-12">
      <h1>{t("title")}</h1>
      <p>{t("text")}</p>
      <Link href="/">{t("home")}</Link>
    </main>
  );
}
