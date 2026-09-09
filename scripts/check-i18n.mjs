#!/usr/bin/env node
// Parity check cs ↔ en: (a) message keys in messages/*.json, (b) file sets under content/<locale>/,
// (c) frontmatter keys per matching content file. Exit 1 with every difference listed.
// Intentional gaps go into scripts/i18n-exceptions.json with a reason and a Linear issue.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES = ["cs", "en"];
const REFERENCE = "cs";

const problems = [];
const exceptions = JSON.parse(
  await readFile(path.join(ROOT, "scripts", "i18n-exceptions.json"), "utf8"),
);
const isExcepted = (locale, file) =>
  exceptions.some((entry) => entry.locale === locale && entry.file === file);

function flattenKeys(value, prefix = "") {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

function diff(label, reference, other, referenceName, otherName) {
  const missing = reference.filter((key) => !other.includes(key));
  const extra = other.filter((key) => !reference.includes(key));
  for (const key of missing)
    problems.push(`${label}: "${key}" exists in ${referenceName} but not in ${otherName}`);
  for (const key of extra)
    problems.push(`${label}: "${key}" exists in ${otherName} but not in ${referenceName}`);
}

// (a) message keys
const messages = {};
for (const locale of LOCALES) {
  messages[locale] = flattenKeys(
    JSON.parse(await readFile(path.join(ROOT, "messages", `${locale}.json`), "utf8")),
  ).sort();
}
for (const locale of LOCALES.filter((l) => l !== REFERENCE)) {
  diff("messages", messages[REFERENCE], messages[locale], `${REFERENCE}.json`, `${locale}.json`);
}

// (b) content file sets + (c) frontmatter keys
async function contentFiles(locale) {
  const dir = path.join(ROOT, "content", locale);
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) =>
      path
        .relative(dir, path.join(entry.parentPath ?? entry.path, entry.name))
        .split(path.sep)
        .join("/"),
    )
    .sort();
}

const files = {};
for (const locale of LOCALES) files[locale] = await contentFiles(locale);

for (const locale of LOCALES.filter((l) => l !== REFERENCE)) {
  const reference = files[REFERENCE].filter((file) => !isExcepted(locale, file));
  const other = files[locale].filter((file) => !isExcepted(REFERENCE, file));
  diff("content", reference, other, `content/${REFERENCE}`, `content/${locale}`);

  for (const file of reference.filter((f) => other.includes(f))) {
    const keysOf = async (l) =>
      Object.keys(matter(await readFile(path.join(ROOT, "content", l, file), "utf8")).data).sort();
    const a = await keysOf(REFERENCE);
    const b = await keysOf(locale);
    diff(`frontmatter ${file}`, a, b, `content/${REFERENCE}/${file}`, `content/${locale}/${file}`);
  }
}

if (problems.length) {
  console.error(`check:i18n — ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(
  `check:i18n — OK (${messages[REFERENCE].length} message keys, ${files[REFERENCE].length} content files per locale, ${exceptions.length} exception(s))`,
);
