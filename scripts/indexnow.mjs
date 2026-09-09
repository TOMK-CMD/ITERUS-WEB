#!/usr/bin/env node
// Pings IndexNow (Bing, Seznam, Yandex, …) with changed URLs after a release.
// No-op without INDEXNOW_KEY. The key file must be served at <site>/<key>.txt (apps/web/public).
// Usage: node scripts/indexnow.mjs https://iterus.cz/ https://iterus.cz/en
const key = process.env.INDEXNOW_KEY;
const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://iterus.cz").replace(/\/+$/, "");
const urls = process.argv.slice(2);

if (!key) {
  console.log("indexnow: INDEXNOW_KEY is not set — skipping (nothing submitted)");
} else if (urls.length === 0) {
  console.log("indexnow: no URLs given — usage: node scripts/indexnow.mjs <url> [<url> …]");
} else {
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(site).host,
      key,
      keyLocation: `${site}/${key}.txt`,
      urlList: urls,
    }),
  });
  console.log(`indexnow: submitted ${urls.length} URL(s) — HTTP ${response.status}`);
  if (!response.ok) {
    console.error(await response.text());
    process.exitCode = 1;
  }
}
