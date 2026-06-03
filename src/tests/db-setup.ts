import { sql } from 'drizzle-orm';
import { db } from '@/db/client';

/** Wipe all rows between tests. Call in beforeEach of integration tests. */
export async function resetDb(): Promise<void> {
  await db.execute(sql`TRUNCATE TABLE clicks, links RESTART IDENTITY CASCADE`);
}
