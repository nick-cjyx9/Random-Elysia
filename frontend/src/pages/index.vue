<script setup lang="ts">
import { client } from '~/main'

const img_link: Ref<undefined | string> = ref()

onMounted(async () => {
  const { data } = await client.random.get()
  img_link.value = data?.link
})
</script>

<template>
  <div flex justify-center>
    <img v-show="img_link" :src="img_link" alt="random elysia">
  </div>
</template>
