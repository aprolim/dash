// composables/useLegislativosCatalogos.ts
import { useApi } from './useApi'

export interface CatalogoItem {
  _id: string
  id: string
  nombre: string
  name: string
  value: string
  label: string
  activo: boolean
  orden: number
}

export interface CreateCatalogoPayload {
  nombre: string
  activo?: boolean
  orden?: number
}

export interface UpdateCatalogoPayload {
  nombre?: string
  activo?: boolean
  orden?: number
}

export const useLegislativosCatalogos = () => {
  const { get, post, put, del } = useApi()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiUrl || 'https://demoback.senado.gob.bo/api'

  // ============================================
  // 📡 LECTURA (público autenticado)
  // ============================================

  const getSenadores = async (params?: {
    q?: string
    incluirInactivos?: boolean
  }): Promise<CatalogoItem[]> => {
    const query = new URLSearchParams()
    if (params?.q) query.append('q', params.q)
    if (params?.incluirInactivos) query.append('incluirInactivos', 'true')

    const qs = query.toString()
    const url = `${baseUrl}/legislativos/catalogos/senadores${qs ? `?${qs}` : ''}`
    const result = await get<{ data: CatalogoItem[]; total: number }>(url)
    return result.data || []
  }

  const getComisiones = async (params?: {
    q?: string
    incluirInactivos?: boolean
  }): Promise<CatalogoItem[]> => {
    const query = new URLSearchParams()
    if (params?.q) query.append('q', params.q)
    if (params?.incluirInactivos) query.append('incluirInactivos', 'true')

    const qs = query.toString()
    const url = `${baseUrl}/legislativos/catalogos/comisiones${qs ? `?${qs}` : ''}`
    const result = await get<{ data: CatalogoItem[]; total: number }>(url)
    return result.data || []
  }

  // ============================================
  // 🔐 CRUD - SENADORES
  // ============================================

  const createSenador = async (payload: CreateCatalogoPayload): Promise<CatalogoItem> => {
    return await post<CatalogoItem>(
      `${baseUrl}/legislativos/catalogos/senadores`,
      payload
    )
  }

  const updateSenador = async (
    id: string,
    payload: UpdateCatalogoPayload
  ): Promise<CatalogoItem> => {
    return await put<CatalogoItem>(
      `${baseUrl}/legislativos/catalogos/senadores/${id}`,
      payload
    )
  }

  const deleteSenador = async (id: string): Promise<void> => {
    await del(`${baseUrl}/legislativos/catalogos/senadores/${id}`)
  }

  // ============================================
  // 🔐 CRUD - COMISIONES
  // ============================================

  const createComision = async (payload: CreateCatalogoPayload): Promise<CatalogoItem> => {
    return await post<CatalogoItem>(
      `${baseUrl}/legislativos/catalogos/comisiones`,
      payload
    )
  }

  const updateComision = async (
    id: string,
    payload: UpdateCatalogoPayload
  ): Promise<CatalogoItem> => {
    return await put<CatalogoItem>(
      `${baseUrl}/legislativos/catalogos/comisiones/${id}`,
      payload
    )
  }

  const deleteComision = async (id: string): Promise<void> => {
    await del(`${baseUrl}/legislativos/catalogos/comisiones/${id}`)
  }

  // ============================================
  // 🌱 SEED (solo SUPER_ADMIN / ADMIN)
  // ============================================

  const seedCatalogos = async (sobrescribir = false): Promise<{
    senadores: number
    comisiones: number
  }> => {
    return await post<{ senadores: number; comisiones: number }>(
      `${baseUrl}/legislativos/catalogos/seed`,
      { sobrescribir }
    )
  }

  return {
    // Lectura
    getSenadores,
    getComisiones,
    // CRUD Senadores
    createSenador,
    updateSenador,
    deleteSenador,
    // CRUD Comisiones
    createComision,
    updateComision,
    deleteComision,
    // Seed
    seedCatalogos
  }
}