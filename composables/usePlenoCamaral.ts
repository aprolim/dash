// composables/usePlenoCamaral.ts
import { useApi } from './useApi'

// ============================================
// TIPOS
// ============================================
export interface SenadorPleno {
  _id: string
  id: number
  seatNumber: number
  name: string
  slug: string
  tipo: 'titular' | 'suplente'
  titular?: string

  party: string
  partyShort: string
  partyColor: string
  department: string

  foto: string
  comision?: string
  comite?: string
  cargo?: string

  fechaNacimiento?: string
  nacidoEn?: string
  ocupacion?: string
  distritos?: string[]

  facebook?: string
  twitter?: string
  instagram?: string
  youtube?: string
  tiktok?: string

  // 📜 Proyectos de ley destacados
  proyectosLey?: {
    cantidad: number
    lista: string[]
  }
  proyectosLeySuplente?: {
    cantidad: number
    lista: string[]
  }

  // Datos del suplente (en registros de tipo titular)
  suplente?: string
  slugSuplente?: string
  fotoSuplente?: string
  comiteSuplente?: string
  cargoSuplente?: string

  estado: 'activo' | 'inactivo' | 'suspendido' | 'licencia'
}

export interface ResumenPleno {
  titulares: number
  suplentes: number
  total: number
  sinFotoTitular: number
  sinFotoSuplente: number
}

export interface ListParams {
  tipo?: 'titular' | 'suplente'
  q?: string
  sinFoto?: boolean
  estado?: string
}

// ============================================
// COMPOSABLE
// ============================================
export const usePlenoCamaral = () => {
  const { get, put } = useApi()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiUrl || 'https://demoback.senado.gob.bo/api'

  const token = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  // ============================================
  // 📡 LISTADOS
  // ============================================
  const getSenadores = async (params?: ListParams): Promise<SenadorPleno[]> => {
    const query = new URLSearchParams()
    if (params?.tipo) query.append('tipo', params.tipo)
    if (params?.q) query.append('q', params.q)
    if (params?.sinFoto) query.append('sinFoto', 'true')
    if (params?.estado) query.append('estado', params.estado)

    const qs = query.toString()
    const result = await get<any>(
      `${baseUrl}/pleno-camaral${qs ? `?${qs}` : ''}`
    )

    if (Array.isArray(result)) return result
    if (result && Array.isArray(result.data)) return result.data
    return []
  }

  const getResumen = async (): Promise<ResumenPleno> => {
    return await get<ResumenPleno>(`${baseUrl}/pleno-camaral/resumen`)
  }

  const getSenadorById = async (id: number): Promise<SenadorPleno> => {
    return await get<SenadorPleno>(`${baseUrl}/pleno-camaral/${id}`)
  }

  // ============================================
  // 🔐 ACTUALIZACIÓN
  // ============================================
  const updateSenador = async (
    id: number,
    payload: Partial<SenadorPleno>
  ): Promise<SenadorPleno> => {
    return await put<SenadorPleno>(`${baseUrl}/pleno-camaral/${id}`, payload)
  }

  // ============================================
  // 📤 FOTO
  // ============================================
  /**
   * Sube una foto para un senador.
   * @param id        id numérico del senador
   * @param file      archivo de imagen
   * @param destino   'titular' (campo `foto`) o 'suplente' (campo `fotoSuplente`)
   */
  const uploadFoto = async (
    id: number,
    file: File,
    destino: 'titular' | 'suplente' = 'titular'
  ): Promise<{ foto: string; url: string }> => {
    const formData = new FormData()
    formData.append('foto', file)
    formData.append('destino', destino)

    const res = await fetch(`${baseUrl}/pleno-camaral/${id}/foto`, {
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
      throw new Error(result.message || `Error ${res.status} al subir la foto`)
    }
    return result.data
  }

  const eliminarFoto = async (
    id: number,
    destino: 'titular' | 'suplente' = 'titular'
  ): Promise<SenadorPleno> => {
    const res = await fetch(
      `${baseUrl}/pleno-camaral/${id}/foto?destino=${destino}`,
      {
        method: 'DELETE',
        headers: token() ? { Authorization: `Bearer ${token()}` } : {}
      }
    )

    const result = await res.json().catch(() => ({}))
    if (!res.ok || !result.success) {
      throw new Error(result.message || 'Error al quitar la foto')
    }
    return result.data
  }

  return {
    getSenadores,
    getResumen,
    getSenadorById,
    updateSenador,
    uploadFoto,
    eliminarFoto
  }
}
