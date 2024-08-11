import Elysia from 'elysia'
import oauth2, { type TOAuth2AccessToken, type TOAuth2Provider } from '@bogeychan/elysia-oauth2'
import { eq } from 'drizzle-orm'
import { getDB, getEnv } from './utils/typedi'
import { states } from './db/schema'

function generateRandomString(len: number) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

type ProfileName = 'bangumi' | 'github'
// ! One use github to login might be logged as last bangumi user
const globalToken: Record<ProfileName, TOAuth2AccessToken | null> = {
  bangumi: null,
  github: null,
}

export default function setup() {
  const env = getEnv()
  const db = getDB()
  function myGithub(): TOAuth2Provider {
    return {
      clientId: env.CLIENT_ID,
      clientSecret: env.CLIENT_SECRET,
      auth: {
        url: 'https://github.com/login/oauth/authorize',
        params: {
          allow_signup: true,
          redirect_uri: 'https://random-elysia-api.nickchen.top/login/github/authorized',
          response_type: 'code',
        },
      },
      token: {
        url: 'https://github.com/login/oauth/access_token',
        params: {},
      },
    }
  }
  function bangumi(): TOAuth2Provider {
    return {
      clientId: env.BGM_CLIENT_ID,
      clientSecret: env.BGM_CLIENT_SECRET,
      auth: {
        url: 'https://bgm.tv/oauth/authorize',
        params: {
          redirect_uri: 'https://random-elysia-api.nickchen.top/login/bangumi/authorized',
          response_type: 'code',
        },
      },
      token: {
        url: 'https://bgm.tv/oauth/access_token',
        params: {},
      },
    }
  }
  return new Elysia({ aot: false })
    .use(oauth2({
      host: 'random-elysia-api.nickchen.top',
      redirectTo: '/authed',
      profiles: {
        github: {
          provider: myGithub(),
          scope: ['read:user'],
        },
        bangumi: {
          provider: bangumi(),
          scope: [],
        },
      },
      state: {
        async check(_ctx, _name, state) {
          const dbState = await db.select().from(states).where(eq(states.state, state))
          db.delete(states).where(eq(states.state, state))
          if (dbState.length === 0)
            return false
          return true
        },
        async generate(_ctx, _name) {
          const state = generateRandomString(12)
          await db.insert(states).values({ state })
          return state
        },
      },
      storage: {
        // TODO: storage in database
        get(_ctx, name) {
          return globalToken![name] as TOAuth2AccessToken
        },
        set(ctx, name, token) {
          globalToken![name] = token
          ctx.cookie.token!.value = JSON.stringify(token)
          ctx.cookie.token!.path = '/authed'
        },
        delete(_ctx, name) {
          globalToken![name] = null
        },
      },
    }),
    )
}
