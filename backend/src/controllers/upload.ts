import Elysia, { t } from 'elysia'
import jwt from '@elysiajs/jwt'
import { getEnv } from '../utils/typedi'
import { validateJWT } from './authed'

async function sendSecurityMail(image: File, userid: string) {
  // TODO
  const data = btoa(String.fromCharCode(...new Uint8Array(await image.arrayBuffer())))
  const base64 = `data:${image.type};base64,${data}`
  const resp = await fetch('https://email.nickchen.top/api/sendEmail', {
    method: 'POST',
    body: JSON.stringify([{
      from: 'security@nickchen.top',
      to: 'i@nickchen.top',
      subject: 'Porn Image Detetcted',
      bodyText: '',
      bodyHtml: `user ${userid} has posted porn images to your site! <img src="${base64}" width=200/>`,
    }]),
    headers: {
      Authorization: `SECRET ${getEnv().MAILFLARE_SECRET}`,
    },
  })
  return resp.ok
}

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
      const AI = getEnv().AI
      const desc = await AI.run('@cf/llava-hf/llava-1.5-7b-hf', {
        image: [...new Uint8Array(await image.arrayBuffer())],
        prompt: `Is it a pornographic artwork?
if it is, give me "True".
if it is NOT, give me "False".`,
      })
      if (desc.description.trim().toLowerCase() === 'true') {
        const mail = await sendSecurityMail(image, profile.id)
        return { success: false, message: 'Pornographic Artwork', mail }
      }
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
      return {
        success: true,
        message: desc,
        ...resp_data.data,
      }
    }, {
      body: t.Object({
        // multipart/form-data: body typed as t.Object, and is 1 level deep with t.File
        image: t.File({ type: 'image', maxSize: '5m', maxItems: 1 }),
      }),
    })
}
