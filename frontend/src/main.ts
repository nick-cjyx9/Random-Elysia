/* eslint-disable node/prefer-global/process */
import 'uno.css'
import './styles/main.css'
import '@unocss/reset/tailwind.css'
import { createApp } from 'vue'
import { treaty } from '@elysiajs/eden'
import { routes } from 'vue-router/auto-routes'
import { createRouter, createWebHistory } from 'vue-router'
import type { App as Server } from '../../backend/src/controllers/all'
import App from './App.vue'

// TODO
// @ts-expect-error I don't know why, but there's a error
export const client = treaty<Server>(process.env.NODE_ENV === '1development' ? 'http://localhost:8787' : 'https://random-elysia-api.nickchen.top')

const app = createApp(App)
const router = createRouter({
  routes,
  history: createWebHistory(import.meta.env.BASE_URL),
})

app.use(router)
app.mount('#app')
