import Container from 'typedi'
import type { DrizzleD1Database } from 'drizzle-orm/d1'

export interface Env {
  DB: D1Database
  AI: Ai
  ACCOUNT_ID: string
  SMMS_TOKEN: string
  // BASIC_AUTH_CREDENTIALS: {
  //   username: string
  //   password: string
  // }[]
}
export const getEnv = () => Container.get<Env>('env')
export const getDB = () => Container.get<DrizzleD1Database<typeof import('../db/schema')>>('DrizzleDB')
