import { describe, it, expect } from 'vitest';
import { createRateLimiter } from './rate-limit';

describe('createRateLimiter', () => {
  it('allows up to max requests in a window', () => {
    let now = 1000;
    const limiter = createRateLimiter({ max: 3, windowMs: 1000, now: () => now });
    expect(limiter.check('ip-a').allowed).toBe(true);
    expect(limiter.check('ip-a').allowed).toBe(true);
    expect(limiter.check('ip-a').allowed).toBe(true);
    expect(limiter.check('ip-a').allowed).toBe(false);
  });

  it('tracks keys independently', () => {
    let now = 1000;
    const limiter = createRateLimiter({ max: 1, windowMs: 1000, now: () => now });
    expect(limiter.check('ip-a').allowed).toBe(true);
    expect(limiter.check('ip-b').allowed).toBe(true);
    expect(limiter.check('ip-a').allowed).toBe(false);
  });

  it('resets after the window elapses', () => {
    let now = 1000;
    const limiter = createRateLimiter({ max: 1, windowMs: 1000, now: () => now });
    expect(limiter.check('ip-a').allowed).toBe(true);
    expect(limiter.check('ip-a').allowed).toBe(false);
    now += 1001;
    expect(limiter.check('ip-a').allowed).toBe(true);
  });

  it('reports retryAfterMs when blocked', () => {
    let now = 1000;
    const limiter = createRateLimiter({ max: 1, windowMs: 1000, now: () => now });
    limiter.check('ip-a');
    const r = limiter.check('ip-a');
    expect(r.allowed).toBe(false);
    expect(r.retryAfterMs).toBeGreaterThan(0);
  });
});
