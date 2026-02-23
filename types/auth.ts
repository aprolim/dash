// types/auth.ts
export interface User {
  id: number
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER' | 'CITIZEN'
  profile?: {
    firstName?: string
    lastName?: string
    position?: string
    avatar?: string
  }
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}