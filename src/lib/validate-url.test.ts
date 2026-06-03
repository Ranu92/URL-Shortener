import { describe, it, expect } from 'vitest';
import { validateUrl } from './validate-url';

describe('validateUrl', () => {
  it('accepts a normal https URL', () => {
    const r = validateUrl('https://example.com/path?q=1');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.url).toBe('https://example.com/path?q=1');
  });

  it('accepts http', () => {
    expect(validateUrl('http://example.com').ok).toBe(true);
  });

  it('rejects empty / non-string / garbage', () => {
    expect(validateUrl('').ok).toBe(false);
    expect(validateUrl('not a url').ok).toBe(false);
  });

  it('rejects dangerous schemes', () => {
    expect(validateUrl('javascript:alert(1)').ok).toBe(false);
    expect(validateUrl('data:text/html,<script>').ok).toBe(false);
    expect(validateUrl('file:///etc/passwd').ok).toBe(false);
  });

  it('rejects loopback and private hosts (SSRF guard)', () => {
    expect(validateUrl('http://localhost/admin').ok).toBe(false);
    expect(validateUrl('http://127.0.0.1').ok).toBe(false);
    expect(validateUrl('http://10.0.0.5').ok).toBe(false);
    expect(validateUrl('http://192.168.1.1').ok).toBe(false);
    expect(validateUrl('http://169.254.169.254').ok).toBe(false);
  });

  it('rejects URLs longer than 2048 chars', () => {
    const long = 'https://example.com/' + 'a'.repeat(2048);
    expect(validateUrl(long).ok).toBe(false);
  });
});
