import Elysia from 'elysia'
import oauth2, { type TOAuth2AccessToken, type TOAuth2Provider } from '@bogeychan/elysia-oauth2'
import { jwt } from '@elysiajs/jwt'
// import jsonwebtoken from 'jsonwebtoken'
import { getEnv } from './utils/typedi'

function randomBytes(size: number) {
  const tmp = []
  for (let i = 0; i < size; i++) {
    tmp.push((Math.floor(Math.random() * 256)).toString(16))
  }
  return tmp.join('')
}

const states = new Set()
type ProfileName = 'bangumi' | 'github'
const globalToken: Record<ProfileName, TOAuth2AccessToken | null> = {
  bangumi: null,
  github: null,
}

export default function setup() {
  const env = getEnv()
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
    .use(jwt({
      name: 'token',
      secret: env.JWT_SECRET,
    }))
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
        check(_ctx, _name, state) {
          if (states.has(state)) {
            states.delete(state)
            return true
          }
          else {
            return false
          }
        },
        generate(_ctx, _name) {
          const state = randomBytes(8)
          states.add(state)
          return state
        },
      },
      storage: {
        get(_ctx, name) {
          return globalToken![name] as TOAuth2AccessToken
        },
        set(_ctx, name, token) {
          globalToken![name] = token
        },
        delete(_ctx, name) {
          globalToken![name] = null
        },
      },

    }))
    .get('/authed', async ({ authorized, tokenHeaders }) => {
      if (await authorized('bangumi')) {
        const resp = await fetch('https://api.bgm.tv/v0/me', {
          headers: {
            'Authorization': (await tokenHeaders('bangumi')).Authorization,
            'User-Agent': 'Elysia',
          },
        })
        const user: any = await resp.json()
        return {
          avatar: user.avatar.medium,
          id: user.id,
          username: user.username,
        }
      }
      else if (await authorized('github')) {
        const resp = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': (await tokenHeaders('github')).Authorization,
            'User-Agent': 'Elysia',
          },
        })
        const user: any = await resp.json()
        return {
          avatar: user.avatar_url,
          id: user.id,
          username: user.login,
        }
      }
      else {
        return 'Unauthorized'
      }
    })
}
