#!/usr/bin/env node
// Generates apps/web/public/llms.txt (https://llmstxt.org) from the published MDX pages.
// Runs from apps/web `prebuild`, so every Vercel build carries a fresh file; the output is
// gitignored. Routes come straight from the app (Node 22 strips the TypeScript types).
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import matter from "gray-matter";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = path.join(ROOT, "content");
const OUTPUT = path.join(ROOT, "apps", "web", "public", "llms.txt");
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://iterus.cz").replace(/\/+$/, "");

const importTs = (relative) => import(pathToFileURL(path.join(ROOT, relative)).href);
const [{ routing }, { PAGE_ROUTES, localizedPath }, facts] = await Promise.all([
  importTs("apps/web/src/i18n/routing.ts"),
  importTs("apps/web/src/lib/seo/paths.ts"),
  readFile(path.join(CONTENT_DIR, "facts.json"), "utf8").then(JSON.parse),
]);

const LABELS = { cs: "Stránky (česky)", en: "Pages (English)" };

async function publishedPages(locale) {
  const dir = path.join(CONTENT_DIR, locale);
  const files = (await readdir(dir)).filter((name) => name.endsWith(".mdx")).sort();
  const pages = [];
  for (const name of files) {
    const slug = name.replace(/\.mdx$/, "");
    const { data } = matter(await readFile(path.join(dir, name), "utf8"));
    if ((data.status ?? "published") !== "published") continue;
    const href = PAGE_ROUTES[slug];
    if (!href) throw new Error(`generate-llms-txt: no route registered for content slug "${slug}"`);
    pages.push({
      slug,
      title: data.title,
      description: data.description,
      url: SITE_URL + localizedPath(locale, href),
    });
  }
  const order = Object.keys(PAGE_ROUTES);
  return pages.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
}

const sections = [];
for (const locale of routing.locales) {
  const pages = await publishedPages(locale);
  sections.push(
    `## ${LABELS[locale] ?? locale}`,
    "",
    ...pages.map((page) => `- [${page.title}](${page.url}): ${page.description}`),
    "",
  );
}

const services = facts.services.map((service) => `- ${service.en}`);
const text = [
  `# ${facts.brand.name}`,
  "",
  `> ${facts.brand.tagline_en} ${facts.how_we_work.approved_en}`,
  "",
  facts.brand.legal_line_en,
  "",
  ...sections,
  "## Services",
  "",
  ...services,
  "",
].join("\n");

await mkdir(path.dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, text, "utf8");
console.log(`llms.txt: ${path.relative(ROOT, OUTPUT)} (${text.length} chars)`);
