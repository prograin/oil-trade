// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default {
  css: ["~/assets/css/main.css"],
  compatibilityDate: "2025-07-15",
  components: true,
  devtools: { enabled: true },
  vite: {
    plugins: [tailwindcss()],
  },
};
