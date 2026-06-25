// composables/useApi.ts
import { useAuthStore } from '~/stores/auth'

export const useApi = () => {
  const authStore = useAuthStore()

  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    const token = localStorage.getItem('auth_token')
    console.log('🔑 [useApi.getHeaders] Token desde localStorage:', token ? `${token.substring(0, 30)}...` : 'NO HAY TOKEN')
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      console.log('🔑 [useApi.getHeaders] Header Authorization agregado')
    } else {
      console.log('🔴 [useApi.getHeaders] NO hay token en localStorage')
    }
    
    return headers
  }

  const handleResponse = async <T>(response: Response, url: string): Promise<T> => {
    console.log(`🔵 [useApi] Respuesta de ${url}: status ${response.status}`)
    
    if (response.status === 401) {
      console.log('🔴 [useApi] Token expirado, redirigiendo a login')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      authStore.clearAuth()
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login?session=expired'
      }
      throw new Error('Sesión expirada')
    }
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      console.log('🔴 [useApi] Error:', data)
      throw new Error(data.message || `Error ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🔵 [useApi] Respuesta exitosa')
    return data.data || data
  }

  return {
    get: async <T>(url: string): Promise<T> => {
      console.log(`🔵 [useApi] GET ${url}`)
      
      // 🔥 NUEVO: Agregar parámetro anti-caché
      const cacheBuster = `_=${Date.now()}`
      const separator = url.includes('?') ? '&' : '?'
      const finalUrl = `${url}${separator}${cacheBuster}`
      console.log(`🔵 [useApi] GET con anti-caché: ${finalUrl}`)
      
      const headers = getHeaders()
      const response = await fetch(finalUrl, {
        method: 'GET',
        headers,
        cache: 'no-store', // 🔥 NUEVO: Forzar a no usar caché
      })
      return handleResponse<T>(response, url)
    },

    post: async <T>(url: string, body: any): Promise<T> => {
      console.log(`🔵 [useApi] POST ${url}`)
      console.log('🔵 [useApi] Body:', body)
      const headers = getHeaders()
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      return handleResponse<T>(response, url)
    },

    put: async <T>(url: string, body: any): Promise<T> => {
      console.log(`🔵 [useApi.put] ========== PUT ==========`)
      console.log(`🔵 [useApi.put] URL: ${url}`)
      console.log('🔵 [useApi.put] Body recibido:', body)
      console.log('🔵 [useApi.put] publishedAt en body:', body.publishedAt)
      console.log('🔵 [useApi.put] scheduledFor en body:', body.scheduledFor)
      
      const headers = getHeaders()
      console.log('🔵 [useApi.put] Headers:', Object.keys(headers))
      
      // ✅ Asegurar que las fechas están en formato ISO
      if (body.publishedAt) {
        const dateObj = new Date(body.publishedAt)
        if (!isNaN(dateObj.getTime())) {
          body.publishedAt = dateObj.toISOString()
          console.log('🔵 [useApi.put] publishedAt convertido a ISO:', body.publishedAt)
        }
      }
      
      if (body.scheduledFor) {
        const dateObj = new Date(body.scheduledFor)
        if (!isNaN(dateObj.getTime())) {
          body.scheduledFor = dateObj.toISOString()
          console.log('🔵 [useApi.put] scheduledFor convertido a ISO:', body.scheduledFor)
        }
      }
      
      const bodyStr = JSON.stringify(body)
      console.log('🔵 [useApi.put] Body string:', bodyStr)
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: bodyStr
      })
      
      console.log(`🔵 [useApi.put] Status: ${response.status}`)
      
      const data = await response.json()
      console.log('🔵 [useApi.put] Respuesta:', data)
      console.log(`🔵 [useApi.put] ========== FIN PUT ==========`)
      
      return data.data || data
    },

    del: async <T>(url: string): Promise<T> => {
      console.log(`🔵 [useApi] DELETE ${url}`)
      const headers = getHeaders()
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      })
      return handleResponse<T>(response, url)
    },
  }
}