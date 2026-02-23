// types/stores.d.ts
declare module '~/stores/auth' {
  export interface User {
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

  export const useAuthStore: () => {
    // State
    user: User | null
    token: string | null
    
    // Actions
    initialize: () => void
    login: (email: string, password: string) => Promise<{ user: User, token: string }>
    logout: () => void
    clearAuth: () => void
    
    // Getters
    isAuthenticated: boolean
    avatarInitials: string
  }
}