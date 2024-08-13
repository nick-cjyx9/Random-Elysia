import Elysia, { t } from 'elysia'
import type { TOAuth2AccessToken } from '@bogeychan/elysia-oauth2'
import oauth2 from '@bogeychan/elysia-oauth2'
import { eq } from 'drizzle-orm'
import SparkMD5 from 'spark-md5'
import { jwt as elyJwt } from '@elysiajs/jwt'
import jwt from '@tsndr/cloudflare-worker-jwt'
import type { IProfileName } from '../utils/oauth2Providers'
import { bangumi, local, myGithub } from '../utils/oauth2Providers'
import { getDB, getEnv } from '../utils/typedi'
import { states, users } from '../db/schema'
import generateRandomString from '../utils/generateRandomString'

export async function getOAuthUser(name: IProfileName, access_token: string) {
  const headers = new Headers({
    'Authorization': `Bearer ${access_token}`,
    'User-Agent': 'Elysia',
  })
  if (name === 'bangumi' || name === 'local') {
    const resp = await fetch('https://api.bgm.tv/v0/me', { headers })
    // https://github.com/bangumi/api/blob/master/docs-raw/How-to-Auth.md
    // https://bangumi.github.io/api/#/%E7%94%A8%E6%88%B7/getMyself
    if (resp.status === 403)
      throw new Error('Unauthorized')
    const user: any = await resp.json()
    return {
      username: user.username,
      id: `bangumi:${user.id}`,
      avatar: user.avatar.medium,
    }
  }
  else {
    // https://docs.github.com/zh/rest/users/users?apiVersion=2022-11-28#get-the-authenticated-user
    const resp = await fetch('https://api.github.com/user', { headers })
    if (resp.status === 403)
      throw new Error('Unauthorized')
    const user: any = await resp.json()
    return {
      username: user.login,
      id: `github:${user.id}`,
      avatar: user.avatar_url,
    }
  }
}

export interface IJWTPayload {
  uid: string
  username: string
  token: TOAuth2AccessToken
  fingerPrint: string
  iat: number
  exp: number
}

export const ICookie = t.Cookie({
  elysia_token: t.Optional(t.String()),
  finger: t.Optional(t.String()),
  user_role: t.Optional(t.String()),
})

function isIJWTPayload(profile: any): profile is IJWTPayload {
  return (profile as IJWTPayload).uid !== undefined
}

export async function validateJWT(jwt: string | null | undefined, validater: any, finger: string | null | undefined) {
  if (!jwt || !finger)
    throw new Error('Unauthorized')
  const profile: unknown = await validater.verify(jwt)
  if (!profile)
    throw new Error('Unauthorized')
  if (!isIJWTPayload(profile))
    throw new Error('Broken JWT token')
  if (SparkMD5.hash(finger) !== profile.fingerPrint)
    throw new Error('Fingerprint mismatch')
  return profile
}

export function setupOAuth2() {
  const env = getEnv()
  const db = getDB()

  return new Elysia({ aot: false })
    .use(oauth2({
      host: env.BACKEND_URL,
      redirectTo: env.FRONTEND_URL,
      profiles: {
        github: {
          provider: myGithub(env),
          scope: ['read:user'],
        },
        bangumi: {
          provider: bangumi(env),
          // bangumi serverside not implemented
          scope: [],
        },
        local: {
          provider: local(env),
          scope: [],
        },
      },
      state: {
      // ! It's not a good idea to store state in a database, planning to replace it in the future
        async check(_ctx, _name, state) {
          const dbState = await db.select().from(states).where(eq(states.state, state))
          // delete state from db
          await db.delete(states).where(eq(states.state, state))
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
      // ! sign it and store jwt in cookie to defend CSRF,
      // ! including user's finger's hash in jwt payload to avoid the token from being stolen
      // ! but the problem is that we still can't defend XSS attack
        async get(ctx, _name) {
          const elysia_token = ctx.cookie.elysia_token?.value
          if (!elysia_token)
            throw new Error('Token not found')
          const profile: unknown = jwt.verify(elysia_token, env.JWT_SECRET)
          if (!isIJWTPayload(profile))
            throw new Error('Broken JWT token')
          return profile.token
        },
        async set(ctx, name, token) {
          if (!ctx.cookie.finger || !ctx.cookie.finger.value)
            throw new Error('Finger not found')
          // ! once you lose your finger, you have to re-login
          const fingerPrint = SparkMD5.hash(ctx.cookie.finger.value)
          const { id, username, avatar } = await getOAuthUser(name, token.access_token)

          if (!id || !username || !avatar)
            throw new Error('Error when fetching github /user api')
          const dbUser = await db.query.users.findFirst({
            where: (users, { eq }) => (eq(users.id, id)),
          })
          if (!dbUser)
            await db.insert(users).values({ id, username, avatar, role: 1 })
          // broken
          const payload = {
            uid: id,
            username,
            token,
            fingerPrint,
            iat: Math.floor(Date.now() / 1000),
          }
          ctx.cookie.elysia_token?.set({
            value: await jwt.sign(payload, env.JWT_SECRET),
            // TODO:Silently refresh user's access_token in /profile endpoint
            maxAge: token.expires_in,
            path: '/',
            httpOnly: true,
            secure: true,
          })
        },
        delete(ctx, _name) {
          ctx.cookie.elysia_token?.remove()
          ctx.cookie.finger?.remove()
          ctx.cookie.user_role?.remove()
        },
      },
    }),
    )
}

export default function handleAuth() {
  const db = getDB()
  return new Elysia({ aot: false })
    .use(elyJwt({
      name: 'jwt',
      secret: getEnv().JWT_SECRET,
    }))
    .use(setupOAuth2())
    .get('/profile', async ({ cookie: { elysia_token, finger, user_role }, jwt }) => {
      // ! This endpoint will be firstly requested each time when users visit our frontend
      // ! and that's the proper time to set user's finger
      if (!finger || !finger.value) {
        const fingerprint = generateRandomString(32)
        finger?.set({
          value: fingerprint,
          maxAge: 100 * 365 * 24 * 60 * 60,
          path: '/',
          httpOnly: true,
          secure: true,
        })
        return { success: false, message: 'Please login!' }
      }
      let profile: undefined | IJWTPayload
      try {
        profile = await validateJWT(elysia_token.value, jwt, finger.value)
      }
      catch {
        return { success: false, message: `Please login!` }
      }
      const dbUser = await db.query.users.findFirst({
        where: (users, { eq }) => (eq(users.id, profile?.uid)),
      })
      // TODO: don't save role to single cookie
      user_role.set({
        // think twice
        value: await jwt.sign({ role: dbUser?.role || '1' }),
        maxAge: 100 * 365 * 24 * 60 * 60,
        path: '/',
        httpOnly: true,
        secure: true,
      })
      return {
        success: true,
        data: dbUser,
      }
    }, { cookie: ICookie })
    // visit this endpoint to check your auth endpoints
    .get('/auth_profiles', ctx => ctx.profiles)
}
