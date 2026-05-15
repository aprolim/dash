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
      const headers = getHeaders()
      console.log('🔵 [useApi] Headers:', Object.keys(headers))
      const response = await fetch(url, {
        method: 'GET',
        headers,
      })
      return handleResponse<T>(response, url)
    },

    post: async <T>(url: string, body: any): Promise<T> => {
      console.log(`🔵 [useApi] POST ${url}`)
      const headers = getHeaders()
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      return handleResponse<T>(response, url)
    },

    put: async <T>(url: string, body: any): Promise<T> => {
      console.log(`🔵 [useApi] PUT ${url}`)
      const headers = getHeaders()
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      })
      return handleResponse<T>(response, url)
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