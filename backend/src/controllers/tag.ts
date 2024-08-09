import Elysia, { t } from 'elysia'
import { getEnv } from '../utils/typedi'

export default function handleGetTags() {
  return new Elysia({ aot: false })
    .post('/getTags', async ({ body: { image } }) => {
      const AI = getEnv().AI
      // detailed describing to enhance accuracy
      const desc = await AI.run('@cf/llava-hf/llava-1.5-7b-hf', {
        image: [...new Uint8Array(await image.arrayBuffer())],
        prompt: `Please describe the main pink hair girl's expression, Try to use similar expressions like the following examples: 
          excited, happy, surprised, fear, sad, shy, disappointed, angry, neutral.`,
      })
      // uses another LLM to get structured ans
      const parsedTag = await AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: 'system', content: `I'll give you a piece description of a girl's picture.
            Please extract the adjectives it uses to describe the girls expression. Keep your answer only contains the adjective(s) linked by ','` },
          { role: 'user', content: 'The pink hair girl is smiling, which suggests that she is happy or excited.' },
          { role: 'assistant', content: 'happy, excited' },
          { role: 'user', content: desc.description },
        ],
        temperature: 0,
      })
      // @ts-expect-error cloudflare type error
      return parsedTag.response as string
    }, {
      body: t.Object({
        image: t.File({ type: 'image', maxSize: '5m' }),
      }),
    })
}
