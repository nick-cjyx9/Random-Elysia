import { getEnv } from './typedi'

const env = getEnv() ?? Bun.env
const headers = {
  'Authorization': `Bearer ${env.API_KEY}`,
  'Content-Type': 'application/json',
}

export async function getImageDescription(path: string) {
  try {
    const blob = await Bun.file(path).arrayBuffer()
    const resp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/ai/run/@cf/llava-hf/llava-1.5-7b-hf?`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt: `Please describe the main pink hair girl's expression, including one or several of these words which you think is most correct: 
          excited, happy, surprised, fear, sad, shy, disappointed, angry, neutral.`,
        image: [...new Uint8Array(blob)],
        max_tokens: 2048,
      }),

    })
    return await resp.json()
  }
  catch (err) {
    if (err instanceof Error)
      console.error(err.message)
    else
      console.error('Unhandled error occurs!')
  }
}

export async function parseTag(raw: string) {
  try {
    const resp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages: [
          { role: 'system', content: `I'll give you a piece description of a girl's picture.
            Please extract the adjectives it uses to describe the girls expression. Only give me the adjective(s) linked by ','` },
          { role: 'user', content: 'The pink hair girl is smiling, which suggests that she is happy or excited.' },
          { role: 'assistant', content: 'happy, excited' },
          { role: 'user', content: raw },
        ],
        temperature: 0,
      }),
    })
    return await resp.json()
  }
  catch (err) {
    if (err instanceof Error)
      console.error(err.message)
    else
      console.error('Unhandled error occurs!')
  }
}

// getImageDescription('./images/raw/GMBW6pEXEAA6I-k.jpg').then(async (data) => {
//   console.log(data)
//   if (!data.success)
//     console.error(data.errors)
//   console.log((await parseTag(data.result.description)).result.response)
// })
