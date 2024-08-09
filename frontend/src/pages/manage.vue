<script setup lang="ts">
import { client } from '~/main'

const images: Ref<{
  id: number
  link: string
  del_link: string
  likes: number
  dislikes: number
  tags: string | null
  createdAt: string
}[] | undefined | null> = ref()

async function handleDelete(id: number) {
  await client.item({ id }).delete()
  // eslint-disable-next-line no-alert
  alert('Deleted')
  location.reload()
}

onMounted(async () => {
  const { data } = await client.item.getAll.get()
  images.value = data
})
</script>

<template>
  <div flex flex-col items-center justify-center space-y-xl>
    <h1 text-size-4xl font-500 font-serif>
      Random <font text-pink-4>
        Elysia
      </font><small text-size-xl>manage board</small>
    </h1>
  </div>
  <a href="/upload" hover:text-pink-4>➕ Add new image!</a>
  🥰 {{ images?.length }} in total now.
  <div flex flex-col items-center px-5>
    <ul v-show="images" w-full md:w-screen-md>
      <li v-for="image in images" :key="image.id" h-8 font-mono>
        <a :href="image.link" target="_blank" float-left>#{{ image.id }} · {{ (new Date(image.createdAt)).toLocaleDateString() }}</a>
        <button float-right hover:text-pink-4 @click="handleDelete(image.id)">
          delete
        </button>
      </li>
    </ul>
  </div>
</template>
