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
    }
    
    return headers
  }

  const handleResponse = async <T>(response: Response): Promise<T> => {
    // Si el token expiró o es inválido (401)
    if (response.status === 401) {
      console.log('🔐 Token expirado o inválido. Cerrando sesión...')
      
      // Limpiar almacenamiento local
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      
      // Limpiar store
      authStore.clearAuth()
      
      // Redirigir a login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login?session=expired'
      }
      
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.')
    }
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || `Error ${response.status}`)
    }
    
    const data = await response.json()
    return data.data || data
  }

  return {
    get: async <T>(url: string): Promise<T> => {
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      })
      return handleResponse<T>(response)
    },

    post: async <T>(url: string, body: any): Promise<T> => {
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      })
      return handleResponse<T>(response)
    },

    put: async <T>(url: string, body: any): Promise<T> => {
      const response = await fetch(url, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body),
      })
      return handleResponse<T>(response)
    },

    del: async <T>(url: string): Promise<T> => {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      return handleResponse<T>(response)
    },
  }
}