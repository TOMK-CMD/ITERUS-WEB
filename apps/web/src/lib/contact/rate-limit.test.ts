import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows `limit` requests per window and key, then blocks with a retry hint", () => {
    let clock = 1_000;
    const limiter = createRateLimiter({ limit: 2, windowMs: 100, now: () => clock });

    expect(limiter.check("a")).toEqual({ ok: true });
    expect(limiter.check("a")).toEqual({ ok: true });
    expect(limiter.check("a")).toEqual({ ok: false, retryAfterMs: 100 });
    expect(limiter.check("b")).toEqual({ ok: true });

    clock = 1_050;
    expect(limiter.check("a")).toEqual({ ok: false, retryAfterMs: 50 });

    clock = 1_100;
    expect(limiter.check("a")).toEqual({ ok: true });
  });

  it("caps memory: a flood of distinct keys resets the table instead of growing it", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, now: () => 0 });
    expect(limiter.check("first")).toEqual({ ok: true });
    for (let i = 0; i < 10_001; i += 1) limiter.check(`key-${i}`);
    // The table was cleared past 10k entries, so "first" is allowed again (best effort by design).
    expect(limiter.check("first")).toEqual({ ok: true });
  });
});
