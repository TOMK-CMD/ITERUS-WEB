import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { facts, howWeWork } from "@/lib/facts";

type Statement = "approved" | "review-yield" | "human-lead";

const STATEMENTS: Record<Exclude<Statement, "approved">, Record<Locale, string>> = {
  "review-yield": {
    cs: facts.how_we_work.review_yield_cs,
    en: facts.how_we_work.review_yield_en,
  },
  "human-lead": {
    cs: facts.how_we_work.human_lead_cs,
    en: facts.how_we_work.human_lead_en,
  },
};

/**
 * Approved wording about the AI-native way of working (never paraphrased in MDX). `statement`
 * selects which `facts.json → how_we_work` sentence renders: the approved claim (default) or one
 * of Tomas's approved supplementary statements — figures and wording that must never be retyped
 * in prose.
 */
export async function HowWeWork({ statement = "approved" }: { statement?: Statement }) {
  const locale = (await getLocale()) as Locale;
  if (statement === "approved") return <p className="text-lg">{howWeWork(locale)}</p>;
  // MDX passes an unchecked string; a typo must fail the build with a readable message.
  if (!(statement in STATEMENTS)) throw new Error(`HowWeWork: unknown statement "${statement}"`);
  return <p>{STATEMENTS[statement][locale]}</p>;
}
