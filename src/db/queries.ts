import { eq, sql, desc } from 'drizzle-orm';
import { db } from './client';
import { links, clicks, type Link } from './schema';
import { generateCode } from '@/lib/codes';

/** Insert a link with a unique random code, retrying on collision. */
export async function createLink(originalUrl: string): Promise<Link> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const shortCode = generateCode();
    try {
      const [row] = await db
        .insert(links)
        .values({ shortCode, originalUrl })
        .returning();
      return row;
    } catch (err: unknown) {
      // 23505 = unique_violation. Retry with a fresh code.
      if (isUniqueViolation(err)) continue;
      throw err;
    }
  }
  throw new Error('Could not generate a unique short code after 5 attempts');
}

export async function findLinkByCode(shortCode: string): Promise<Link | undefined> {
  const [row] = await db.select().from(links).where(eq(links.shortCode, shortCode)).limit(1);
  return row;
}

export async function recordClick(params: {
  linkId: number;
  referrer: string | null;
  userAgent: string | null;
  ipHash: string | null;
}): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.insert(clicks).values(params);
    await tx
      .update(links)
      .set({ clickCount: sql`${links.clickCount} + 1` })
      .where(eq(links.id, params.linkId));
  });
}

export async function getStats(shortCode: string) {
  const link = await findLinkByCode(shortCode);
  if (!link) return undefined;
  const recent = await db
    .select()
    .from(clicks)
    .where(eq(clicks.linkId, link.id))
    .orderBy(desc(clicks.clickedAt))
    .limit(20);
  return { link, recent };
}

export async function listRecentLinks(limit = 10): Promise<Link[]> {
  return db.select().from(links).orderBy(desc(links.createdAt)).limit(limit);
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: string }).code === '23505'
  );
}
