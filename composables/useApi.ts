// composables/useApi.ts
import { useAuthStore } from '~/stores/auth'

export const useApi = () => {
  const authStore = useAuthStore()

  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }
    
    return headers
  }

  const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
      if (response.status === 401) {
        authStore.clearAuth()
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
      }
      const data = await response.json()
      throw new Error(data.message || 'Error en la petición')
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