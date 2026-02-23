// types/auto-imports.d.ts
// Esto ayuda a TypeScript a entender los auto-imports de Nuxt

// Auto-imports de Vue
declare global {
  // Vue Composition API
  const ref: typeof import('vue')['ref']
  const reactive: typeof import('vue')['reactive']
  const computed: typeof import('vue')['computed']
  const watch: typeof import('vue')['watch']
  const onMounted: typeof import('vue')['onMounted']
  const onUnmounted: typeof import('vue')['onUnmounted']
  const nextTick: typeof import('vue')['nextTick']
  
  // Nuxt
  const useRoute: typeof import('#app')['useRoute']
  const useRouter: typeof import('#app')['useRouter']
  const navigateTo: typeof import('#app')['navigateTo']
  const definePageMeta: typeof import('#app')['definePageMeta']
  const defineNuxtRouteMiddleware: typeof import('#app')['defineNuxtRouteMiddleware']
  const useRuntimeConfig: typeof import('#app')['useRuntimeConfig']
  
  // Nuxt composables
  const useState: typeof import('#app')['useState']
  const useFetch: typeof import('#app')['useFetch']
  const useAsyncData: typeof import('#app')['useAsyncData']
  
  // Componentes de Nuxt
  const NuxtLink: typeof import('#app')['NuxtLink']
  const NuxtPage: typeof import('#app')['NuxtPage']
}

export {}