import Elysia from 'elysia'
import { jwt } from '@elysiajs/jwt'
import setup from '../setup'
import { getDB, getEnv } from '../utils/typedi'
import { users } from '../db/schema'
// import type { TOAuth2AccessToken } from '@bogeychan/elysia-oauth2'

enum Role {
  ADMIN = 0,
  USER = 1,
  BANNED = 2,
}

interface IMessage {
  [key: string]: string | number
  avatar: string
  id: string
  username: string
  logout: string
  tokens: string
  role: Role
}

export async function validateJWT(jwt: string, validater: any) {
  const profile: unknown = await validater.verify(jwt)
  if (!profile) {
    return false
  }
  function isIMessage(profile: any): profile is IMessage {
    return (profile as IMessage).id !== undefined
  }
  if (!isIMessage(profile)) {
    return false
  }
  return profile
}

export default function handleAuthed() {
  return new Elysia({ aot: false })
    .use(setup())
    .use(jwt({
      name: 'jwt',
      secret: getEnv().JWT_SECRET,
    }))
    .get('/authed', async ({ authorized, tokenHeaders, profiles, cookie: { token, verification }, jwt }) => {
      if (token === undefined || token.value === undefined)
        return 'Unauthorized'
      let message: IMessage | undefined
      if (await authorized('bangumi')) {
        const resp = await fetch('https://api.bgm.tv/v0/me', {
          headers: {
            'Authorization': (await tokenHeaders('bangumi')).Authorization,
            'User-Agent': 'Elysia',
          },
        })
        const user: any = await resp.json()
        message = {
          avatar: user.avatar.medium,
          id: `bangumi:${user.id}`,
          username: user.username,
          logout: profiles('bangumi').bangumi.logout,
          tokens: token.value,
          role: Role.USER,
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
        message = {
          avatar: user.avatar_url,
          id: `github:${user.id}`,
          username: user.login,
          logout: profiles('github').github.logout,
          tokens: token.value,
          role: Role.USER,
        }
      }
      // ! There's still secure problem that the access token is briefly exposed in token
      token.remove()
      if (!message)
        return 'Unauthorized'
      const db = getDB()
      const db_user = await db.query.users.findFirst({
        where: (users, { eq }) => (eq(users.id, message.id)),
      })
      if (!db_user) {
        await db.insert(users).values({
          id: message.id,
          username: message.username,
          avatar: message.avatar,
          role: message.role,
        })
      }
      else {
        message.role = db_user.role
      }
      verification?.set({
        value: await jwt.sign(message),
        maxAge: 31536000,
        path: '/',
        httpOnly: true,
        secure: true,
      })
      const response = new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Redirecting...</title>
          </head>
          <body>
            <h1>Redirecting...</h1>
            <script>
              window.location.href = "https://${getEnv().FRONTEND_URL}";
            </script>
          </body>
        </html>
        `, {
        status: 200,
        statusText: 'OK',
        headers: new Headers({
          'Content-Type': 'text/html',
          // 'Set-Cookie': `verification=${await jwt.sign(message)}; Domain=${getEnv().BASE_URL}; Secure; Max-Age=31536000;`,
          'Location': getEnv().FRONTEND_URL,
        }),
      })
      return response
    })
    .get('/profile', async ({ cookie: { verification }, jwt }) => {
      const profile = await validateJWT(verification?.value as string, jwt)
      if (!profile)
        return { success: false }
      // TODO: if token expired, refresh it
      // const tokens: TOAuth2AccessToken = JSON.parse(profile.tokens)
      // if (tokens.expires_in < Date.now()) {
      // }
      return {
        success: true,
        data: {
          avatar: profile.avatar,
          id: profile.id,
          username: profile.username,
          logout: profile.logout,
          role: profile.role,
        },
      }
    })
    .get('/logout', async ({ cookie: { verification } }) => {
      verification?.remove()
      return { success: true }
    })
}
