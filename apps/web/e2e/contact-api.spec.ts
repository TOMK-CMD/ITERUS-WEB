import { expect, test } from "@playwright/test";

const valid = {
  name: "Jana Testová",
  email: "jana@example.com",
  message: "Dobrý den, zajímá mě webová aplikace pro náš tým.",
  turnstileToken: "test-token",
  locale: "cs",
};

test.describe("POST /api/contact", () => {
  test("rejects a submission without a Turnstile token", async ({ request }) => {
    const response = await request.post("/api/contact", {
      data: { ...valid, turnstileToken: "" },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "invalid_input" });
  });

  test("rejects malformed JSON", async ({ request }) => {
    const response = await request.post("/api/contact", {
      headers: { "content-type": "application/json" },
      data: "{not json",
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "invalid_body" });
  });

  test("accepts a honeypot submission silently", async ({ request }) => {
    const response = await request.post("/api/contact", {
      data: { ...valid, company: "Acme Bots" },
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  test("degrades to 503 while the mail/Turnstile environment is not configured", async ({
    request,
  }) => {
    test.skip(
      Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.RESEND_API_KEY),
      "environment is configured — the 503 path does not apply",
    );
    const response = await request.post("/api/contact", { data: valid });
    expect(response.status()).toBe(503);
    expect(await response.json()).toEqual({ ok: false, error: "not_configured" });
    expect(response.headers()["cache-control"]).toBe("no-store");
  });
});

test("the contact page explains that the form is not enabled without a site key", async ({
  page,
}) => {
  test.skip(Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY), "site key configured");
  await page.goto("/kontakt");
  await expect(page.getByRole("status")).toContainText("není zapnutý");
});
