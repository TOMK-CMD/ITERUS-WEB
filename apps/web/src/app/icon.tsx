import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Favicon generated from the brand tokens (docs/BRAND.md) until a real wordmark/symbol exists.
 * Next serves it as /icon and links it from every page, which also stops the /favicon.ico 404.
 */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0B0D12",
        borderRadius: 14,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "#3B82F6",
        }}
      />
    </div>,
    size,
  );
}
