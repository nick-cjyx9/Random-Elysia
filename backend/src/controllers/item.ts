import { eq } from 'drizzle-orm'
import { Elysia, t } from 'elysia'
import jwt from '@elysiajs/jwt'
import { getDB, getEnv } from '../utils/typedi'
import { images } from '../db/schema'
import { validateJWT } from './authed'

export default function handleItem() {
  return new Elysia({ aot: false })
    .group('/item', (app) => {
      const db = getDB()
      const env = getEnv()
      return app
        .use(jwt({
          name: 'jwt',
          secret: getEnv().JWT_SECRET,
        }))
        .post('/new', async ({ body: { link, del_link, tags }, cookie: { verification }, jwt }) => {
          const profile = await validateJWT(verification?.value as string, jwt)
          if (!profile)
            return { success: false, message: 'Permission Denied' }
          if (profile.role === 2)
            return { success: false, message: 'You do not have permission to upload pictures.' }
          const new_item = await db.insert(images).values({ uid: profile.id, link, del_link, tags: tags.join(','), likes: 0, dislikes: 0 }).returning()
          return {
            success: true,
            data: new_item[0],
          }
        }, {
          body: t.Object({
            link: t.String({ format: 'uri' }),
            del_link: t.String({ format: 'uri' }),
            tags: t.Array(t.String()),
          }),
        })
        .get('/getAll', async ({ cookie: { verification }, jwt }) => {
          const profile = await validateJWT(verification?.value as string, jwt)
          if (!profile)
            return { success: false, message: 'Permission Denied' }
          if (profile.role === 0)
            return { success: true, data: await db.query.images.findMany() }
          return {
            success: true,
            data: await db.query.images.findMany(
              {
                where: (images, { eq }) => (eq(images.uid, profile.id)),
              },
            ),
          }
        })
        .delete('/:id', async ({ params: { id }, cookie: { verification }, jwt }) => {
          const profile = await validateJWT(verification?.value as string, jwt)
          if (!profile)
            return { success: false, message: 'Permission Denied' }
          const del_item = await db.delete(images).where(eq(images.id, id)).returning()
          if (!del_item[0])
            return { success: false, message: 'The picture does not exist.' }
          if (del_item[0].uid !== profile.id || profile.role !== 0)
            return { success: false, message: 'You do not have permission to delete this picture.' }
          const resp = await fetch(del_item[0].del_link, {
            headers: {
              Authorization: env.SMMS_TOKEN as string,
            },
          })
          const resp_data: any = await resp.json()
          if (!resp_data.success || !resp.ok)
            return { success: true, message: 'Successfully deleted record in db, but failed to delete sm.ms image.' }
          return { success: true }
        }, {
          params: t.Object({
            id: t.Number(),
          }),
        })
        .post('/:id/like', async ({ params: { id }, cookie: { verification }, jwt }) => {
          const profile = await validateJWT(verification?.value as string, jwt)
          if (!profile)
            return { success: false, message: 'Permission Denied' }
          if (profile.role === 2)
            return { success: false, message: 'You do not have permission to like pictures.' }
          const like_item = await db.select().from(images).where(eq(images.id, id))
          if (!like_item[0])
            return { success: false, message: 'The picture does not exist.' }
          const new_likes = like_item[0].likes + 1
          await db.update(images).set({ likes: new_likes }).where(eq(images.id, id))
          return { success: true, data: { likes: new_likes } }
        }, {
          params: t.Object({
            id: t.Number(),
          }),
        })
        .post('/:id/dislike', async ({ params: { id }, cookie: { verification }, jwt }) => {
          const profile = await validateJWT(verification?.value as string, jwt)
          if (!profile)
            return { success: false, message: 'Permission Denied' }
          if (profile.role === 2)
            return { success: false, message: 'You do not have permission to dislike pictures.' }
          const dislike_item = await db.select().from(images).where(eq(images.id, id))
          if (!dislike_item[0])
            return { success: false, message: 'The picture does not exist.' }
          const new_dislikes = dislike_item[0].dislikes + 1
          await db.update(images).set({ dislikes: new_dislikes }).where(eq(images.id, id))
          return { success: true, data: { dislikes: new_dislikes } }
        }, {
          params: t.Object({
            id: t.Number(),
          }),
        })
    })
}
