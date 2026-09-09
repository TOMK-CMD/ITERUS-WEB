import { describe, expect, it, vi } from "vitest";
import { MailError, renderContactText, RESEND_URL, sendContactMail } from "./mail";
import { TURNSTILE_VERIFY_URL, verifyTurnstile } from "./turnstile";

const submission = {
  name: "Jana Testová",
  email: "jana@example.com",
  message: "<script>alert(1)</script> Zajímá mě nabídka.",
  company: "",
  turnstileToken: "t",
  locale: "cs" as const,
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("verifyTurnstile", () => {
  it("posts the secret, token and remote IP as a form and reads the verdict", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(200, { success: true, "error-codes": [] }));
    const result = await verifyTurnstile({
      token: "tok",
      secret: "sec",
      remoteIp: "203.0.113.5",
      fetchImpl,
    });
    expect(result).toEqual({ success: true, errorCodes: [] });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(TURNSTILE_VERIFY_URL);
    expect(init.method).toBe("POST");
    expect(String(init.body)).toBe("secret=sec&response=tok&remoteip=203.0.113.5");
  });

  it("treats transport errors and negative verdicts as failure", async () => {
    const bad = vi.fn(async () =>
      jsonResponse(200, { success: false, "error-codes": ["timeout-or-duplicate"] }),
    );
    expect(await verifyTurnstile({ token: "t", secret: "s", fetchImpl: bad })).toEqual({
      success: false,
      errorCodes: ["timeout-or-duplicate"],
    });
    const down = vi.fn(async () => new Response("", { status: 503 }));
    expect(await verifyTurnstile({ token: "t", secret: "s", fetchImpl: down })).toEqual({
      success: false,
      errorCodes: ["http-503"],
    });
  });
});

describe("sendContactMail", () => {
  it("sends a plain-text email through Resend with reply-to set to the visitor", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(200, { id: "email-42" }));
    const result = await sendContactMail({
      apiKey: "re_key",
      to: "inbox@example.com",
      from: "Web <web@example.com>",
      submission,
      fetchImpl,
    });
    expect(result).toEqual({ id: "email-42" });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(RESEND_URL);
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer re_key");
    const payload = JSON.parse(String(init.body));
    expect(payload).toMatchObject({
      from: "Web <web@example.com>",
      to: ["inbox@example.com"],
      reply_to: "jana@example.com",
    });
    expect(payload.html).toBeUndefined();
    expect(payload.text).toContain("<script>alert(1)</script>");
    expect(payload.text).toBe(renderContactText(submission));
  });

  it("throws a MailError with the HTTP status on failure", async () => {
    const fetchImpl = vi.fn(async () => new Response("nope", { status: 422 }));
    await expect(
      sendContactMail({ apiKey: "k", to: "a@b.c", from: "x@y.z", submission, fetchImpl }),
    ).rejects.toThrowError(MailError);
  });
});
