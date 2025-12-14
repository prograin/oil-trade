// nuxt.config.ts
import tailwindcss from '@tailwindcss/vite'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  css: ['~/assets/css/main.css', '~/assets/css/components.css', '~/assets/css/utilities.css'],
  modules: ['@nuxt/ui', 'nuxt-auth-utils'],
  devtools: { enabled: true },

  nitro: {
    preset: 'cloudflare_module', // <---this just work
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },

  vite: {
    server: { watch: { usePolling: true } },
    plugins: [tailwindcss()],
  },
})
