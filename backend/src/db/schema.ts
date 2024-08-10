import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: integer('id').unique(),
  username: text('username').notNull(),
  avatar: text('avatar'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // role: 0 -> admin, 1 -> normal uploader, 2 -> banned
  role: integer('role').default(1).notNull(),
})

export const images = sqliteTable('images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  link: text('link').notNull(),
  del_link: text('del_link').notNull(),
  likes: integer('likes').notNull().default(0),
  dislikes: integer('dislikes').notNull().default(0),
  tags: text('tags'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  uid: integer('uid').references(() => users.id).notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
  images: many(images),
}))

export const imageRelations = relations(images, ({ one }) => ({
  user: one(users, {
    fields: [images.uid],
    references: [users.id],
  }),
}))

export type Image = typeof images.$inferSelect
export type User = typeof users.$inferSelect
