// composables/useMarcoNormativo.ts
import { useApi } from './useApi'

// ============================================
// TIPOS
// ============================================
export interface MarcoNormativoArchivo {
  url: string | null
  filename: string
  originalName: string
  size: number
}

export interface MarcoNormativoItem {
  _id: string
  id: string
  nombre: string
  codigo: string
  descripcion: string
  gestion: number | null
  fechaDocumento: string | null
  categoria: string | null
  destacado: boolean
  orden: number
  imagen: string | null
  archivo: MarcoNormativoArchivo | null
  activo?: boolean
  eliminado?: boolean
  fechaEliminacion?: string | null
  motivoEliminacion?: string
  createdAt?: string
  updatedAt?: string
}

export interface PaginatedResult {
  documentos: MarcoNormativoItem[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface UploadResult {
  url: string
  filename: string
  originalName: string
  size: number
  sizeMB?: string
  mimetype?: string
}

export interface ListParams {
  page?: number
  limit?: number
  q?: string
  categoria?: string
  destacado?: boolean
  incluirInactivos?: boolean
  incluirEliminados?: boolean
}

// ============================================
// COMPOSABLE
// ============================================
export const useMarcoNormativo = () => {
  const { get, post, put, patch, del } = useApi()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiUrl || 'https://demoback.senado.gob.bo/api'

  const token = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  // ============================================
  // 📡 LISTADO ADMIN
  // ============================================
  const getDocumentos = async (params?: ListParams): Promise<PaginatedResult> => {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))
    if (params?.q) query.append('q', params.q)
    if (params?.categoria) query.append('categoria', params.categoria)
    if (params?.destacado !== undefined) query.append('destacado', String(params.destacado))
    if (params?.incluirInactivos) query.append('incluirInactivos', 'true')
    if (params?.incluirEliminados) query.append('incluirEliminados', 'true')

    const qs = query.toString()
    const url = `${baseUrl}/marco-normativo/admin${qs ? `?${qs}` : ''}`

    // useApi.handleResponse devuelve data.data (el array); total/page vienen al lado.
    // Por eso hacemos el fetch completo aquí para conservar la paginación.
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token() ? { Authorization: `Bearer ${token()}` } : {})
      },
      cache: 'no-store'
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message || `Error ${res.status}`)
    }

    const json = await res.json()
    return {
      documentos: Array.isArray(json.data) ? json.data : [],
      total: json.total || 0,
      page: json.page || 1,
      limit: json.limit || 20,
      pages: json.pages || 1
    }
  }

  // ============================================
  // 📡 CATÁLOGO DE CATEGORÍAS
  // ============================================
  const getCategorias = async (): Promise<string[]> => {
    const result = await get<any>(`${baseUrl}/marco-normativo/categorias`)
    if (Array.isArray(result)) return result
    if (result && Array.isArray(result.data)) return result.data
    return []
  }

  // ============================================
  // 📡 OBTENER UNO
  // ============================================
  const getDocumentoById = async (id: string): Promise<MarcoNormativoItem> => {
    return await get<MarcoNormativoItem>(`${baseUrl}/marco-normativo/${id}`)
  }

  // ============================================
  // 🔐 CRUD
  // ============================================
  const createDocumento = async (
    payload: Partial<MarcoNormativoItem>
  ): Promise<MarcoNormativoItem> => {
    return await post<MarcoNormativoItem>(`${baseUrl}/marco-normativo`, payload)
  }

  const updateDocumento = async (
    id: string,
    payload: Partial<MarcoNormativoItem>
  ): Promise<MarcoNormativoItem> => {
    return await put<MarcoNormativoItem>(`${baseUrl}/marco-normativo/${id}`, payload)
  }

  const deleteDocumento = async (
    id: string,
    motivo: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${baseUrl}/marco-normativo/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token() ? { Authorization: `Bearer ${token()}` } : {})
      },
      body: JSON.stringify({ motivo })
    })

    const result = await res.json().catch(() => ({}))
    if (!res.ok || !result.success) {
      throw new Error(result.message || 'Error al eliminar el documento')
    }
    return result
  }

  const restoreDocumento = async (id: string): Promise<MarcoNormativoItem> => {
    return await patch<MarcoNormativoItem>(
      `${baseUrl}/marco-normativo/${id}/restore`,
      {}
    )
  }

  // ============================================
  // 📤 UPLOADS
  // ============================================
  const uploadPDF = async (file: File): Promise<UploadResult> => {
    const formData = new FormData()
    formData.append('pdf', file)

    const res = await fetch(`${baseUrl}/marco-normativo/upload-pdf`, {
      method: 'POST',
      headers: token() ? { Authorization: `Bearer ${token()}` } : {},
      body: formData
    })

    const text = await res.text()
    let result: any
    try {
      result = JSON.parse(text)
    } catch {
      throw new Error(
        `El servidor devolvió una respuesta no válida (HTTP ${res.status}). Revisa el backend.`
      )
    }

    if (!res.ok || !result.success) {
      throw new Error(result.message || `Error ${res.status} al subir el PDF`)
    }
    return result.data
  }

  const uploadImagen = async (file: File): Promise<UploadResult> => {
    const formData = new FormData()
    formData.append('imagen', file)

    const res = await fetch(`${baseUrl}/marco-normativo/upload-imagen`, {
      method: 'POST',
      headers: token() ? { Authorization: `Bearer ${token()}` } : {},
      body: formData
    })

    const text = await res.text()
    let result: any
    try {
      result = JSON.parse(text)
    } catch {
      throw new Error(
        `El servidor devolvió una respuesta no válida (HTTP ${res.status}). Revisa el backend.`
      )
    }

    if (!res.ok || !result.success) {
      throw new Error(result.message || `Error ${res.status} al subir la imagen`)
    }
    return result.data
  }

  return {
    getDocumentos,
    getCategorias,
    getDocumentoById,
    createDocumento,
    updateDocumento,
    deleteDocumento,
    restoreDocumento,
    uploadPDF,
    uploadImagen
  }
}
