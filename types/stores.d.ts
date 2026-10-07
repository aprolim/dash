// types/stores.d.ts
// Shim manual del store de auth (los getters/acciones que usan las vistas).
declare module '~/stores/auth' {
  import type { Role, User } from '~/types/auth'
  import type { ActionId, SectionId, SectionInfo } from '~/utils/roles'

  export const useAuthStore: () => {
    // State
    user: User | null
    token: string | null

    // Actions
    initialize: () => void
    verifyToken: () => Promise<boolean>
    refreshUser: () => Promise<boolean>
    login: (email: string, password: string) => Promise<{ user: User; token: string }>
    logout: () => void
    clearAuth: () => void
    goHome: () => void
    canView: (section: SectionId) => boolean
    can: (section: SectionId, action?: ActionId) => boolean

    // Getters
    role: Role | null
    roleLabel: string
    needsRelogin: boolean
    hasPanelAccess: boolean
    sections: SectionInfo[]
    homeRoute: string
    isSuperAdmin: boolean
    isAdmin: boolean
    userName: string
    isAuthenticated: boolean
    avatarInitials: string
  }
}
