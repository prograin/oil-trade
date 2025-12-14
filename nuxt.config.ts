// nuxt.config.ts
import tailwindcss from '@tailwindcss/vite'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  css: ['~/assets/css/main.css', '~/assets/css/components.css', '~/assets/css/utilities.css'],
  modules: ['@nuxt/ui', 'nuxt-auth-utils'],
  devtools: { enabled: true },

  nitro: {
    preset: 'cloudflare', // IMPORTANT: not cloudflare_durable
  },

  vite: {
    server: { watch: { usePolling: true } },
    plugins: [tailwindcss()],
  },
})
