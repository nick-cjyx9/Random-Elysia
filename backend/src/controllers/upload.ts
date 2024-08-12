import Elysia, { t } from 'elysia'
import jwt from '@elysiajs/jwt'
import { getEnv } from '../utils/typedi'
import { ICookie, validateJWT } from './oauth'

// eslint-disable-next-line regexp/no-super-linear-backtracking
const EMAIL_REGEX = /^(?:\s?(.*?)\s*<)?(.*?)>?$/

function parseEmail(text: string) {
  const [, name, email] = text.match(EMAIL_REGEX) || []
  if (!email) {
    throw new Error('Invalid email')
  }
  return { name, email }
}

function parseMultiEmail(email: string | string[]) {
  return (Array.isArray(email) ? email : [email])
    .flatMap(x => x.split(/,|;/).map(x => x.trim()))
    .map(parseEmail)
}

async function sendSecurityMail(image: File, userid: string) {
  // TODO detach these logics
  // upload to a image host which only allows 1 download
  const form = new FormData()
  form.append('file', image)
  // expires after 1 week
  form.append('expires', (new Date(Date.now() + 24 * 60 * 60 * 7 * 1000)).toISOString())
  form.append('maxDownloads', '1')
  form.append('autoDelete', 'true')
  const fileio_resp = await fetch('https://file.io/', {
    method: 'POST',
    body: form,
    headers: new Headers({
      'accept': 'application/json',
      'User-Agent': 'Elysia',
    }),
  })
  const fileio_data: any = await fileio_resp.json()
  const message = {
    from: 'security@nickchen.top',
    to: 'i@nickchen.top',
    subject: 'Porn Image Detetcted',
    bodyText: 'detected!',
    bodyHtml: `user ${userid} has posted porn images to your site! Link: ${fileio_data.link}`,
  }
  const from = parseEmail(message.from)
  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      subject: message.subject.trim(),
      personalizations: [{ to: parseMultiEmail(message.to) }],
      from,
      content: [
        message.bodyText && { type: 'text/plain', value: message.bodyText },
        message.bodyHtml && { type: 'text/html', value: message.bodyHtml },
      ].filter(x => !!x),
    }),
  }).catch(() => undefined)
  return response?.ok
}

export default function handleUpload() {
  return new Elysia({ aot: false })
    .use(jwt({
      name: 'jwt',
      secret: getEnv().JWT_SECRET,
    }))
    .post('/upload', async ({ body: { image }, cookie: { elysia_token, finger, user_role }, jwt }) => {
      const role = (await jwt.verify(user_role.value) as any).role
      if (role === 2)
        return { success: false, message: 'You do not have permission to upload pictures.' }
      const profile = await validateJWT(elysia_token.value, jwt, finger.value)
      const AI = getEnv().AI
      const desc = await AI.run('@cf/llava-hf/llava-1.5-7b-hf', {
        image: [...new Uint8Array(await image.arrayBuffer())],
        prompt: `Is it a pornographic artwork?
if it is, give me "True".
if it is NOT, give me "False".`,
      })
      if (desc.description.trim().toLowerCase() === 'true') {
        const mail = await sendSecurityMail(image, profile.uid)
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
      cookie: ICookie,
    })
}
