import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';
import { resetDb } from '@/tests/db-setup';

function postReq(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost:3000/api/links', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

describe('POST /api/links', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('creates a short link for a valid URL', async () => {
    const res = await POST(postReq({ url: 'https://example.com' }, { 'x-forwarded-for': '203.0.113.1' }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.originalUrl).toBe('https://example.com/');
    expect(body.shortCode).toMatch(/^[0-9A-Za-z]{7}$/);
    expect(body.shortUrl).toContain(body.shortCode);
  });

  it('returns 400 for an invalid URL', async () => {
    const res = await POST(postReq({ url: 'javascript:alert(1)' }, { 'x-forwarded-for': '203.0.113.2' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('invalid_url');
  });

  it('returns 400 when url is missing', async () => {
    const res = await POST(postReq({}, { 'x-forwarded-for': '203.0.113.3' }));
    expect(res.status).toBe(400);
  });
});
