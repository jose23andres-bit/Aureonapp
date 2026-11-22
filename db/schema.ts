import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
export const entries = pgTable('entries', { id:text().primaryKey(), kind:text().notNull(), slug:text().notNull().unique(), title:text().notNull(), status:text().notNull().default('draft'), data:jsonb().notNull().default({}), createdAt:timestamp('created_at').defaultNow() })
export const inquiries = pgTable('inquiries', { id:text().primaryKey(), kind:text().notNull(), data:jsonb().notNull(), status:text().notNull().default('pending'), createdAt:timestamp('created_at').defaultNow() })
