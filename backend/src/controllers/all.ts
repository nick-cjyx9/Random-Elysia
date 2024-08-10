import cors from '@elysiajs/cors'
import Elysia from 'elysia'
import setup from '../setup'
import handleUpload from './upload'
import handleItem from './item'
import handleGetRandom from './random'
import handleGetTags from './tag'

export function app() {
  return new Elysia({ aot: false })
    .use(cors({ aot: false }))
    .use(setup())
    .use(handleGetRandom())
    .use(handleGetTags())
    .use(handleUpload())
    .use(handleItem())
    .get('/ping', () => 'pong')
    .get('/auth_profiles', ctx => ctx.profiles)
}

export type App = ReturnType<typeof app>
