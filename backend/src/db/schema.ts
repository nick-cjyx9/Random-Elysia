import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const images = sqliteTable('images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  link: text('link').notNull(),
  del_link: text('del_link').notNull(),
  likes: integer('likes').notNull().default(0),
  dislikes: integer('dislikes').notNull().default(0),
  tags: text('tags'),
})

export type Image = typeof images.$inferSelect
