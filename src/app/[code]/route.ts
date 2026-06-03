import { NextResponse } from 'next/server';
import { isValidCode } from '@/lib/codes';
import { findLinkByCode, recordClick } from '@/db/queries';
import { getClientIp, hashIp } from '@/lib/request';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  if (!isValidCode(code)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const link = await findLinkByCode(code);
  if (!link) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Record the click but never let analytics failures block the redirect.
  try {
    await recordClick({
      linkId: link.id,
      referrer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent'),
      ipHash: hashIp(getClientIp(request)),
    });
  } catch {
    // swallow — redirect is the priority
  }

  return NextResponse.redirect(link.originalUrl, 302);
}
