import { getLocale } from "next-intl/server";
import { howWeWork } from "@/lib/facts";

/** Approved wording about the AI-native way of working (never paraphrased in MDX). */
export async function HowWeWork() {
  const locale = await getLocale();
  return <p className="text-lg">{howWeWork(locale)}</p>;
}
