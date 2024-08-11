import { treaty } from '@elysiajs/eden'
import { describe, expect, it } from 'bun:test'
import type { App } from '../controllers/all'

export const client = treaty<App>('https://random-elysia-api.nickchen.top')

const testImage = Bun.file('./src/test/test.jpg')

it('pingpong', async () => {
  const pong = await client.ping.get()
  expect(pong.data).toBe('pong')
})

describe('random', () => {
  it('without weight', async () => {
    const random = await client.random.get()
    expect(random.data?.id).toBeTypeOf('number')
  })
  it('with weight', async () => {
    const w_random = await client.random_by_weight.get()
    expect(w_random.data?.id).toBeTypeOf('number')
  })
})

describe('item', () => {
  let tags: string
  it.todo('getTag', async () => {
    tags = (await client.getTags.post({
      image: new File([await testImage.arrayBuffer()], 'test.jpg'),
    })).data as string
    expect(tags).toBeTypeOf('string')
  })
  it('getItems', async () => {
    const items = await client.item.getAll.get()
    expect(items.status).toBe(200)
    expect(items.data?.length).toBeGreaterThanOrEqual(0)
  })
  let uploadData: any
  it.todo('uploadImage', async () => {
    uploadData = await client.upload.post({
      image: new File([await testImage.arrayBuffer()], 'test.jpg'),
    })
    expect(uploadData.status).toBe(200)
    expect(uploadData.data?.url).toBeTypeOf('string')
  })
  let new_id: number
  it.todo('newItem', async () => {
    const newItem = await client.item.new.post({
      link: uploadData.data?.url,
      del_link: uploadData.data?.url,
      tags: tags.split(','),
    })
    new_id = newItem.data?.data?.id as number
    expect(newItem.status).toBe(200)
    expect(newItem.data?.success).toBeTrue()
  })
  it.todo('Like & dislike', async () => {
    const like = await client.item({ id: new_id }).like.post()
    expect(like.data?.success).toBeTrue()
    expect(like.data?.data?.likes).toBe(1)
    const dislike = await client.item({ id: new_id }).dislike.post()
    expect(dislike.data?.success).toBeTrue()
    expect(dislike.data?.data?.dislikes).toBe(1)
  })
  it.todo('delete Item', async () => {
    const del = await client.item({ id: new_id }).delete()
    expect(del.data?.success).toBeTrue()
    expect(del.data?.message).toBeUndefined()
  })
})
