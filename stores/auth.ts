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

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),

  actions: {
    // Inicializar desde localStorage
    initialize() {
      console.log('🔍 [AuthStore] Inicializando...')
      
      if (typeof window === 'undefined') {
        console.log('⚠️ Window no disponible (SSR)')
        return
      }
      
      const token = localStorage.getItem('auth_token')
      const userStr = localStorage.getItem('user')
      
      console.log('🔍 [AuthStore] Token:', token ? `${token.substring(0, 30)}...` : 'null')
      console.log('🔍 [AuthStore] User:', userStr ? 'presente' : 'null')
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          this.token = token
          this.user = user
          console.log('✅ [AuthStore] Sesión restaurada para:', user.email)
          
          // Verificar si el token sigue siendo válido
          this.verifyToken()
        } catch (error) {
          console.error('❌ Error parsing user:', error)
          this.clearAuth()
        }
      } else {
        console.log('ℹ️ [AuthStore] No hay sesión previa')
      }
    },
    
    // Verificar si el token sigue siendo válido
    async verifyToken() {
      if (!this.token) return false
      
      console.log('🔍 [AuthStore] Verificando token...')
      
      try {
        const response = await fetch('http://demoback.senado.gob.bo/api/auth/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: this.token })
        })
        
        const data = await response.json()
        console.log('🔍 [AuthStore] Validación respuesta:', { valid: data.valid })
        
        if (!data.valid) {
          console.log('⚠️ [AuthStore] Token inválido o expirado, cerrando sesión')
          this.clearAuth()
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
          return false
        }
        
        console.log('✅ [AuthStore] Token válido')
        return true
      } catch (error) {
        console.error('❌ [AuthStore] Error verificando token:', error)
        return false
      }
    },
    
    // Login
    async login(email: string, password: string) {
      console.log('🔐 [AuthStore] Login con:', email)
      
      try {
        const response = await fetch('http://demoback.senado.gob.bo/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password })
        })

        const data = await response.json()
        console.log('📥 [AuthStore] Respuesta login:', { success: data.success, status: response.status })

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Error de autenticación')
        }

        const { user, tokens } = data.data
        const token = tokens.accessToken
        
        // Guardar en localStorage
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Actualizar estado
        this.token = token
        this.user = user
        
        console.log('✅ [AuthStore] Login exitoso! Redirigiendo a dashboard')
        
        // Redirigir a dashboard
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard'
        }
        
        return { user, token }
        
      } catch (error: any) {
        console.error('❌ [AuthStore] Error en login:', error)
        this.clearAuth()
        throw error
      }
    },
    
    // Logout
    logout() {
      console.log('👋 [AuthStore] Cerrando sesión')
      this.clearAuth()
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    },
    
    // Limpiar autenticación
    clearAuth() {
      console.log('🧹 [AuthStore] Limpiando autenticación')
      this.user = null
      this.token = null
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        console.log('✅ [AuthStore] localStorage limpiado')
      }
    },
  },
  
  getters: {
    isAuthenticated(): boolean {
      const hasToken = !!this.token
      const hasUser = !!this.user
      const hasLocalStorage = typeof window !== 'undefined' && !!localStorage.getItem('auth_token')
      const result = hasToken && hasUser && hasLocalStorage
      console.log('🔍 [AuthStore] isAuthenticated:', result, { hasToken, hasUser, hasLocalStorage })
      return result
    },
    
    avatarInitials(): string {
      if (!this.user?.profile) return this.user?.name?.charAt(0) || 'U'
      const { firstName, lastName } = this.user.profile
      return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}` || 'U'
    },
  },
})

export type { User }