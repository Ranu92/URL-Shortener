import * as t from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';

export const links = pgTable(
  'links',
  {
    id: t.bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    shortCode: t.varchar('short_code', { length: 16 }).notNull(),
    originalUrl: t.text('original_url').notNull(),
    clickCount: t.integer('click_count').notNull().default(0),
    createdAt: t.timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [t.uniqueIndex('links_short_code_idx').on(table.shortCode)],
).enableRLS();

export const clicks = pgTable(
  'clicks',
  {
    id: t.bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    linkId: t
      .bigint('link_id', { mode: 'number' })
      .notNull()
      .references(() => links.id, { onDelete: 'cascade' }),
    clickedAt: t.timestamp('clicked_at', { withTimezone: true }).notNull().defaultNow(),
    referrer: t.text('referrer'),
    userAgent: t.text('user_agent'),
    ipHash: t.varchar('ip_hash', { length: 64 }),
  },
  (table) => [t.index('clicks_link_id_idx').on(table.linkId)],
).enableRLS();

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
export type Click = typeof clicks.$inferSelect;
export type NewClick = typeof clicks.$inferInsert;
