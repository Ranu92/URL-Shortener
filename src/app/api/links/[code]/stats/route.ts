import { NextResponse } from 'next/server';
import { getStats } from '@/db/queries';
import { jsonError } from '@/lib/http';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const stats = await getStats(code);
  if (!stats) {
    return jsonError(404, 'not_found', 'No link with that code');
  }
  return NextResponse.json({
    shortCode: stats.link.shortCode,
    originalUrl: stats.link.originalUrl,
    clickCount: stats.link.clickCount,
    createdAt: stats.link.createdAt,
    recent: stats.recent.map((c) => ({
      clickedAt: c.clickedAt,
      referrer: c.referrer,
      userAgent: c.userAgent,
    })),
  });
}
