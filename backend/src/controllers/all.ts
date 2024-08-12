import cors from '@elysiajs/cors'
import Elysia from 'elysia'
import { getEnv } from '../utils/typedi'
import handleAuth from './oauth'
import handleUpload from './upload'
import handleItem from './item'
import handleGetRandom from './random'
import handleGetTags from './tag'

export function app() {
  return new Elysia({ aot: false })
    .use(cors({
      aot: false,
      origin: [getEnv().FRONTEND_URL, 'localhost:3333'],
      methods: '*',
      maxAge: 600,
      preflight: true,
      credentials: true,
    }))
    .onRequest(({ set }) => {
      // https://github.com/elysiajs/elysia-cors/issues/41#issuecomment-2282638086
      set.headers['access-control-allow-credentials'] = 'true'
    })
    .use(handleAuth())
    .use(handleGetRandom())
    .use(handleGetTags())
    .use(handleUpload())
    .use(handleItem())
    .get('/ping', () => 'pong')
}

export type App = ReturnType<typeof app>
