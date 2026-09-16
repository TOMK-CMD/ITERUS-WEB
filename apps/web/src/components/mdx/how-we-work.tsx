import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { facts, howWeWork } from "@/lib/facts";

type Statement = "approved" | "review-yield";

/**
 * Approved wording about the AI-native way of working (never paraphrased in MDX). `statement`
 * selects which `facts.json → how_we_work` sentence renders: the approved claim (default) or
 * the measured review-yield counterpart — a number that must never be retyped in prose.
 */
export async function HowWeWork({ statement = "approved" }: { statement?: Statement }) {
  const locale = (await getLocale()) as Locale;
  if (statement === "review-yield") {
    const text =
      locale === "cs" ? facts.how_we_work.review_yield_cs : facts.how_we_work.review_yield_en;
    return <p>{text}</p>;
  }
  return <p className="text-lg">{howWeWork(locale)}</p>;
}
