import type { TOAuth2Provider } from '@bogeychan/elysia-oauth2'
import type { Env } from './typedi'

export function myGithub(env: Env): TOAuth2Provider {
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
export function myLocalGithub(env: Env): TOAuth2Provider {
  return {
    clientId: env.LOCAL_CLIENT_ID,
    clientSecret: env.LOCAL_CLIENT_SECRET,
    auth: {
      url: 'https://github.com/login/oauth/authorize',
      params: {
        allow_signup: true,
        redirect_uri: 'http://localhost:8787/login/localGithub/authorized',
        response_type: 'code',
      },
    },
    token: {
      url: 'https://github.com/login/oauth/access_token',
      params: {},
    },
  }
}

export function bangumi(env: Env): TOAuth2Provider {
  return {
    clientId: env.BGM_CLIENT_ID,
    clientSecret: env.BGM_CLIENT_SECRET,
    auth: {
      url: 'https://bgm.tv/oauth/authorize',
      params: {
        response_type: 'code',
      },
    },
    token: {
      url: 'https://bgm.tv/oauth/access_token',
      params: {},
    },
  }
}

export type IProfileName = 'bangumi' | 'github' | 'localGithub'
