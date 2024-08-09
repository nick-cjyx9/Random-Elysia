import Elysia, { t } from 'elysia'
import { getEnv } from '../utils/typedi'

export default function handleUpload() {
  return new Elysia({ aot: false })
    .post('/upload', async ({ body: { image } }) => {
      const data = new FormData()
      data.append('smfile', image)
      // forward the request to image upload server
      const api_base = `https://sm.ms/api/v2/upload`
      const resp = await fetch(api_base, {
        method: 'POST',
        headers: {
          Authorization: getEnv().SMMS_TOKEN as string,
        },
        body: data,
      })
      const resp_data: any = await resp.json()
      return resp_data.data
    }, {
      body: t.Object({
        // multipart/form-data: body typed as t.Object, and is 1 level deep with t.File
        image: t.File({ type: 'image', maxSize: '5m', maxItems: 1 }),
      }),
    })
}
