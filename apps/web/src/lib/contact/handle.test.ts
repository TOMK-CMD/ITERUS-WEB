import { describe, expect, it, vi } from "vitest";
import { handleContact, type ContactDeps } from "./handle";
import { MailError } from "./mail";
import { createRateLimiter } from "./rate-limit";

const validBody = {
  name: "Jana Testová",
  email: "jana@example.com",
  message: "Dobrý den, zajímá mě webová aplikace pro náš tým.",
  turnstileToken: "token-123",
  locale: "cs",
};

const configuredEnv = {
  TURNSTILE_SECRET_KEY: "secret",
  RESEND_API_KEY: "re_test",
  CONTACT_TO_EMAIL: "inbox@example.com",
};

function deps(overrides: Partial<ContactDeps> = {}): ContactDeps {
  return {
    env: configuredEnv,
    limiter: createRateLimiter({ limit: 5, windowMs: 60_000 }),
    verify: vi.fn(async () => ({ success: true, errorCodes: [] })),
    send: vi.fn(async () => ({ id: "email-1" })),
    ...overrides,
  };
}

describe("handleContact", () => {
  it("rejects non-object and invalid bodies with 400 and never calls external services", async () => {
    const d = deps();
    expect(await handleContact("nope", "ip", d)).toEqual({
      status: 400,
      body: { ok: false, error: "invalid_body" },
    });
    expect(await handleContact({ ...validBody, email: "not-an-email" }, "ip", d)).toEqual({
      status: 400,
      body: { ok: false, error: "invalid_input" },
    });
    expect(await handleContact({ ...validBody, turnstileToken: "" }, "ip", d)).toMatchObject({
      status: 400,
      body: { error: "invalid_input" },
    });
    expect(d.verify).not.toHaveBeenCalled();
    expect(d.send).not.toHaveBeenCalled();
  });

  it("accepts a filled honeypot silently without sending", async () => {
    const d = deps();
    const result = await handleContact({ ...validBody, company: "Acme Bots" }, "ip", d);
    expect(result).toEqual({ status: 200, body: { ok: true } });
    expect(d.verify).not.toHaveBeenCalled();
    expect(d.send).not.toHaveBeenCalled();
  });

  it("rate-limits a client key", async () => {
    const d = deps({ limiter: createRateLimiter({ limit: 1, windowMs: 60_000 }) });
    expect((await handleContact(validBody, "ip-1", d)).status).toBe(200);
    const second = await handleContact(validBody, "ip-1", d);
    expect(second.status).toBe(429);
    expect(second.body).toMatchObject({ error: "rate_limited" });
    expect((await handleContact(validBody, "ip-2", d)).status).toBe(200);
  });

  it("degrades to 503 when the environment is incomplete", async () => {
    const d = deps({ env: { RESEND_API_KEY: "re_test" } });
    expect(await handleContact(validBody, "ip", d)).toEqual({
      status: 503,
      body: { ok: false, error: "not_configured" },
    });
    expect(d.verify).not.toHaveBeenCalled();
    expect(d.send).not.toHaveBeenCalled();
  });

  it("rejects a failed Turnstile verification with 400 and does not send", async () => {
    const d = deps({
      verify: vi.fn(async () => ({ success: false, errorCodes: ["invalid-input-response"] })),
    });
    expect(await handleContact(validBody, "ip", d)).toEqual({
      status: 400,
      body: { ok: false, error: "turnstile_failed" },
    });
    expect(d.verify).toHaveBeenCalledWith({ token: "token-123", secret: "secret", remoteIp: "ip" });
    expect(d.send).not.toHaveBeenCalled();
  });

  it("returns 502 when the mail provider fails", async () => {
    const d = deps({
      send: vi.fn(async () => {
        throw new MailError(500, "boom");
      }),
    });
    expect(await handleContact(validBody, "ip", d)).toEqual({
      status: 502,
      body: { ok: false, error: "mail_failed" },
    });
  });

  it("sends the validated submission with the configured addresses on the happy path", async () => {
    const d = deps({ env: { ...configuredEnv, CONTACT_FROM_EMAIL: "Web <web@example.com>" } });
    expect(await handleContact({ ...validBody, name: "  Jana Testová  " }, "ip", d)).toEqual({
      status: 200,
      body: { ok: true },
    });
    expect(d.send).toHaveBeenCalledTimes(1);
    expect(d.send).toHaveBeenCalledWith({
      apiKey: "re_test",
      to: "inbox@example.com",
      from: "Web <web@example.com>",
      submission: { ...validBody, company: "" },
    });
  });
});
