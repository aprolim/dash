// composables/useAuditoria.ts
import { useApi } from '~/composables/useApi'

// ============================================
// TIPOS
// ============================================

export type ModuloAuditoria =
  | 'poa-uai'
  | 'auditorias-ejecutadas'
  | 'informes-actividades'
  | 'otras-actividades'

export type EstadoAuditoria = 'Publicado' | 'En Revisión' | 'Borrador'

export interface AuditoriaCategoria {
  _id?: string
  modulo: ModuloAuditoria
  key: string
  nombre: string
  icono: string
  orden: number
  activo: boolean
  documentosCount?: number
}

export interface AuditoriaDocumento {
  _id: string
  modulo: ModuloAuditoria
  categoria: string
  titulo: string
  descripcion: string
  gestion: number
  url: string | null
  estado: EstadoAuditoria
  activo: boolean
  orden: number
  migrado?: boolean
  urlOriginal?: string
  createdAt?: string
  updatedAt?: string
}

export interface AuditoriaPOA {
  _id: string
  anio: number
  titulo: string
  fecha: string
  estado: EstadoAuditoria
  activo: boolean
  pdfUrl: string | null
  createdAt?: string
  updatedAt?: string
}

// ============================================
// COMPOSABLE
// ============================================

export const useAuditoria = () => {
  const { get, post, put, del, patch } = useApi()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiUrl || 'https://demoback.senado.gob.bo/api'

  // ============================================
  // 📡 PÚBLICO
  // ============================================

  const getDocumentosPublicos = async (modulo: ModuloAuditoria) => {
    const url = `${baseUrl}/auditoria/${modulo}`
    const response = await fetch(url)
    const result = await response.json()
    if (!result.success) throw new Error(result.message)
    return result.data
  }

  // ============================================
  // 🔐 ADMIN - DOCUMENTOS
  // ============================================

  const getDocumentosAdmin = async (
    modulo: ModuloAuditoria,
    params?: {
      categoria?: string
      gestion?: number
      search?: string
      incluirInactivos?: boolean
    }
  ) => {
    const query = new URLSearchParams()
    if (params?.categoria) query.append('categoria', params.categoria)
    if (params?.gestion) query.append('gestion', params.gestion.toString())
    if (params?.search) query.append('search', params.search)
    if (params?.incluirInactivos) query.append('incluirInactivos', 'true')

    const url = `${baseUrl}/auditoria/${modulo}/admin?${query.toString()}`
    return await get<{ documentos: AuditoriaDocumento[]; total: number }>(url)
  }

  const getDocumentoById = async (
    modulo: ModuloAuditoria,
    id: string
  ): Promise<AuditoriaDocumento> => {
    return await get<AuditoriaDocumento>(`${baseUrl}/auditoria/${modulo}/${id}`)
  }

  const createDocumento = async (
    modulo: ModuloAuditoria,
    data: Partial<AuditoriaDocumento>
  ) => {
    return await post<AuditoriaDocumento>(`${baseUrl}/auditoria/${modulo}`, data)
  }

  const updateDocumento = async (
    modulo: ModuloAuditoria,
    id: string,
    data: Partial<AuditoriaDocumento>
  ) => {
    return await put<AuditoriaDocumento>(`${baseUrl}/auditoria/${modulo}/${id}`, data)
  }

  const deleteDocumento = async (modulo: ModuloAuditoria, id: string) => {
    return await del(`${baseUrl}/auditoria/${modulo}/${id}`)
  }

  // ============================================
  // 🔐 ADMIN - CATEGORÍAS
  // ============================================

  const getCategorias = async (
    modulo: ModuloAuditoria,
    incluirInactivos = false
  ): Promise<AuditoriaCategoria[]> => {
    const url = `${baseUrl}/auditoria/${modulo}/categorias?incluirInactivos=${incluirInactivos}`
    const result = await get<AuditoriaCategoria[]>(url)
    return result
  }

  const createCategoria = async (
    modulo: ModuloAuditoria,
    data: Partial<AuditoriaCategoria>
  ) => {
    return await post<AuditoriaCategoria>(`${baseUrl}/auditoria/${modulo}/categorias`, data)
  }

  const updateCategoria = async (
    modulo: ModuloAuditoria,
    key: string,
    data: Partial<AuditoriaCategoria>
  ) => {
    return await put<AuditoriaCategoria>(
      `${baseUrl}/auditoria/${modulo}/categorias/${key}`,
      data
    )
  }

  const deleteCategoria = async (modulo: ModuloAuditoria, key: string) => {
    return await del(`${baseUrl}/auditoria/${modulo}/categorias/${key}`)
  }

  // ============================================
  // 🔐 ADMIN - POA-UAI
  // ============================================

  const getPOAs = async (): Promise<AuditoriaPOA[]> => {
    const result = await get<{ documentos: AuditoriaPOA[] }>(
      `${baseUrl}/auditoria/poa-uai/admin`
    )
    return result.documentos || []
  }

  const getPOAById = async (id: string): Promise<AuditoriaPOA> => {
    return await get<AuditoriaPOA>(`${baseUrl}/auditoria/poa-uai/${id}`)
  }

  const createPOA = async (data: Partial<AuditoriaPOA>) => {
    return await post<AuditoriaPOA>(`${baseUrl}/auditoria/poa-uai`, data)
  }

  const updatePOA = async (id: string, data: Partial<AuditoriaPOA>) => {
    return await put<AuditoriaPOA>(`${baseUrl}/auditoria/poa-uai/${id}`, data)
  }

  const deletePOA = async (id: string) => {
    return await del(`${baseUrl}/auditoria/poa-uai/${id}`)
  }

  const togglePOAActivo = async (id: string, activo: boolean) => {
    return await patch<AuditoriaPOA>(`${baseUrl}/auditoria/poa-uai/${id}/toggle`, { activo })
  }

  // ============================================
  // 📤 UPLOADS
  // ============================================

  const uploadPDF = async (
    file: File,
    modulo: ModuloAuditoria
  ): Promise<{
    url: string
    filename: string
    originalName: string
    size: number
  }> => {
    const formData = new FormData()
    formData.append('pdf', file)

    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${baseUrl}/auditoria/${modulo}/upload-pdf`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    const result = await response.json()
    if (!result.success) throw new Error(result.message)
    return result.data
  }

  // ============================================
  // 📊 ESTADÍSTICAS
  // ============================================

  const getStats = async (modulo: ModuloAuditoria) => {
    return await get<any>(`${baseUrl}/auditoria/${modulo}/stats`)
  }

  // ============================================
  // 🚚 MIGRACIÓN
  // ============================================

  const migrarPDFs = async () => {
    return await post<any>(`${baseUrl}/auditoria/migrar-pdfs`, {})
  }

  return {
    // Público
    getDocumentosPublicos,
    // Admin - Documentos
    getDocumentosAdmin,
    getDocumentoById,
    createDocumento,
    updateDocumento,
    deleteDocumento,
    // Admin - Categorías
    getCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    // Admin - POA-UAI
    getPOAs,
    getPOAById,
    createPOA,
    updatePOA,
    deletePOA,
    togglePOAActivo,
    // Uploads
    uploadPDF,
    // Stats
    getStats,
    // Migración
    migrarPDFs,
  }
}