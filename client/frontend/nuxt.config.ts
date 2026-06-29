// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/global.css'],

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Dosis:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&display=swap' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:4000',
    },
  },

  routeRules: {
    '/api/**': {
      proxy: 'http://localhost:4000/api/**',
    },
  },
})
