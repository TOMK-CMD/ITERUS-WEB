#!/usr/bin/env node
// Crawls the built site from both locale roots plus every sitemap URL and fails on any internal
// link that does not end in HTTP 200 (redirects are followed and reported). External links are
// only checked with --external (network, slower, flaky by nature).
// Usage: node scripts/check-links.mjs [--base https://preview.example] [--external]
import { startServer } from "./lib/serve.mjs";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://iterus.cz").replace(/\/+$/, "");
const args = process.argv.slice(2);
const baseArg = args.indexOf("--base");
const external = baseArg !== -1 ? args[baseArg + 1]?.replace(/\/+$/, "") : null;
const checkExternal = args.includes("--external");

const SKIP_PREFIXES = ["mailto:", "tel:", "javascript:", "#", "data:"];

function extractLinks(html) {
  const links = new Set();
  const re = /<(?:a|link)\s[^>]*href="([^"]+)"/g;
  let match;
  while ((match = re.exec(html))) {
    const href = match[1].replace(/&amp;/g, "&");
    if (SKIP_PREFIXES.some((prefix) => href.startsWith(prefix))) continue;
    links.add(href);
  }
  return [...links];
}

/** Maps a href to a crawlable path; returns null for external URLs (unless requested). */
function toTarget(href, base) {
  if (href.startsWith("/")) return { path: href.split("#")[0], external: false };
  try {
    const url = new URL(href);
    if (url.origin === base || url.origin === SITE) {
      return { path: url.pathname + url.search, external: false };
    }
    return checkExternal ? { path: href, external: true } : null;
  } catch {
    return null;
  }
}

const problems = [];
const redirects = [];
const seen = new Set();
let checkedCount = 0;

async function crawl(base, start) {
  const queue = [start];
  while (queue.length) {
    const current = queue.shift();
    if (seen.has(current)) continue;
    seen.add(current);
    checkedCount += 1;

    let response;
    try {
      response = await fetch(current.startsWith("http") ? current : base + current, {
        redirect: "follow",
        headers: { "user-agent": "iterus-check-links/1.0" },
      });
    } catch (error) {
      problems.push(`${current}: ${error.message}`);
      continue;
    }
    if (response.redirected) redirects.push(`${current} → ${new URL(response.url).pathname}`);
    if (response.status !== 200) {
      problems.push(`${current}: HTTP ${response.status}`);
      continue;
    }
    if (current.startsWith("http")) continue; // external: status only
    const type = response.headers.get("content-type") ?? "";
    if (!type.includes("text/html")) continue;
    const html = await response.text();
    for (const href of extractLinks(html)) {
      const target = toTarget(href, base);
      if (!target) continue;
      const key = target.external ? target.path : target.path;
      if (!seen.has(key)) queue.push(key);
    }
  }
}

async function sitemapPaths(base) {
  const xml = await (await fetch(`${base}/sitemap.xml`)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

let stop = () => {};
let base = external;
if (!base) {
  const server = await startServer({ port: 3302 });
  base = server.base;
  stop = server.stop;
}
try {
  const starts = ["/", "/en", ...(await sitemapPaths(base))];
  for (const start of starts) await crawl(base, start);
} finally {
  stop();
}

for (const redirect of redirects) console.log(`  ↪ ${redirect}`);
if (problems.length) {
  console.error(`check:links — ${problems.length} broken link(s):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(
  `check:links — OK (${checkedCount} URLs checked, ${redirects.length} redirect(s), base ${base})`,
);
