import Container from 'typedi'
import { Elysia } from 'elysia'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from './db/schema'
import handleUpload from './controllers/upload'
import handleItem from './controllers/item'
import handleGetRandom from './controllers/random'
import handleGetTags from './controllers/tag'
import type { Env } from './utils/typedi'
// import { basicAuth } from '@eelkevdbos/elysia-basic-auth'

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
      .use(handleGetTags())
      .handle(request)
  },
  // async scheduled() // WIP
}
