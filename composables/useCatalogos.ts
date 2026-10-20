// composables/useCatalogos.ts
import { useApi } from './useApi'

export interface SenadorCatalogo {
  id: number
  name: string
  tipo: 'titular' | 'suplente'
  party: string
  partyShort: string
  department: string
  foto: string
  cargo: string
  value: string   // = name (lo que se guarda en peticionario/comisionI/comisionII)
  label: string
}

export interface ComisionCatalogo {
  value: string
  label: string
}

export const useCatalogos = () => {
  const { get } = useApi()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiUrl || 'https://demoback.senado.gob.bo/api'

  /**
   * Lista de senadores (titulares + suplentes).
   * @param q término de búsqueda opcional (nombre, partido, departamento)
   */
  const getSenadores = async (q?: string): Promise<SenadorCatalogo[]> => {
    const qs = q && q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''
    const result = await get<{ data: SenadorCatalogo[]; total: number }>(
      `${baseUrl}/catalogos/senadores${qs}`
    )
    return result.data || []
  }

  /**
   * Lista de comisiones camarales.
   */
  const getComisiones = async (): Promise<ComisionCatalogo[]> => {
    const result = await get<{ data: ComisionCatalogo[]; total: number }>(
      `${baseUrl}/catalogos/comisiones`
    )
    return result.data || []
  }

  return {
    getSenadores,
    getComisiones
  }
}