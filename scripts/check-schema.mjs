#!/usr/bin/env node
// Validates the JSON-LD of the built site: starts `next start`, fetches the pages, parses every
// <script type="application/ld+json"> block and checks required fields per @type — including
// entities nested in properties (mainEntity, publisher, …). Also refuses any "TODO" placeholder
// that leaked from content/facts.json.
// Usage: node scripts/check-schema.mjs [--base https://preview.example]  (default: local server)
import { startServer } from "./lib/serve.mjs";

const PAGES = ["/", "/en", "/kontakt", "/en/contact", "/ochrana-osobnich-udaju", "/en/terms"];

const REQUIRED = {
  Organization: ["name", "legalName", "identifier", "url", "address"],
  WebSite: ["name", "url", "inLanguage", "publisher"],
  ProfessionalService: ["name", "url", "address", "areaServed"],
  PostalAddress: ["addressLocality", "addressCountry"],
  ContactPage: ["name", "url"],
  WebPage: ["name", "url"],
  Article: ["headline", "datePublished", "author"],
  FAQPage: ["mainEntity"],
  Question: ["name", "acceptedAnswer"],
  Answer: ["text"],
  Service: ["name", "provider"],
  Person: ["name"],
};

const baseArg = process.argv.indexOf("--base");
const external = baseArg !== -1 ? process.argv[baseArg + 1]?.replace(/\/+$/, "") : null;

function extractBlocks(html) {
  const blocks = [];
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let match;
  while ((match = re.exec(html))) blocks.push(match[1]);
  return blocks;
}

/** Every object carrying @type anywhere in the graph (arrays, @graph, nested properties). */
function entities(node, found = []) {
  if (Array.isArray(node)) {
    for (const item of node) entities(item, found);
  } else if (node && typeof node === "object") {
    if ("@type" in node) found.push(node);
    for (const [key, value] of Object.entries(node)) {
      if (key === "@context") continue;
      entities(value, found);
    }
  }
  return found;
}

const isMissing = (value) =>
  value === undefined ||
  value === null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

const problems = [];
let checked = 0;

async function checkPage(base, page) {
  const response = await fetch(base + page);
  if (!response.ok) {
    problems.push(`${page}: HTTP ${response.status}`);
    return;
  }
  const blocks = extractBlocks(await response.text());
  if (blocks.length === 0) {
    problems.push(`${page}: no JSON-LD block found`);
    return;
  }
  for (const block of blocks) {
    if (/TODO/i.test(block)) problems.push(`${page}: JSON-LD contains a TODO placeholder`);
    let data;
    try {
      data = JSON.parse(block);
    } catch (error) {
      problems.push(`${page}: JSON-LD is not valid JSON (${error.message})`);
      continue;
    }
    const found = entities(data);
    if (found.length === 0) problems.push(`${page}: JSON-LD block without any typed entity`);
    for (const entity of found) {
      const types = [entity["@type"]].flat().filter(Boolean);
      if (types.length === 0) {
        problems.push(`${page}: entity without @type`);
        continue;
      }
      checked += 1;
      for (const type of types) {
        for (const field of REQUIRED[type] ?? []) {
          if (isMissing(entity[field])) problems.push(`${page}: ${type} is missing "${field}"`);
        }
      }
    }
  }
}

let stop = () => {};
let base = external;
if (!base) {
  const server = await startServer({ port: 3301 });
  base = server.base;
  stop = server.stop;
}
try {
  for (const page of PAGES) await checkPage(base, page);
} finally {
  stop();
}

if (problems.length) {
  console.error(`check:schema — ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exitCode = 1;
} else {
  console.log(`check:schema — OK (${checked} entities across ${PAGES.length} pages, base ${base})`);
}
