import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from './route';
import { resetDb } from '@/tests/db-setup';
import { createLink, findLinkByCode } from '@/db/queries';

function getReq(code: string) {
  return new Request(`http://localhost:3000/${code}`, {
    headers: { 'user-agent': 'test-agent', referer: 'https://ref.example' },
  });
}

function ctx(code: string) {
  return { params: Promise.resolve({ code }) };
}

describe('GET /:code', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('redirects (302) to the original URL and records a click', async () => {
    const link = await createLink('https://example.com/');
    const res = await GET(getReq(link.shortCode), ctx(link.shortCode));
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://example.com/');

    const updated = await findLinkByCode(link.shortCode);
    expect(updated?.clickCount).toBe(1);
  });

  it('returns 404 for an unknown code', async () => {
    const res = await GET(getReq('Missing1'), ctx('Missing1'));
    expect(res.status).toBe(404);
  });

  it('returns 404 for a malformed code', async () => {
    const res = await GET(getReq('bad'), ctx('bad'));
    expect(res.status).toBe(404);
  });
});
