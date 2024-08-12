import Container from 'typedi'
import type { DrizzleD1Database } from 'drizzle-orm/d1'

export interface Env {
  DB: D1Database
  AI: Ai
  ACCOUNT_ID: string
  SMMS_TOKEN: string
  CLIENT_ID: string
  CLIENT_SECRET: string
  LOCAL_CLIENT_ID: string
  LOCAL_CLIENT_SECRET: string
  BGM_CLIENT_ID: string
  BGM_CLIENT_SECRET: string
  JWT_SECRET: string
  FRONTEND_URL: string
  BACKEND_URL: string
}
export const getEnv = () => Container.get<Env>('env')
export const getDB = () => Container.get<DrizzleD1Database<typeof import('../db/schema')>>('DrizzleDB')
