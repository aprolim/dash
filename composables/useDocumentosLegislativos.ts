// composables/useDocumentosLegislativos.ts
import { useApi } from './useApi'
import type { TipoDocumento } from '~/utils/documentoTypes'

export interface ArchivoAnexo {
  url: string
  filename: string
  originalName: string
  size: number
}

export interface DocumentoLegislativo {
  _id: string
  tipo: TipoDocumento
  numero: number
  codigo: string
  fechaIngreso: string

  // 🔥 AHORA SON ARRAYS
  peticionario?: string[]
  comisionI?: string[]
  comisionII?: string[]

  // Compat: por si viene el nombre viejo
  proyectista?: string | string[]

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

  archivoAnexo?: ArchivoAnexo[]
  numeroLey?: number | null
  fechaRechazo?: string | null
  esNuevoOReReposicion?: string
  plAnterior?: string
  fechaRemisionComisionI?: string | null
  fechaRemisionComisionII?: string | null
  estadoLey?: string
  fechaRemisionDiputados?: string | null
  fechaSancion?: string | null
  fechaRemisionEjecutivo?: string | null

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

/**
 * Normaliza un campo que debe ser array de strings.
 * Acepta string, array, null, undefined.
 */
function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    const v = value.trim()
    return v ? [v] : []
  }
  return []
}

/**
 * Normaliza un documento que viene del backend para asegurar
 * que peticionario / comisionI / comisionII sean arrays de strings.
 */
function normalizarDocumento(doc: any): DocumentoLegislativo {
  if (!doc) return doc

  // peticionario puede venir como peticionario o proyectista
  const peticionario = toArray(doc.peticionario ?? doc.proyectista)

  return {
    ...doc,
    peticionario,
    comisionI: toArray(doc.comisionI),
    comisionII: toArray(doc.comisionII),
    archivoAnexo: Array.isArray(doc.archivoAnexo) ? doc.archivoAnexo : []
  }
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

    // Normalizar arrays
    return {
      ...result,
      documentos: (result.documentos || []).map(normalizarDocumento)
    }
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
    const result = await get<PaginatedResult>(url)

    return {
      ...result,
      documentos: (result.documentos || []).map(normalizarDocumento)
    }
  }

  const getDocumentoById = async (
    tipo: TipoDocumento,
    id: string
  ): Promise<DocumentoLegislativo> => {
    const result = await get<DocumentoLegislativo>(
      `${baseUrl}/legislativos/${tipo}/${id}`
    )
    return normalizarDocumento(result)
  }

  const createDocumento = async (
    tipo: TipoDocumento,
    data: Partial<DocumentoLegislativo>
  ): Promise<DocumentoLegislativo> => {
    const result = await post<DocumentoLegislativo>(
      `${baseUrl}/legislativos/${tipo}`,
      data
    )
    return normalizarDocumento(result)
  }

  const updateDocumento = async (
    tipo: TipoDocumento,
    id: string,
    data: Partial<DocumentoLegislativo>
  ): Promise<DocumentoLegislativo> => {
    const result = await put<DocumentoLegislativo>(
      `${baseUrl}/legislativos/${tipo}/${id}`,
      data
    )
    return normalizarDocumento(result)
  }

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

  const restoreDocumento = async (
    tipo: TipoDocumento,
    id: string
  ): Promise<DocumentoLegislativo> => {
    const result = await patch<DocumentoLegislativo>(
      `${baseUrl}/legislativos/${tipo}/${id}/restore`,
      {}
    )
    return normalizarDocumento(result)
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
  // 📊 STATS / CONFIG
  // ============================================
  const getStats = async (tipo: TipoDocumento): Promise<StatsResult> => {
    return await get<StatsResult>(`${baseUrl}/legislativos/${tipo}/stats`)
  }

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