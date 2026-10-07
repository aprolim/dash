// nuxt.config.ts
export default defineNuxtConfig({
  // Habilita el modo Nuxt 4 si aún estás en la versión v3.x 
  // o asegura la compatibilidad si ya estás en v4
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },
  devServer: {
    host: '0.0.0.0',  // Escucha en todas las interfaces
    port: 3002
  },
  ssr: false,

  // URL del backend. Se puede sobreescribir sin tocar el código:
  //   NUXT_PUBLIC_API_URL=http://localhost:3000/api npm run dev
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'https://demoback.senado.gob.bo/api',
    },
  },
  
  modules: [
    '@pinia/nuxt',
  ],
  
  // TypeScript en Nuxt 4 es casi automático
  typescript: {
    strict: false, // Cámbialo a true cuando puedas para mejor experiencia
    typeCheck: false,
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false, // Permite imports anidados
      extensions: ['.vue'],
    }
  ],
  
  // Importaciones: Nuxt ya escanea 'composables' y 'components' por defecto.
  // Solo necesitas agregar 'stores' si no se detectan automáticamente.
  imports: {
    dirs: ['stores'],
  },
  
  css: ['~/assets/css/tailwind.css'],
  
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  
  app: {
    head: {
      title: 'Senado Bolivia - Admin',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
})