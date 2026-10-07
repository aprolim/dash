// composables/useUsers.ts
// Cliente del endpoint /api/users del backend.
// El backend ya valida permisos: crear/listar/editar → SUPER_ADMIN y ADMIN
// (listar también EDITOR), eliminar → solo SUPER_ADMIN.
import { useApi } from './useApi'
import type { Role, User, UserProfile, UserStatus } from '~/types/auth'

export interface UserListResult {
  users: User[]
  total: number
  pages: number
  page: number
  limit: number
}

export interface UserListParams {
  page?: number
  limit?: number
  role?: Role | 'todos'
  status?: UserStatus | 'todos'
  search?: string
}

export interface CreateUserPayload {
  email: string
  password: string
  role: Role
  status: UserStatus
  profile?: UserProfile
}

export interface UpdateUserPayload {
  role?: Role
  status?: UserStatus
  profile?: UserProfile
}

/** El login devuelve `id` y Mongo devuelve `_id`: unificamos. */
export function userIdOf(user: User | null | undefined): string {
  if (!user) return ''
  return String(user._id || user.id || '')
}

export const useUsers = () => {
  const { get, post, put, del } = useApi()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiUrl || 'https://demoback.senado.gob.bo/api'

  const getUsers = async (params?: UserListParams): Promise<UserListResult> => {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))
    if (params?.role && params.role !== 'todos') query.append('role', params.role)
    if (params?.status && params.status !== 'todos') query.append('status', params.status)
    if (params?.search) query.append('search', params.search)

    const url = `${baseUrl}/users?${query.toString()}`
    return await get<UserListResult>(url)
  }

  const getUserById = async (id: string): Promise<User> => {
    return await get<User>(`${baseUrl}/users/${id}`)
  }

  const createUser = async (payload: CreateUserPayload): Promise<User> => {
    return await post<User>(`${baseUrl}/users`, payload)
  }

  const updateUser = async (id: string, payload: UpdateUserPayload): Promise<User> => {
    return await put<User>(`${baseUrl}/users/${id}`, payload)
  }

  const deleteUser = async (id: string) => {
    return await del<{ message?: string }>(`${baseUrl}/users/${id}`)
  }

  return {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
  }
}
