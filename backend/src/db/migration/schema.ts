import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id'),
  username: text('username').notNull(),
  avatar: text('avatar'),
  createdAt: text('created_at').default('sql`(CURRENT_TIMESTAMP)`').notNull(),
  role: integer('role').default(1).notNull(),
}, (table) => {
  return {
    idUnique: uniqueIndex('users_id_unique').on(table.id),
  }
})

export const images = sqliteTable('images', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  link: text('link').notNull(),
  delLink: text('del_link').notNull(),
  likes: integer('likes').default(0).notNull(),
  dislikes: integer('dislikes').default(0).notNull(),
  tags: text('tags'),
  createdAt: text('created_at').default('sql`(CURRENT_TIMESTAMP)`').notNull(),
  uid: text('uid').notNull().references(() => users.id),
})

export const states = sqliteTable('states', {
  state: text('state').primaryKey().notNull(),
}, (table) => {
  return {
    stateUnique: uniqueIndex('states_state_unique').on(table.state),
  }
})
