import { createHash } from 'node:crypto';

/** Best-effort client IP from proxy headers; null when unknown. */
export function getClientIp(req: Request): string | null {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  return real?.trim() || null;
}

/** SHA-256 hash of ip + salt; null when ip is null. */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT ?? '';
  return createHash('sha256').update(ip + salt).digest('hex');
}
