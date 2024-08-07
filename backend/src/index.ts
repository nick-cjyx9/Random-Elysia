import Container from 'typedi'
import { Elysia } from 'elysia'
import { drizzle } from 'drizzle-orm/d1'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from './db/schema'
import handleUpload from './controllers/upload'
import handleItem from './controllers/item'
import { handleGetRandom } from './controllers/random'
// import { basicAuth } from '@eelkevdbos/elysia-basic-auth'

export type DB = DrizzleD1Database<typeof import('./db/schema')>

export interface Env {
  DB: D1Database
  ACCOUNT_ID: string
  API_KEY: string
  SMMS_TOKEN: string
  // BASIC_AUTH_CREDENTIALS: {
  //   username: string
  //   password: string
  // }[]
}

export default {
  async fetch(request: Request, env: Env) {
    const db = drizzle(env.DB, { schema })
    // inject db and env as deps
    Container.set('DrizzleDB', db)
    Container.set('env', env)
    // aot: false is a must for cloudflare workers, see: https://github.com/elysiajs/elysia/issues/368
    return await new Elysia({ aot: false })
      // .use(basicAuth({ scope: '/item', credentials: env.BASIC_AUTH_CREDENTIALS, enabled: false }))
      .get('/', () => 'Hello Elysia')
      .use(handleItem())
      .use(handleUpload())
      .use(handleGetRandom())
      .handle(request)
  },
  // async scheduled() // WIP
}
