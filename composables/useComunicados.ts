// composables/useComunicados.ts
import { useApi } from './useApi'

export interface Comunicado {
  _id: string
  titulo: string
  contenido: string
  imagen: {
    url: string
    alt: string
    name: string
  }
  pdf: {
    url: string | null
    name: string
    size: number
  }
  estado: 'programado' | 'activo' | 'inactivo'
  fechaActivacion: string | null
  fechaDesactivacion: string | null
  activadoEn: string | null
  desactivadoEn: string | null
  fechaLanzamiento: string
  prioridad: number
  creadoPor?: any
  actualizadoPor?: any
  createdAt: string
  updatedAt: string
}

export interface ComunicadoStats {
  total: number
  activos: number
  inactivos: number
  programados: number
  expirados: number
}

export const useComunicados = () => {
  const { get, post, put, del } = useApi()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiUrl || 'https://demoback.senado.gob.bo/api'

  // ============================================
  // 📡 PÚBLICO
  // ============================================

  const getComunicadoActivo = async (): Promise<Comunicado | null> => {
    try {
      const response = await fetch(`${baseUrl}/comunicados/activo`)
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Error obteniendo comunicado activo:', error)
      return null
    }
  }

  const getComunicadosExpirados = async (): Promise<Comunicado[]> => {
    try {
      const response = await fetch(`${baseUrl}/comunicados/expirados`)
      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error('Error obteniendo comunicados expirados:', error)
      return []
    }
  }

  // ============================================
  // 🔐 ADMIN
  // ============================================

  const getComunicados = async (params?: {
    page?: number
    limit?: number
    estado?: string
    search?: string
  }) => {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.estado && params.estado !== 'todos') query.append('estado', params.estado)
    if (params?.search) query.append('search', params.search)

    const url = `${baseUrl}/comunicados?${query.toString()}`
    return await get<any>(url)
  }

  const getComunicadoById = async (id: string): Promise<Comunicado> => {
    return await get<Comunicado>(`${baseUrl}/comunicados/${id}`)
  }

  const createComunicado = async (data: Partial<Comunicado>) => {
    return await post<Comunicado>(`${baseUrl}/comunicados`, data)
  }

  const updateComunicado = async (id: string, data: Partial<Comunicado>) => {
    return await put<Comunicado>(`${baseUrl}/comunicados/${id}`, data)
  }

  /**
   * 🔥 Cambiar estado con manejo de errores mejorado
   * El backend valida según las reglas (ej: no puedes activar un programado sin fechas)
   */
  const changeEstado = async (id: string, estado: string) => {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${baseUrl}/comunicados/${id}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ estado })
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      // Lanzar el mensaje real del backend
      throw new Error(result.message || 'Error al cambiar estado')
    }

    return result.data
  }

  const deleteComunicado = async (id: string) => {
    return await del(`${baseUrl}/comunicados/${id}`)
  }

  const getStats = async (): Promise<ComunicadoStats> => {
    return await get<ComunicadoStats>(`${baseUrl}/comunicados/stats`)
  }

  const forceUpdate = async () => {
    return await post(`${baseUrl}/comunicados/force-update`, {})
  }

  const uploadImage = async (file: File, name?: string): Promise<any> => {
    const formData = new FormData()
    formData.append('imagen', file)
    if (name) formData.append('name', name)

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
    // Público
    getComunicadoActivo,
    getComunicadosExpirados,
    // Admin
    getComunicados,
    getComunicadoById,
    createComunicado,
    updateComunicado,
    changeEstado,
    deleteComunicado,
    getStats,
    forceUpdate,
    uploadImage,
    uploadPDF
  }
}