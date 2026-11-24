// composables/useComisionesComites.ts
import { useApi } from './useApi'

// ============================================
// TIPOS
// ============================================
export interface ComiteAdmin {
  _id: string | null
  nombre: string
  secretarioId: number
}

export interface ComisionAdmin {
  _id: string
  id: string
  nombre: string
  presidenteId: number
  comites: ComiteAdmin[]
  createdAt?: string
  updatedAt?: string
}

export interface SaveComisionPayload {
  nombre: string
  presidenteId: number
  comites: { nombre: string; secretarioId: number }[]
}

// ============================================
// COMPOSABLE
// ============================================
export const useComisionesComites = () => {
  const { get, post, put, del } = useApi()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiUrl || 'https://demoback.senado.gob.bo/api'

  // ============================================
  // 📡 LISTADO (CMS) — con IDs crudos
  // ============================================
  const getComisiones = async (): Promise<ComisionAdmin[]> => {
    const result = await get<any>(`${baseUrl}/legisladores/comisiones/admin`)

    // useApi ya devuelve data.data (el array)
    if (Array.isArray(result)) return result
    if (result && Array.isArray(result.data)) return result.data
    return []
  }

  // ============================================
  // 📡 UNA COMISIÓN
  // ============================================
  const getComisionById = async (id: string): Promise<ComisionAdmin> => {
    return await get<ComisionAdmin>(`${baseUrl}/legisladores/comisiones/${id}`)
  }

  // ============================================
  // 🔐 CRUD
  // ============================================
  const createComision = async (payload: SaveComisionPayload): Promise<ComisionAdmin> => {
    return await post<ComisionAdmin>(`${baseUrl}/legisladores/comisiones`, payload)
  }

  const updateComision = async (
    id: string,
    payload: SaveComisionPayload
  ): Promise<ComisionAdmin> => {
    return await put<ComisionAdmin>(`${baseUrl}/legisladores/comisiones/${id}`, payload)
  }

  const deleteComision = async (id: string): Promise<void> => {
    await del(`${baseUrl}/legisladores/comisiones/${id}`)
  }

  return {
    getComisiones,
    getComisionById,
    createComision,
    updateComision,
    deleteComision
  }
}
