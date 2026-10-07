// utils/apiUrl.ts
// URL base del API. Se puede apuntar a otro backend (por ejemplo el local)
// con la variable de entorno NUXT_PUBLIC_API_URL, sin tocar el código:
//   NUXT_PUBLIC_API_URL=http://localhost:3000/api npm run dev
export const DEFAULT_API_URL = 'https://demoback.senado.gob.bo/api'

export function apiBaseUrl(): string {
  try {
    const config = useRuntimeConfig()
    const url = (config as any)?.public?.apiUrl
    if (typeof url === 'string' && url) return url.replace(/\/+$/, '')
  } catch {
    // Fuera del contexto de Nuxt (o SSR): se usa el valor por defecto
  }
  return DEFAULT_API_URL
}
