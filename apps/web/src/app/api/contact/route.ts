import { NextResponse } from "next/server";
import { defaultLimiter, handleContact } from "@/lib/contact/handle";
import { sendContactMail } from "@/lib/contact/mail";
import { verifyTurnstile } from "@/lib/contact/turnstile";

export const runtime = "nodejs";

/** POST /api/contact — thin adapter; the logic and its tests live in lib/contact/handle.ts. */
export async function POST(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const result = await handleContact(body, clientKey, {
    env: {
      TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
      CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
    },
    limiter: defaultLimiter,
    verify: verifyTurnstile,
    send: sendContactMail,
    log: (event, detail) => console.warn(`[contact] ${event}`, detail ?? ""),
  });

  const headers = new Headers({ "cache-control": "no-store" });
  if (result.status === 429 && result.body.retryAfterMs) {
    headers.set("retry-after", String(Math.ceil(result.body.retryAfterMs / 1000)));
  }
  return NextResponse.json(result.body, { status: result.status, headers });
}
