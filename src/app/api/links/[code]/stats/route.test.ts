import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from './route';
import { resetDb } from '@/tests/db-setup';
import { createLink, recordClick } from '@/db/queries';

function ctx(code: string) {
  return { params: Promise.resolve({ code }) };
}

describe('GET /api/links/:code/stats', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('returns stats for an existing link', async () => {
    const link = await createLink('https://example.com/');
    await recordClick({ linkId: link.id, referrer: null, userAgent: 'x', ipHash: null });

    const res = await GET(new Request('http://localhost/api/links/x/stats'), ctx(link.shortCode));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.shortCode).toBe(link.shortCode);
    expect(body.clickCount).toBe(1);
    expect(body.recent).toHaveLength(1);
  });

  it('returns 404 for an unknown code', async () => {
    const res = await GET(new Request('http://localhost/api/links/x/stats'), ctx('Missing1'));
    expect(res.status).toBe(404);
  });
});
