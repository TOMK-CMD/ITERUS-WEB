export type RateLimitResult = { ok: true } | { ok: false; retryAfterMs: number };

export type RateLimiter = {
  check(key: string): RateLimitResult;
};

type Options = {
  /** Requests allowed per window and key. */
  limit: number;
  windowMs: number;
  now?: () => number;
};

/**
 * Fixed-window, in-memory limiter. Best effort only: on Vercel every function instance has its
 * own memory, so this slows down a single noisy client but is not a security control — Turnstile
 * and the honeypot are. A durable (KV-backed) limiter is an open item for Tomas.
 */
export function createRateLimiter({ limit, windowMs, now = Date.now }: Options): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();

  function prune(current: number) {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= current) hits.delete(key);
    }
  }

  return {
    check(key) {
      const current = now();
      if (hits.size > 1000) prune(current);
      const entry = hits.get(key);
      if (!entry || entry.resetAt <= current) {
        hits.set(key, { count: 1, resetAt: current + windowMs });
        return { ok: true };
      }
      if (entry.count < limit) {
        entry.count += 1;
        return { ok: true };
      }
      return { ok: false, retryAfterMs: entry.resetAt - current };
    },
  };
}
