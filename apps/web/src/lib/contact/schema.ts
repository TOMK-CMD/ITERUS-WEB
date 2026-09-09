import { z } from "zod";
import { routing } from "@/i18n/routing";

/** Server-side contract of POST /api/contact. The client mirrors it, but only this one counts. */
export const contactSchema = z.object({
  /** Single line — it ends up in the mail subject, so CR/LF must never pass. */
  name: z
    .string()
    .trim()
    .regex(/^[^\p{Cc}]+$/u, "no control characters (single line) expected")
    .min(2)
    .max(100),
  /** Trim before the format check: API clients do not strip whitespace the way browsers do. */
  email: z.string().trim().max(200).pipe(z.email()),
  message: z.string().trim().min(10).max(5000),
  /** Honeypot: humans never see it, bots fill it. Any content → accepted silently, not sent. */
  company: z.string().optional().default(""),
  /** Cloudflare Turnstile response token (hidden input `cf-turnstile-response`). */
  turnstileToken: z.string().min(1).max(4096),
  locale: z.enum(routing.locales).default(routing.defaultLocale),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactSubmission = z.output<typeof contactSchema>;
