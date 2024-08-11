<script setup lang="ts">
import { client } from '~/main'

const logged = ref(false)
const user: Ref<{
  avatar: string
  id: string
  username: string
  logout: string
  role: number
} | undefined> = ref()

onMounted(async () => {
  const profile = await client.profile.get({
    fetch: {
      credentials: 'include',
    },
  })
  if (profile.data?.success && profile.data.data) {
    logged.value = true
    user.value = profile.data.data
  }
})
</script>

<template>
  <div>
    <div v-if="logged">
      <img :src="user?.avatar" alt="avatar">
      <span>{{ user?.username }}</span>
      <span>{{ user?.role }}</span>
      <span>{{ user?.id }}</span>
      <a :href="user?.logout">Logout</a>
    </div>
    <div v-else space-x-3>
      <a href="https://random-elysia-api.nickchen.top/login/github" btn>Login with Github</a>
      <a href="https://random-elysia-api.nickchen.top/login/bangumi" btn>Login with Bangumi</a>
    </div>
  </div>
</template>
