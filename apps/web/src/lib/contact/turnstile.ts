export const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult = { success: boolean; errorCodes: string[] };

type Params = {
  token: string;
  secret: string;
  remoteIp?: string;
  fetchImpl?: typeof fetch;
};

/** Verifies a Turnstile token server-side. Never trust the widget alone. */
export async function verifyTurnstile({
  token,
  secret,
  remoteIp,
  fetchImpl = fetch,
}: Params): Promise<TurnstileResult> {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  const response = await fetchImpl(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    return { success: false, errorCodes: [`http-${response.status}`] };
  }
  const data = (await response.json()) as { success?: boolean; "error-codes"?: string[] };
  return { success: data.success === true, errorCodes: data["error-codes"] ?? [] };
}
