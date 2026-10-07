// types/auth.ts
// Tipos compartidos de autenticación. Los roles deben coincidir con el enum
// del modelo User del backend (backend/src/models/User.js).

export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'EDITOR'
  | 'EDITOR_NOTICIAS'
  | 'EDITOR_SESIONES'
  | 'EDITOR_COMUNICADOS'
  | 'EDITOR_AUDITORIA'
  | 'MODERATOR'
  | 'VIEWER'
  | 'CITIZEN'

export type UserStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'PENDING'
  | 'LOCKED'

export interface UserProfile {
  firstName?: string
  lastName?: string
  ci?: string
  phone?: string
  position?: string
  department?: string
  avatar?: string
}

export interface User {
  /** MongoDB devuelve _id */
  _id?: string
  /** El login devuelve id */
  id?: string | number
  email: string
  /** El backend no envía "name"; se arma con el perfil */
  name?: string
  role: Role
  status?: UserStatus
  profile?: UserProfile
  lastLogin?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
}

export interface LoginResult {
  user: User
  tokens: AuthTokens
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}
