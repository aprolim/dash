// composables/useTiposDestinatario.ts
import { useApi } from './useApi'

export interface TipoDestinatarioItem {
  _id: string
  id: string
  nombre: string
  name: string
  value: string
  label: string
  activo: boolean
  orden: number
}

export interface CreateTipoDestinatarioPayload {
  nombre: string
  activo?: boolean
  orden?: number
}

export interface UpdateTipoDestinatarioPayload {
  nombre?: string
  activo?: boolean
  orden?: number
}

export const useTiposDestinatario = () => {
  const { get, post, put, del } = useApi()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiUrl || 'https://demoback.senado.gob.bo/api'

  // ============================================
  // 📡 LECTURA (pública)
  // ============================================
  const getTiposDestinatario = async (params?: {
    q?: string
    incluirInactivos?: boolean
  }): Promise<TipoDestinatarioItem[]> => {
    const query = new URLSearchParams()
    if (params?.q) query.append('q', params.q)
    if (params?.incluirInactivos) query.append('incluirInactivos', 'true')

    const qs = query.toString()
    const url = `${baseUrl}/tipos-destinatario${qs ? `?${qs}` : ''}`

    const result = await get<any>(url)
    if (result && Array.isArray(result.data)) return result.data
    if (Array.isArray(result)) return result
    return []
  }

  // ============================================
  // 🔐 CRUD (admin)
  // ============================================
  const createTipoDestinatario = async (
    payload: CreateTipoDestinatarioPayload
  ): Promise<TipoDestinatarioItem> => {
    return await post<TipoDestinatarioItem>(
      `${baseUrl}/tipos-destinatario`,
      payload
    )
  }

  const updateTipoDestinatario = async (
    id: string,
    payload: UpdateTipoDestinatarioPayload
  ): Promise<TipoDestinatarioItem> => {
    return await put<TipoDestinatarioItem>(
      `${baseUrl}/tipos-destinatario/${id}`,
      payload
    )
  }

  const deleteTipoDestinatario = async (id: string): Promise<void> => {
    await del(`${baseUrl}/tipos-destinatario/${id}`)
  }

  // ============================================
  // 🌱 SEED
  // ============================================
  const seedTiposDestinatario = async (sobrescribir = false) => {
    return await post<{ tiposDestinatario: number }>(
      `${baseUrl}/tipos-destinatario/seed`,
      { sobrescribir }
    )
  }

  return {
    getTiposDestinatario,
    createTipoDestinatario,
    updateTipoDestinatario,
    deleteTipoDestinatario,
    seedTiposDestinatario,
  }
}