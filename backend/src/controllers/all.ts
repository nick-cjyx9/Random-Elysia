import cors from '@elysiajs/cors'
import Elysia from 'elysia'
import setup from '../setup'
import { getEnv } from '../utils/typedi'
import handleAuthed from './authed'
import handleUpload from './upload'
import handleItem from './item'
import handleGetRandom from './random'
import handleGetTags from './tag'

export function app() {
  return new Elysia({ aot: false })
    .use(cors({
      aot: false,
      origin: getEnv().FRONTEND_URL,
      methods: '*',
      maxAge: 600,
      preflight: true,
      credentials: true,
    }))
    .use(handleAuthed())
    .use(handleGetRandom())
    .use(handleGetTags())
    .use(handleUpload())
    .use(handleItem())
    .get('/ping', () => 'pong')
    .use(setup())
    .get('/auth_profiles', ctx => ctx.profiles)
}

export type App = ReturnType<typeof app>
