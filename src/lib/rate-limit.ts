export interface RateLimiterOptions {
  max: number;
  windowMs: number;
  now?: () => number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export function createRateLimiter(opts: RateLimiterOptions) {
  const now = opts.now ?? (() => Date.now());
  const buckets = new Map<string, Bucket>();

  return {
    check(key: string): RateLimitResult {
      const t = now();
      const bucket = buckets.get(key);

      if (!bucket || t >= bucket.resetAt) {
        buckets.set(key, { count: 1, resetAt: t + opts.windowMs });
        return { allowed: true, retryAfterMs: 0 };
      }

      if (bucket.count < opts.max) {
        bucket.count += 1;
        return { allowed: true, retryAfterMs: 0 };
      }

      return { allowed: false, retryAfterMs: bucket.resetAt - t };
    },
  };
}

// Shared app-wide limiter for link creation, configured from env.
export const createLinkLimiter = createRateLimiter({
  max: Number(process.env.RATE_LIMIT_MAX ?? 10),
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
});
