export type ValidateResult =
  | { ok: true; url: string }
  | { ok: false; reason: string };

const MAX_URL_LENGTH = 2048;
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.localhost')) return true;
  if (h === '0.0.0.0' || h === '::1' || h === '[::1]') return true;

  // IPv4 private / loopback / link-local ranges
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (a === 127) return true; // loopback
    if (a === 10) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 169 && b === 254) return true; // link-local (cloud metadata)
  }
  return false;
}

export function validateUrl(input: string): ValidateResult {
  if (typeof input !== 'string' || input.trim() === '') {
    return { ok: false, reason: 'URL is required' };
  }
  if (input.length > MAX_URL_LENGTH) {
    return { ok: false, reason: 'URL is too long' };
  }

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return { ok: false, reason: 'URL is not valid' };
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return { ok: false, reason: 'Only http and https URLs are allowed' };
  }
  if (isPrivateHost(parsed.hostname)) {
    return { ok: false, reason: 'URL points to a private or local address' };
  }

  return { ok: true, url: parsed.toString() };
}
