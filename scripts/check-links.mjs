#!/usr/bin/env node
// Crawls the built site from both locale roots plus every sitemap URL and fails on any internal
// link that does not end in HTTP 200 (redirects are followed and reported). External links are
// only checked with --external (network, slower, flaky by nature).
// Usage: node scripts/check-links.mjs [--base https://preview.example] [--external]
import { startServer } from "./lib/serve.mjs";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://iterus.cz").replace(/\/+$/, "");
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
    const lower = href.toLowerCase();
    if (SKIP_PREFIXES.some((prefix) => lower.startsWith(prefix))) continue;
    links.add(href);
  }
  return [...links];
}

/**
 * Resolves a href against the page it was found on. Returns an internal path, an external URL
 * (only with --external) or null (skipped).
 */
function toTarget(href, base, currentPath) {
  let url;
  try {
    // Relative links ("kontakt", "../x", "//host/x") resolve against the current page.
    url = new URL(href, base + currentPath);
  } catch {
    return null;
  }
  if (url.origin === base || url.origin === SITE) {
    return { path: url.pathname + url.search, external: false };
  }
  return checkExternal ? { path: url.href, external: true } : null;
}

const problems = [];
const redirects = [];
const seen = new Set();
let checkedCount = 0;

async function crawl(base, start) {
  const queue = [start];
  seen.add(start);
  while (queue.length) {
    const current = queue.shift();
    checkedCount += 1;
    const isExternal = current.startsWith("http");

    let response;
    try {
      response = await fetch(isExternal ? current : base + current, {
        redirect: "follow",
        headers: { "user-agent": "iterus-check-links/1.0" },
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      problems.push(`${current}: ${error.message}`);
      continue;
    }
    if (response.redirected) {
      const final = new URL(response.url);
      redirects.push(`${current} → ${final.origin === base ? final.pathname : final.href}`);
    }
    if (response.status !== 200) {
      problems.push(`${current}: HTTP ${response.status}`);
      continue;
    }
    // Only parse pages that are really ours (an internal path may have redirected elsewhere).
    if (isExternal || new URL(response.url).origin !== base) continue;
    const type = response.headers.get("content-type") ?? "";
    if (!type.includes("text/html")) continue;
    const html = await response.text();
    for (const href of extractLinks(html)) {
      const target = toTarget(href, base, current);
      if (!target || seen.has(target.path)) continue;
      seen.add(target.path);
      queue.push(target.path);
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
  for (const start of starts) {
    if (!seen.has(start)) await crawl(base, start);
  }
} finally {
  stop();
}

for (const redirect of redirects) console.log(`  ↪ ${redirect}`);
if (problems.length) {
  console.error(`check:links — ${problems.length} broken link(s):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exitCode = 1;
} else {
  console.log(
    `check:links — OK (${checkedCount} URLs checked, ${redirects.length} redirect(s), base ${base})`,
  );
}
