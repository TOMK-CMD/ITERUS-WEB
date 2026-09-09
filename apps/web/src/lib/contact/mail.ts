import type { ContactSubmission } from "./schema";

export const RESEND_URL = "https://api.resend.com/emails";

type Params = {
  apiKey: string;
  to: string;
  from: string;
  submission: ContactSubmission;
  fetchImpl?: typeof fetch;
};

export class MailError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "MailError";
  }
}

/** Renders the notification as plain text so nothing the visitor typed is interpreted as HTML. */
export function renderContactText(submission: ContactSubmission): string {
  return [
    `Nová zpráva z webu iterus.cz (${submission.locale})`,
    "",
    `Jméno: ${submission.name}`,
    `E-mail: ${submission.email}`,
    "",
    submission.message,
  ].join("\n");
}

/** Sends the contact notification through the Resend REST API (no SDK — one fetch call). */
export async function sendContactMail({
  apiKey,
  to,
  from,
  submission,
  fetchImpl = fetch,
}: Params): Promise<{ id: string }> {
  const response = await fetchImpl(RESEND_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: submission.email,
      subject: `Kontakt z webu: ${submission.name}`,
      text: renderContactText(submission),
    }),
  });
  if (!response.ok) {
    throw new MailError(response.status, `Resend responded with HTTP ${response.status}`);
  }
  const data = (await response.json()) as { id?: string };
  return { id: data.id ?? "" };
}
