import { ImageResponse } from "next/og";
import { facts, tagline } from "@/lib/facts";
import { OG_HEIGHT, OG_WIDTH, parseOgParams } from "@/lib/seo/og";

export const runtime = "nodejs";

const INTER_CSS = "https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap";

async function fetchInter(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(INTER_CSS, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; IterusOG/1.0)" },
    }).then((response) => response.text());
    const url = css.match(/src: url\((https:[^)]+\.(?:ttf|woff))\)/)?.[1];
    if (!url) return null;
    const buffer: ArrayBuffer = await fetch(url).then((response) => response.arrayBuffer());
    return buffer;
  } catch {
    return null;
  }
}

/**
 * Inter 600 with Latin Extended glyphs (Czech diacritics). Fetched once per instance; if Google
 * Fonts is unreachable the image still renders with the built-in fallback font.
 */
let interPromise: Promise<ArrayBuffer | null> | undefined;
function loadInter(): Promise<ArrayBuffer | null> {
  interPromise ??= fetchInter();
  return interPromise;
}

/** GET /og?title=…&locale=cs|en → 1200×630 PNG in the brand palette (docs/BRAND.md). */
export async function GET(request: Request) {
  const { title, locale } = parseOgParams(new URL(request.url).searchParams);
  const inter = await loadInter();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#0B0D12",
        color: "#E6E8EE",
        fontFamily: inter ? "Inter" : "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 20, height: 20, borderRadius: 6, background: "#3B82F6" }} />
        <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -0.5 }}>{facts.brand.name}</div>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: title.length > 50 ? 56 : 68,
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: -1.5,
          maxWidth: 1000,
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 28,
          color: "#9AA3B2",
        }}
      >
        <div>{tagline(locale)}</div>
        <div>iterus.cz</div>
      </div>
    </div>,
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      ...(inter ? { fonts: [{ name: "Inter", data: inter, weight: 600, style: "normal" }] } : {}),
      headers: { "cache-control": "public, max-age=86400, s-maxage=31536000, immutable" },
    },
  );
}
