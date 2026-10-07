// stores/auth.ts
import { defineStore } from 'pinia'
import type { LoginResult, Role, User } from '~/types/auth'
import { apiBaseUrl } from '~/utils/apiUrl'
import {
  can as canPerform,
  canView as canViewSection,
  hasPanelAccess as hasPanelAccessFor,
  homeRouteFor,
  normalizeRole,
  roleLabel as roleLabelOf,
  sectionsForRole,
  type ActionId,
  type SectionId,
  type SectionInfo,
} from '~/utils/roles'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user'

function readStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

/** El backend no manda "name": se arma con el perfil y, si no hay, con el email. */
function displayName(user: User | null): string {
  if (!user) return 'Usuario'
  if (user.name) return user.name
  const full = [user.profile?.firstName, user.profile?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
  return full || user.email || 'Usuario'
}

function initials(user: User | null): string {
  if (!user) return 'U'
  const { firstName, lastName } = user.profile || {}
  if (firstName || lastName) {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U'
  }
  return (user.email?.charAt(0) || 'U').toUpperCase()
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

      const token = localStorage.getItem(TOKEN_KEY)
      const user = readStoredUser()

      console.log('🔍 [AuthStore] Token:', token ? `${token.substring(0, 30)}...` : 'null')
      console.log('🔍 [AuthStore] User:', user ? `${user.email} (${user.role})` : 'null')

      if (!token || !user) {
        console.log('ℹ️ [AuthStore] No hay sesión previa')
        return
      }

      this.token = token
      this.user = user

      if (!normalizeRole(user.role)) {
        console.warn('⚠️ [AuthStore] La sesión guardada no tiene un rol válido; hay que volver a iniciar sesión')
        return
      }

      console.log('✅ [AuthStore] Sesión restaurada para:', user.email, '| Rol:', this.role)

      // Refrescar el usuario (rol y perfil) por si un administrador lo cambió
      this.refreshUser()
    },

    /**
     * Pide los datos actuales del usuario al backend y actualiza el rol guardado.
     * Evita que alguien siga viendo el menú de un rol que ya no tiene.
     */
    async refreshUser() {
      if (!this.token) return false

      const base = apiBaseUrl()

      try {
        const response = await fetch(`${base}/auth/me`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })

        // 403: la cuenta dejó de estar activa
        if (response.status === 403) {
          console.warn('⚠️ [AuthStore] La cuenta ya no está activa')
          this.clearAuth()
          if (typeof window !== 'undefined') window.location.href = '/auth/login'
          return false
        }

        // 401: token inválido o expirado
        if (response.status === 401) {
          console.warn('⚠️ [AuthStore] Token inválido o expirado')
          this.clearAuth()
          if (typeof window !== 'undefined') window.location.href = '/auth/login'
          return false
        }

        // Otros errores (por ejemplo un backend que aún no tiene /auth/me):
        // se valida el token como antes y se sigue con los datos guardados
        if (!response.ok) return this.verifyToken()

        const data = await response.json()
        const fresh = data?.data

        if (!fresh?.role) return this.verifyToken()

        const previousRole = this.role
        this.user = { ...(this.user || {}), ...fresh } as User

        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_KEY, JSON.stringify(this.user))
        }

        if (previousRole !== normalizeRole(fresh.role)) {
          console.log(`🔄 [AuthStore] Rol actualizado: ${previousRole} → ${fresh.role}`)
          // Si le cambiaron el rol, arranca en la sección que le corresponde ahora
          if (typeof window !== 'undefined') {
            window.location.href = homeRouteFor(normalizeRole(fresh.role))
          }
        } else {
          console.log('✅ [AuthStore] Usuario al día | Rol:', fresh.role)
        }

        return true
      } catch (error) {
        console.error('❌ [AuthStore] Error refrescando usuario:', error)
        return this.verifyToken()
      }
    },

    // Verificar si el token sigue siendo válido
    async verifyToken() {
      if (!this.token) return false

      console.log('🔍 [AuthStore] Verificando token...')

      const base = apiBaseUrl()

      try {
        const response = await fetch(`${base}/auth/validate`, {
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

      const base = apiBaseUrl()

      try {
        const response = await fetch(`${base}/auth/login`, {
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

        const { user, tokens } = data.data as LoginResult
        const token = tokens.accessToken

        // Guardar en localStorage
        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem(USER_KEY, JSON.stringify(user))

        // Actualizar estado
        this.token = token
        this.user = user

        const role = normalizeRole(user.role)
        console.log('✅ [AuthStore] Login exitoso! Rol:', role || 'SIN ROL RECONOCIDO')

        // Redirigir a la primera sección permitida para su rol
        if (typeof window !== 'undefined') {
          window.location.href = homeRouteFor(role)
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
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        console.log('✅ [AuthStore] localStorage limpiado')
      }
    },

    // Ir al inicio que le corresponde a su rol
    goHome() {
      if (typeof window !== 'undefined') {
        window.location.href = this.homeRoute
      }
    },

    // ============================================
    // PERMISOS (utils/roles.ts es la fuente de verdad)
    // ============================================

    canView(section: SectionId): boolean {
      return canViewSection(this.role, section)
    },

    can(section: SectionId, action: ActionId = 'view'): boolean {
      return canPerform(this.role, section, action)
    },
  },

  getters: {
    /**
     * Rol efectivo. Si el estado todavía no se inicializó (el middleware corre
     * antes del onMounted del layout) se lee directo de localStorage, así el
     * menú no parpadea.
     */
    role(state): Role | null {
      const fromState = normalizeRole(state.user?.role)
      if (fromState) return fromState

      const stored = readStoredUser()
      return stored ? normalizeRole(stored.role) : null
    },

    roleLabel(): string {
      return roleLabelOf(this.role)
    },

    /** Hay token guardado pero ningún rol reconocido: hay que volver a iniciar sesión. */
    needsRelogin(state): boolean {
      const hasToken = !!state.token ||
        (typeof window !== 'undefined' && !!localStorage.getItem(TOKEN_KEY))
      return hasToken && this.role === null
    },

    hasPanelAccess(): boolean {
      return hasPanelAccessFor(this.role)
    },

    sections(): SectionInfo[] {
      return sectionsForRole(this.role)
    },

    homeRoute(): string {
      return homeRouteFor(this.role)
    },

    isSuperAdmin(): boolean {
      return this.role === 'SUPER_ADMIN'
    },

    isAdmin(): boolean {
      return this.role === 'SUPER_ADMIN' || this.role === 'ADMIN'
    },

    userName(state): string {
      return displayName(state.user || readStoredUser())
    },

    isAuthenticated(): boolean {
      const hasToken = !!this.token
      const hasUser = !!this.user
      const hasLocalStorage = typeof window !== 'undefined' && !!localStorage.getItem(TOKEN_KEY)
      return hasToken && hasUser && hasLocalStorage
    },

    avatarInitials(state): string {
      return initials(state.user || readStoredUser())
    },
  },
})

export type { User, Role }
