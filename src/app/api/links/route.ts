import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateUrl } from '@/lib/validate-url';
import { createLinkLimiter } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/request';
import { jsonError } from '@/lib/http';
import { createLink } from '@/db/queries';

const bodySchema = z.object({ url: z.string() });

export async function POST(request: Request) {
  const ip = getClientIp(request) ?? 'unknown';
  const limit = createLinkLimiter.check(ip);
  if (!limit.allowed) {
    const res = jsonError(429, 'rate_limited', 'Too many requests. Please slow down.');
    res.headers.set('Retry-After', String(Math.ceil(limit.retryAfterMs / 1000)));
    return res;
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonError(400, 'invalid_body', 'Request body must be valid JSON');
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return jsonError(400, 'invalid_url', 'A "url" field is required');
  }

  const result = validateUrl(parsed.data.url);
  if (!result.ok) {
    return jsonError(400, 'invalid_url', result.reason);
  }

  try {
    const link = await createLink(result.url);
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    return NextResponse.json(
      {
        shortCode: link.shortCode,
        shortUrl: `${base}/${link.shortCode}`,
        originalUrl: link.originalUrl,
      },
      { status: 201 },
    );
  } catch {
    return jsonError(500, 'server_error', 'Could not create short link');
  }
}
