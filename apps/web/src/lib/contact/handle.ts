import { createRateLimiter, type RateLimiter } from "./rate-limit";
import { contactSchema, type ContactSubmission } from "./schema";
import { sendContactMail } from "./mail";
import { verifyTurnstile } from "./turnstile";

export type ContactEnv = {
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
};

export const DEFAULT_FROM = "Iterus web <noreply@iterus.cz>";
/** Client key used when no x-forwarded-for header is present (never sent to Turnstile). */
export const UNKNOWN_CLIENT = "unknown";

export type ContactErrorCode =
  | "invalid_body"
  | "invalid_input"
  | "rate_limited"
  | "not_configured"
  | "turnstile_failed"
  | "mail_failed";

export type ContactResult =
  | { status: 200; body: { ok: true } }
  | {
      status: 400 | 429 | 502 | 503;
      body: { ok: false; error: ContactErrorCode; retryAfterMs?: number };
    };

export type ContactDeps = {
  env: ContactEnv;
  limiter: RateLimiter;
  verify: typeof verifyTurnstile;
  send: typeof sendContactMail;
  log?: (event: string, detail?: Record<string, unknown>) => void;
};

/** Shared across requests of one server instance (best effort, see rate-limit.ts). */
export const defaultLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export function isConfigured(env: ContactEnv): boolean {
  return Boolean(env.TURNSTILE_SECRET_KEY && env.RESEND_API_KEY && env.CONTACT_TO_EMAIL);
}

/**
 * Pure request handler for POST /api/contact — every dependency is injected so the whole
 * decision tree is unit-tested. Order: body → schema → honeypot → rate limit → configuration →
 * Turnstile → mail. The client never learns which of the last three failed beyond the code.
 */
export async function handleContact(
  rawBody: unknown,
  clientKey: string,
  deps: ContactDeps,
): Promise<ContactResult> {
  const { env, limiter, verify, send, log = () => {} } = deps;

  if (typeof rawBody !== "object" || rawBody === null) {
    return { status: 400, body: { ok: false, error: "invalid_body" } };
  }
  const parsed = contactSchema.safeParse(rawBody);
  if (!parsed.success) {
    return { status: 400, body: { ok: false, error: "invalid_input" } };
  }
  const submission: ContactSubmission = parsed.data;

  if (submission.company.trim() !== "") {
    // A bot filled the honeypot: pretend success, send nothing, do not consume the mail quota.
    // No client key in the log — an IP address is personal data (CLAUDE.md → GDPR).
    log("contact.honeypot");
    return { status: 200, body: { ok: true } };
  }

  const limit = limiter.check(clientKey);
  if (!limit.ok) {
    return {
      status: 429,
      body: { ok: false, error: "rate_limited", retryAfterMs: limit.retryAfterMs },
    };
  }

  if (!isConfigured(env)) {
    log("contact.not_configured");
    return { status: 503, body: { ok: false, error: "not_configured" } };
  }

  let turnstile: Awaited<ReturnType<typeof verify>>;
  try {
    turnstile = await verify({
      token: submission.turnstileToken,
      secret: env.TURNSTILE_SECRET_KEY!,
      remoteIp: clientKey === UNKNOWN_CLIENT ? undefined : clientKey,
    });
  } catch (error) {
    // Transport failure towards Cloudflare (DNS, timeout): keep the JSON contract, no 500.
    log("contact.turnstile_unreachable", {
      message: error instanceof Error ? error.message : String(error),
    });
    return { status: 502, body: { ok: false, error: "turnstile_failed" } };
  }
  if (!turnstile.success) {
    log("contact.turnstile_failed", { errorCodes: turnstile.errorCodes });
    return { status: 400, body: { ok: false, error: "turnstile_failed" } };
  }

  try {
    await send({
      apiKey: env.RESEND_API_KEY!,
      to: env.CONTACT_TO_EMAIL!,
      from: env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
      submission,
    });
  } catch (error) {
    log("contact.mail_failed", { message: error instanceof Error ? error.message : String(error) });
    return { status: 502, body: { ok: false, error: "mail_failed" } };
  }

  return { status: 200, body: { ok: true } };
}
