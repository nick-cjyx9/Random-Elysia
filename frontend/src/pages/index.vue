<script setup lang="ts">
import { client } from '~/main'

const id: Ref<undefined | number> = ref()
const img_link: Ref<undefined | string> = ref()
const likes: Ref<undefined | number> = ref(0)
const dislikes: Ref<undefined | number> = ref(0)
const time: Ref<undefined | string> = ref()
const tags: Ref<undefined | string[]> = ref()

async function handleLike(id: number) {
  client.item({ id }).like.post().then((resp) => {
    if (resp.data?.success) {
      likes.value = resp.data?.data?.likes
    }
  })
}

async function handleDislike(id: number) {
  client.item({ id }).dislike.post().then((resp) => {
    if (resp.data?.success) {
      dislikes.value = resp.data?.data?.dislikes
    }
  })
}

function handleRefresh() {
  location.reload()
}

onMounted(async () => {
  const { data } = await client.random.get()
  id.value = data?.id
  img_link.value = data?.link
  likes.value = data?.likes
  dislikes.value = data?.dislikes
  time.value = data?.createdAt
  tags.value = data?.tags?.split(',').filter((tag: string) => tag !== '')
})
</script>

<template>
  <div flex flex-col items-center justify-center space-y-4>
    <h1 text-size-4xl font-500 font-serif>
      Random <font text-pink-4>
        Elysia
      </font>
    </h1>
    <a href="/dev" hover:text-pink-4>🚀 click here to weight-added ver</a>
    <div v-if="img_link">
      <img :src="img_link" alt="random elysia" border-1 border-slate-5 rounded-md md:max-w-screen-md>
      <div h-4 w-full py-1 font-mono>
        <p v-if="tags" float-left>
          Tags: {{ tags.map(tag => `#${tag.trim()}`).join(' ') }}
        </p>
        <p float-right>
          Published at: {{ (new Date(time as string)).toLocaleDateString() }}
        </p>
      </div>
      <div mt-8 px-10 text-size-lg space-x-lg space-y-4>
        <button px-4 py-2 btn aria-label="like" @click="handleLike(id as number)">
          👍 Like {{ likes }}
        </button>
        <button px-4 py-2 btn aria-label="dislike" @click="handleDislike(id as number)">
          👎 Dislike {{ dislikes }}
        </button>
        <button px-4 py-2 btn aria-label="refresh" @click="handleRefresh()">
          🔁 Another
        </button>
      </div>
    </div>
    <div v-else h-sm w-full animate-pulse border-1 border-slate-5 rounded-md bg-slate-2 px-10 md:w-xl dark:bg-slate-8 />
  </div>
</template>
