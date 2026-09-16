import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { facts } from "@/lib/facts";

type Metric = { key: string; value: number; label_cs: string; label_en: string };
type WithMetrics = { metrics?: Metric[]; metrics_confirmed?: boolean };

const NUMBER_LOCALE: Record<Locale, string> = { cs: "cs-CZ", en: "en-GB" };

/**
 * The numbers block of a case study — every figure comes from `facts.json →
 * projects[project].metrics` and nowhere else, so a number on a page always has exactly one
 * source. Throws — failing the static build loudly — unless Tomas confirmed the set
 * (`metrics_confirmed: true`); the unit test on facts.json enforces the same rule in `pnpm check`.
 */
export async function ProjectMetrics({ project }: { project: string }) {
  const locale = (await getLocale()) as Locale;
  const record = (facts.projects as Record<string, WithMetrics>)[project];
  if (!record) throw new Error(`ProjectMetrics: unknown project "${project}"`);
  if (!record.metrics?.length || record.metrics_confirmed !== true) {
    throw new Error(`ProjectMetrics: project "${project}" has no confirmed metrics to publish`);
  }
  const format = new Intl.NumberFormat(NUMBER_LOCALE[locale]);

  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {record.metrics.map((metric) => (
        <div key={metric.key} className="border-border bg-card flex flex-col rounded-lg border p-4">
          <dt className="text-muted-foreground order-2 text-sm">
            {locale === "cs" ? metric.label_cs : metric.label_en}
          </dt>
          <dd className="order-1 text-3xl font-semibold tabular-nums">
            {format.format(metric.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
