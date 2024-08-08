import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const images = sqliteTable('images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  link: text('link').notNull(),
  del_link: text('del_link').notNull(),
  likes: integer('likes').notNull().default(0),
  dislikes: integer('dislikes').notNull().default(0),
  tags: text('tags'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
})

export type Image = typeof images.$inferSelect
