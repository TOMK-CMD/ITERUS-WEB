import { z } from "zod";
import { routing } from "@/i18n/routing";

/** Server-side contract of POST /api/contact. The client mirrors it, but only this one counts. */
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().trim().max(200),
  message: z.string().trim().min(10).max(5000),
  /** Honeypot: humans never see it, bots fill it. Any content → accepted silently, not sent. */
  company: z.string().max(200).optional().default(""),
  /** Cloudflare Turnstile response token (hidden input `cf-turnstile-response`). */
  turnstileToken: z.string().min(1).max(4096),
  locale: z.enum(routing.locales).default(routing.defaultLocale),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactSubmission = z.output<typeof contactSchema>;
