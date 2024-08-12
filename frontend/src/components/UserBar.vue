<script setup lang="ts">
import { client } from '~/main'

const logged = ref(false)
const user: Ref<{
  avatar: string
  id: string
  username: string
} | undefined> = ref()

async function handleLogout() {
  await client.logout.get()
  // TODO
  await fetch('https://random-elysia-api.nickchen.top/logout/bangumi')
  await fetch('https://random-elysia-api.nickchen.top/logout/github')
  logged.value = false
  user.value = undefined
}

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
    <div v-if="logged" space-x-1 space-y-2>
      <span>you are logged as {{ user?.username }}</span>
      <a btn @click="handleLogout()">Logout</a>
      <a btn href="/manage">Your Images</a>
    </div>
    <div v-else space-x-3 space-y-2>
      <a href="https://random-elysia-api.nickchen.top/login/github" btn>Login with Github</a>
      <a href="https://random-elysia-api.nickchen.top/login/bangumi" btn>Login with Bangumi</a>
    </div>
  </div>
</template>
