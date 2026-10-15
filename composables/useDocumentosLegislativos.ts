// composables/useDocumentosLegislativos.ts
import { useApi } from './useApi'
import type { TipoDocumento } from '~/utils/documentoTypes'

export interface DocumentoLegislativo {
  _id: string
  tipo: TipoDocumento
  numero: number
  codigo: string
  fechaIngreso: string
  peticionario?: string
  proyectista?: string
  asunto: string
  destinatario?: string
  tipoDestinatario?: string
  fechaRemisionDestinatario?: string | null
  fechaRespuesta?: string | null
  fechaRemisionPeticionario?: string | null
  conminatoria?: string
  fechaRealizacion?: string | null
  fechaReprogramacion?: string | null
  fechaRealizacionFinal?: string | null
  fechaAprobacion?: string | null
  sesion?: string | null
  observacion?: string
  archivo: {
    url: string | null
    filename: string
    originalName: string
    size: number
  }
  activo: boolean
  eliminado: boolean
  eliminadoPor?: any
  fechaEliminacion?: string | null
  motivoEliminacion?: string
  creadoPor?: any
  actualizadoPor?: any
  createdAt: string
  updatedAt: string
}

export interface PaginatedResult {
  documentos: DocumentoLegislativo[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface StatsResult {
  total: number
  activos: number
  eliminados: number
}

export interface ConfigTipo {
  tipo: TipoDocumento
  label: string
  bloque: string
  prefijoCodigo: string
  campos: string[]
  camposObligatorios: string[]
  camposBloqueadosEnEdicion: string[]
  tiposDestinatario: string[]
}

export interface UploadResult {
  url: string
  filename: string
  originalName: string
  size: number
  sizeMB: string
}

export const useDocumentosLegislativos = () => {
  const { get, post, put, patch } = useApi()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiUrl || 'https://demoback.senado.gob.bo/api'

  // ============================================
  // 📡 PÚBLICO
  // ============================================
  const getDocumentosPublicos = async (
    tipo: TipoDocumento,
    params?: { page?: number; limit?: number; search?: string; gestion?: number }
  ): Promise<PaginatedResult> => {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))
    if (params?.search) query.append('search', params.search)
    if (params?.gestion) query.append('gestion', String(params.gestion))

    const qs = query.toString()
    const url = `${baseUrl}/legislativos/${tipo}${qs ? `?${qs}` : ''}`
    const result = await get<PaginatedResult>(url)
    return result
  }

  // ============================================
  // 🔐 ADMIN
  // ============================================
  const getDocumentosAdmin = async (
    tipo: TipoDocumento,
    params?: {
      page?: number
      limit?: number
      search?: string
      gestion?: number
      incluirInactivos?: boolean
      incluirEliminados?: boolean
    }
  ): Promise<PaginatedResult> => {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))
    if (params?.search) query.append('search', params.search)
    if (params?.gestion) query.append('gestion', String(params.gestion))
    if (params?.incluirInactivos) query.append('incluirInactivos', 'true')
    if (params?.incluirEliminados) query.append('incluirEliminados', 'true')

    const qs = query.toString()
    const url = `${baseUrl}/legislativos/${tipo}/admin${qs ? `?${qs}` : ''}`
    return await get<PaginatedResult>(url)
  }

  const getDocumentoById = async (
    tipo: TipoDocumento,
    id: string
  ): Promise<DocumentoLegislativo> => {
    return await get<DocumentoLegislativo>(`${baseUrl}/legislativos/${tipo}/${id}`)
  }

  const createDocumento = async (
    tipo: TipoDocumento,
    data: Partial<DocumentoLegislativo>
  ): Promise<DocumentoLegislativo> => {
    return await post<DocumentoLegislativo>(`${baseUrl}/legislativos/${tipo}`, data)
  }

  const updateDocumento = async (
    tipo: TipoDocumento,
    id: string,
    data: Partial<DocumentoLegislativo>
  ): Promise<DocumentoLegislativo> => {
    return await put<DocumentoLegislativo>(`${baseUrl}/legislativos/${tipo}/${id}`, data)
  }

  /**
   * 🔥 SOFT DELETE con motivo obligatorio.
   * El backend marca el documento como eliminado y guarda quién/cuándo/por qué.
   */
  const deleteDocumento = async (
    tipo: TipoDocumento,
    id: string,
    motivo: string
  ): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${baseUrl}/legislativos/${tipo}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ motivo })
    })
    const result = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Error al eliminar el documento')
    }
    return result
  }

  /**
   * Restaurar (solo SUPER_ADMIN)
   */
  const restoreDocumento = async (
    tipo: TipoDocumento,
    id: string
  ): Promise<DocumentoLegislativo> => {
    return await patch<DocumentoLegislativo>(
      `${baseUrl}/legislativos/${tipo}/${id}/restore`,
      {}
    )
  }

  // ============================================
  // 📤 UPLOAD PDF
  // ============================================
  const uploadPDF = async (
    tipo: TipoDocumento,
    file: File
  ): Promise<UploadResult> => {
    const formData = new FormData()
    formData.append('pdf', file)

    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${baseUrl}/legislativos/${tipo}/upload-pdf`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })
    const result = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Error al subir el PDF')
    }
    return result.data
  }

  // ============================================
  // 📊 STATS
  // ============================================
  const getStats = async (tipo: TipoDocumento): Promise<StatsResult> => {
    return await get<StatsResult>(`${baseUrl}/legislativos/${tipo}/stats`)
  }

  // ============================================
  // 📋 CONFIG
  // ============================================
  const getConfigDelTipo = async (tipo: TipoDocumento): Promise<ConfigTipo> => {
    return await get<ConfigTipo>(`${baseUrl}/legislativos/${tipo}/config`)
  }

  return {
    getDocumentosPublicos,
    getDocumentosAdmin,
    getDocumentoById,
    createDocumento,
    updateDocumento,
    deleteDocumento,
    restoreDocumento,
    uploadPDF,
    getStats,
    getConfigDelTipo
  }
}