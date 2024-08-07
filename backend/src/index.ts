import Container from 'typedi'
import { Elysia } from 'elysia'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from './db/schema'
import { app } from './controllers/all'
import type { Env } from './utils/typedi'

export default {
  async fetch(request: Request, env: Env) {
    const db = drizzle(env.DB, { schema })
    // inject db and env as deps
    Container.set('DrizzleDB', db)
    Container.set('env', env)
    const resp = await new Elysia({ aot: false })
      .use(app)
      .handle(request)
    return resp
  },
}
