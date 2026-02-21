import process from 'node:process';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  srcDir: 'app',

  modules: [
    'nuxt-auth-utils',
    'reka-ui/nuxt',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/image',
  ],

  runtimeConfig: {
    // Deno backend URL (server-side only)
    denoApiUrl: process.env.DENO_API_URL || 'http://localhost:8000',
    oauth: {
      google: {
        clientId: '',
        clientSecret: '',
      },
    },
  },

  css: ['~/assets/css/flexoki.css'],

  app: {
    head: {
      title: 'Yndu - Fresh Produce Delivery',
      titleTemplate: '%s | Yndu',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { name: 'theme-color', content: '#F0EEE9' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' },
        {
          name: 'description',
          content:
            'Fresh produce delivery in Nairobi. Order vegetables, fruits, and herbs directly from Kibwezi farms.',
        },
        // Open Graph
        { property: 'og:site_name', content: 'Yndu' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Yndu - Fresh Produce Delivery' },
        {
          property: 'og:description',
          content:
            'Fresh produce delivery in Nairobi. Order vegetables, fruits, and herbs directly from Kibwezi farms.',
        },
        { property: 'og:image', content: '/og-image.jpg' }, // Needs actual image
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Yndu - Fresh Produce Delivery' },
        {
          name: 'twitter:description',
          content:
            'Fresh produce delivery in Nairobi. Order vegetables, fruits, and herbs directly from Kibwezi farms.',
        },
        { name: 'twitter:image', content: '/og-image.jpg' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preload', as: 'image', href: '/main.JPG' },
        {
          rel: 'stylesheet',
          href:
            'https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Instrument+Serif:ital@0;1&display=swap',
        },
        {
          rel: 'stylesheet',
          href:
            'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,,GRAD@wght,FILL20..48,100..700,0..1,0..1',
        },
      ],
    },
  },

  // Tailwind configuration
  tailwindcss: {
    cssPath: '~/assets/css/flexoki.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    viewer: true,
  },

  // Image configuration
  image: {
    dir: 'assets/images',
  },

  // Production route rules
  routeRules: {
    '/shop/**': { swr: 3600 },
    '/admin/**': { ssr: false },
  },

  experimental: {
    payloadExtraction: true,
  },

  plugins: [
    '~/plugins/auth-refresh.ts',
  ],
});
