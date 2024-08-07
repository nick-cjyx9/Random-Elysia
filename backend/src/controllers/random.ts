import { Elysia } from 'elysia'
import { getDB } from '../utils/typedi'
import * as schema from '../db/schema'

export default function handleGetRandom() {
  return new Elysia({ aot: false }).get('/random_by_weight', async () => {
    const db = getDB()
    // forgive my writing this shit algorithm
    const images = await db.select().from(schema.images).all()
    const ranked_images: any[] = []
    let min_rank = Infinity
    // count the rank
    images.forEach((image) => {
      const rank = image.likes - image.dislikes
      ranked_images.push({ ...image, rank })
      if (rank < min_rank)
        min_rank = rank
    })
    // process the ranks to avoid it <=0
    if (min_rank <= 0)
      ranked_images.forEach((image) => { image.rank += 1 - min_rank })
    // Larger rank, fronter position
    ranked_images.sort((a, b) => b.rank - a.rank)
    const sum = ranked_images.reduce((acc, image) => acc + image.rank, 0)
    const randint = Math.floor(Math.random() * sum) + 1
    let curr_sum = 0
    for (const image of ranked_images) {
      curr_sum += image.rank
      if (randint <= curr_sum)
        return image
    }
  })
    .get('/random', async () => {
      const db = getDB()
      const images = await db.select().from(schema.images).all()
      const randint = Math.floor(Math.random() * images.length)
      return images[randint]
    })
}
