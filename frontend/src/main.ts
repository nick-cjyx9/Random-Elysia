import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import '@unocss/reset/tailwind.css'
import './styles/main.css'
import 'uno.css'
import { treaty } from '@elysiajs/eden'
import type { App as Server } from '../../backend/src/controllers/all'
import App from './App.vue'

// eslint-disable-next-line ts/ban-ts-comment
// @ts-ignore
export const client = treaty<Server>('https://random_elysia.cjyx9.workers.dev')

const app = createApp(App)
const router = createRouter({
  routes,
  history: createWebHistory(import.meta.env.BASE_URL),
})
app.use(router)
app.mount('#app')
