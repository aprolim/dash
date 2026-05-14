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
      console.log('🔍 Inicializando AuthStore...')
      
      if (typeof window === 'undefined') {
        console.log('⚠️ Window no disponible (SSR)')
        return
      }
      
      const token = localStorage.getItem('auth_token')
      const userStr = localStorage.getItem('user')
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          this.token = token
          this.user = user
          console.log('✅ Sesión restaurada para:', user.email)
          
          // Verificar si el token sigue siendo válido
          this.verifyToken()
        } catch (error) {
          console.error('❌ Error parsing user:', error)
          this.clearAuth()
        }
      } else {
        console.log('ℹ️ No hay sesión previa')
      }
    },
    
    // Verificar si el token sigue siendo válido
    async verifyToken() {
      if (!this.token) return false
      
      try {
        const response = await fetch('http://demoback.senado.gob.bo/api/auth/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: this.token })
        })
        
        const data = await response.json()
        
        if (!data.valid) {
          console.log('⚠️ Token inválido o expirado, cerrando sesión')
          this.clearAuth()
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
          return false
        }
        
        return true
      } catch (error) {
        console.error('Error verificando token:', error)
        return false
      }
    },
    
    // Login
    async login(email: string, password: string) {
      console.log('🔐 Iniciando login con:', email)
      
      try {
        const response = await fetch('http://demoback.senado.gob.bo/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password })
        })

        const data = await response.json()

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
        
        console.log('✅ Login exitoso!')
        
        // Redirigir a dashboard
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard'
        }
        
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
    isAuthenticated(): boolean {
      const hasToken = !!this.token
      const hasUser = !!this.user
      const hasLocalStorage = typeof window !== 'undefined' && !!localStorage.getItem('auth_token')
      
      return hasToken && hasUser && hasLocalStorage
    },
    
    avatarInitials(): string {
      if (!this.user?.profile) return this.user?.name?.charAt(0) || 'U'
      const { firstName, lastName } = this.user.profile
      return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}` || 'U'
    },
  },
})

export type { User }