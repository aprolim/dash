// stores/auth.ts
import { defineStore } from 'pinia'

interface User {
  id: number
  email: string
  name: string
  role: string
  profile?: {
    firstName?: string
    lastName?: string
    position?: string
    avatar?: string
  }
}

interface LoginResponse {
  success: boolean
  data: {
    user: User
    tokens: {
      accessToken: string
      refreshToken: string
      expiresIn: number
    }
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),

  actions: {
    // Inicializar desde localStorage
    initialize() {
      console.log('🔍 Inicializando AuthStore...')
      
      if (typeof window === 'undefined') {
        console.log('⚠️ Window no disponible (SSR)')
        return
      }
      
      const token = localStorage.getItem('auth_token')
      const userStr = localStorage.getItem('user')
      
      console.log('📦 Token en localStorage:', token ? token.substring(0, 20) + '...' : 'null')
      console.log('📦 User en localStorage:', userStr ? 'presente' : 'null')
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          this.token = token
          this.user = user
          console.log('✅ Sesión restaurada para:', user.email)
          console.log('🔑 Token:', token.substring(0, 30) + '...')
        } catch (error) {
          console.error('❌ Error parsing user:', error)
          this.clearAuth()
        }
      } else {
        console.log('ℹ️ No hay sesión previa')
      }
    },
    
    // Login REAL con el backend
    async login(email: string, password: string) {
      console.log('🔐 Iniciando login con:', email)
      
      try {
        console.log('📡 Enviando petición a http://localhost:3000/api/auth/login')
        
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password })
        })

        console.log('📥 Status de respuesta:', response.status)
        
        const data = await response.json()
        console.log('📦 Datos recibidos:', data)

        if (!response.ok) {
          throw new Error(data.message || `Error ${response.status}`)
        }

        if (!data.success) {
          throw new Error(data.message || 'Error de autenticación')
        }

        // Extraer datos de la respuesta
        const { user, tokens } = data.data
        const token = tokens.accessToken
        
        console.log('✅ Login exitoso!')
        console.log('👤 Usuario:', user.email)
        console.log('🔑 Token recibido:', token.substring(0, 50) + '...')
        
        // Guardar en localStorage
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        console.log('💾 Token guardado en localStorage')
        
        // Verificar que se guardó
        const savedToken = localStorage.getItem('auth_token')
        console.log('🔍 Verificación - Token guardado:', savedToken ? savedToken.substring(0, 30) + '...' : 'ERROR NO SE GUARDÓ')
        
        // Actualizar estado
        this.token = token
        this.user = user
        
        console.log('✅ Estado actualizado')
        
        return { user, token }
        
      } catch (error: any) {
        console.error('❌ Error en login:', error)
        this.clearAuth()
        throw error
      }
    },
    
    // Logout
    logout() {
      console.log('👋 Cerrando sesión')
      this.clearAuth()
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    },
    
    // Limpiar autenticación
    clearAuth() {
      console.log('🧹 Limpiando autenticación')
      this.user = null
      this.token = null
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        console.log('✅ localStorage limpiado')
      }
    },
  },
  
  getters: {
    // Verificar si está autenticado
    isAuthenticated(): boolean {
      return !!this.token
    },
    
    // Iniciales para avatar
    avatarInitials(): string {
      if (!this.user?.profile) return this.user?.name?.charAt(0) || 'U'
      const { firstName, lastName } = this.user.profile
      return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}` || 'U'
    },
  },
})

export type { User }