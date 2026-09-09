#!/usr/bin/env node
// Validates the JSON-LD of the built site: starts `next start`, fetches the pages, parses every
// <script type="application/ld+json"> block and checks required fields per @type. Also refuses
// any "TODO" placeholder that leaked from content/facts.json.
// Usage: node scripts/check-schema.mjs [--base https://preview.example]  (default: local server)
import { startServer } from "./lib/serve.mjs";

const PAGES = ["/", "/en", "/kontakt", "/en/contact", "/ochrana-osobnich-udaju", "/en/terms"];

const REQUIRED = {
  Organization: ["name", "legalName", "identifier", "url", "address"],
  WebSite: ["name", "url", "inLanguage", "publisher"],
  ProfessionalService: ["name", "url", "address", "areaServed"],
  ContactPage: ["name", "url"],
  WebPage: ["name", "url"],
  Article: ["headline", "datePublished", "author"],
  FAQPage: ["mainEntity"],
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

function flatten(node) {
  if (Array.isArray(node)) return node.flatMap(flatten);
  if (node && typeof node === "object" && "@graph" in node) return flatten(node["@graph"]);
  return [node];
}

const problems = [];
let checked = 0;

async function checkPage(base, page) {
  const response = await fetch(base + page);
  if (!response.ok) {
    problems.push(`${page}: HTTP ${response.status}`);
    return;
  }
  const html = await response.text();
  const blocks = extractBlocks(html);
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
    for (const entity of flatten(data)) {
      const type = entity?.["@type"];
      if (!type) {
        problems.push(`${page}: entity without @type`);
        continue;
      }
      checked += 1;
      const required = REQUIRED[type];
      if (!required) continue;
      for (const field of required) {
        const value = entity[field];
        if (value === undefined || value === null || value === "") {
          problems.push(`${page}: ${type} is missing "${field}"`);
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
  process.exit(1);
}
console.log(`check:schema — OK (${checked} entities across ${PAGES.length} pages, base ${base})`);
