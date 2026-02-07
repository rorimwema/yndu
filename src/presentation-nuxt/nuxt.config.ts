// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  srcDir: 'app',

  modules: [
    'reka-ui/nuxt',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  css: ['~/assets/css/flexoki.css'],

  app: {
    head: {
      title: 'Yndu - Fresh Produce Delivery',
      meta: [
        { name: 'theme-color', content: '#EDEECF' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
        // Preconnect to Google Fonts if needed, but we are using Inter from rsms.me or Google?
        // flexoki.css had: @import url('https://rsms.me/inter/inter.css');
        // AND index.html bad Google Fonts for Material Symbols (we removed those).
        // So just Inter is fine.
      ]
    }
  },

  // Tailwind configuration
  tailwindcss: {
    cssPath: '~/assets/css/flexoki.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    viewer: true,
  }
})
