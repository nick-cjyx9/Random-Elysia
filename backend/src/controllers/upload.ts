import Elysia, { t } from 'elysia'
import jwt from '@elysiajs/jwt'
import { getEnv } from '../utils/typedi'
import { validateJWT } from './authed'

export default function handleUpload() {
  return new Elysia({ aot: false })
    .use(jwt({
      name: 'jwt',
      secret: getEnv().JWT_SECRET,
    }))
    .post('/upload', async ({ body: { image }, cookie: { verification }, jwt }) => {
      const profile = await validateJWT(verification?.value as string, jwt)
      if (!profile || profile.role === 2)
        return { success: false, message: 'Permission Denied' }
      const data = new FormData()
      data.append('smfile', image)
      // forward the request to image upload server
      const api_base = `https://sm.ms/api/v2/upload`
      const resp = await fetch(api_base, {
        method: 'POST',
        headers: {
          'Authorization': getEnv().SMMS_TOKEN as string,
          'User-Agent': 'Elysia',
        },
        body: data,
      })
      const resp_data: any = await resp.json()
      if (resp_data.code === 'image_repeated') {
        return {
          success: false,
          message: 'Image already exists',
        }
      }
      // https://doc.sm.ms/#api-Image-Upload
      return resp_data.data
    }, {
      body: t.Object({
        // multipart/form-data: body typed as t.Object, and is 1 level deep with t.File
        image: t.File({ type: 'image', maxSize: '5m', maxItems: 1 }),
      }),
    })
}
