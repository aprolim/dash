// composables/useApi.ts
import { useAuthStore } from '~/stores/auth'

export const useApi = () => {
  const authStore = useAuthStore()

  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    const token = localStorage.getItem('auth_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      console.log('🔵 [useApi] Token presente en headers')
    } else {
      console.log('🔴 [useApi] NO hay token')
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
    console.log('🔵 [useApi] Respuesta exitosa, data keys:', Object.keys(data))
    return data.data || data
  }

  return {
    get: async <T>(url: string): Promise<T> => {
      console.log(`🔵 [useApi] GET ${url}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      })
      return handleResponse<T>(response, url)
    },

    post: async <T>(url: string, body: any): Promise<T> => {
      console.log(`🔵 [useApi] POST ${url}`)
      console.log('🔵 Body enviado:', { 
        ...body, 
        content: body.content ? `${body.content.substring(0, 100)}...` : 'vacio',
        status: body.status
      })
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      })
      return handleResponse<T>(response, url)
    },

    put: async <T>(url: string, body: any): Promise<T> => {
      console.log(`🔵 [useApi] PUT ${url}`)
      console.log('🔵 Body enviado:', { ...body, status: body.status })
      const response = await fetch(url, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body),
      })
      return handleResponse<T>(response, url)
    },

    del: async <T>(url: string): Promise<T> => {
      console.log(`🔵 [useApi] DELETE ${url}`)
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      return handleResponse<T>(response, url)
    },
  }
}