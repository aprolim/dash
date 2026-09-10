// composables/useAvisos.ts
import { useApi } from './useApi'

export interface Aviso {
  _id: string
  titulo: string
  descripcion: string
  tipo: 'Urgente' | 'Importante' | 'Informativo' | 'Normal'
  fecha: string
  tags: string[]
  imagen: string | null
  pdf: {
    url: string | null
    name: string
    size: number
  }
  origen: 'manual' | 'comunicado'
  comunicadoId: string | null
  fechaLanzamiento: string | null
  activo: boolean
  creadoPor?: any
  actualizadoPor?: any
  createdAt: string
  updatedAt: string
}

export interface AvisoStats {
  total: number
  activos: number
  manuales: number
  comunicados: number
}

export const useAvisos = () => {
  const { get, post, put, del } = useApi()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiUrl || 'https://demoback.senado.gob.bo/api'

  // ============================================
  // 📡 PÚBLICO
  // ============================================

  const getAvisos = async (params?: {
    page?: number
    limit?: number
    tipo?: string
    search?: string
  }) => {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.tipo && params.tipo !== 'todos') query.append('tipo', params.tipo)
    if (params?.search) query.append('search', params.search)

    const response = await fetch(`${baseUrl}/avisos?${query.toString()}`)
    const result = await response.json()
    return result.data
  }

  // ============================================
  // 🔐 ADMIN
  // ============================================

  const getAvisosAdmin = async (params?: {
    page?: number
    limit?: number
    tipo?: string
    origen?: string
    search?: string
    incluirInactivos?: boolean
  }) => {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.tipo && params.tipo !== 'todos') query.append('tipo', params.tipo)
    if (params?.origen && params.origen !== 'todos') query.append('origen', params.origen)
    if (params?.search) query.append('search', params.search)
    if (params?.incluirInactivos) query.append('incluirInactivos', 'true')

    const url = `${baseUrl}/avisos/admin?${query.toString()}`
    return await get<any>(url)
  }

  const getAvisoById = async (id: string): Promise<Aviso> => {
    return await get<Aviso>(`${baseUrl}/avisos/${id}`)
  }

  const createAviso = async (data: Partial<Aviso>) => {
    return await post<Aviso>(`${baseUrl}/avisos`, data)
  }

  const updateAviso = async (id: string, data: Partial<Aviso>) => {
    return await put<Aviso>(`${baseUrl}/avisos/${id}`, data)
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${baseUrl}/avisos/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ activo })
    })
    const result = await response.json()
    if (!result.success) throw new Error(result.message)
    return result.data
  }

  const deleteAviso = async (id: string) => {
    return await del(`${baseUrl}/avisos/${id}`)
  }

  const getStats = async (): Promise<AvisoStats> => {
    return await get<AvisoStats>(`${baseUrl}/avisos/stats`)
  }

  const getTipos = async (): Promise<any[]> => {
    return await get<any[]>(`${baseUrl}/avisos/tipos`)
  }

  // Subir imagen (usando endpoint de comunicados, o podrías crear uno específico)
  const uploadImage = async (file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('imagen', file)

    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${baseUrl}/comunicados/upload/image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
    const result = await response.json()
    if (!result.success) throw new Error(result.message)
    return result.data
  }

  // Subir PDF
  const uploadPDF = async (file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('pdf', file)

    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${baseUrl}/comunicados/upload/pdf`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
    const result = await response.json()
    if (!result.success) throw new Error(result.message)
    return result.data
  }

  return {
    getAvisos,
    getAvisosAdmin,
    getAvisoById,
    createAviso,
    updateAviso,
    toggleActivo,
    deleteAviso,
    getStats,
    getTipos,
    uploadImage,
    uploadPDF
  }
}