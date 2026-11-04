// composables/useDirectiva.ts
import { useApi } from './useApi'

export interface DirectivaAdmin {
  _id: string | null
  gestion: string
  presidenteId: number
  primeraViceId: number
  segundaViceId: number
  primeraSecretariaId: number
  segundaSecretariaId: number
  terceraSecretariaId: number
  activa: boolean
  esHardcoded: boolean
  creadoPor?: any
  actualizadoPor?: any
}

export interface SenadorTitular {
  id: number
  name: string
  foto: string
  party: string
  partyShort: string
  partyColor: string
  department: string
  cargo: string
  seatNumber: number
}

export interface SaveDirectivaPayload {
  gestion?: string
  presidenteId: number
  primeraViceId: number
  segundaViceId: number
  primeraSecretariaId: number
  segundaSecretariaId: number
  terceraSecretariaId: number
}

export const useDirectiva = () => {
  const { get, put, post } = useApi()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiUrl || 'https://demoback.senado.gob.bo/api'

  const getDirectivaAdmin = async (): Promise<DirectivaAdmin> => {
    return await get<DirectivaAdmin>(`${baseUrl}/legisladores/directiva/admin`)
  }

  const getTitularesDisponibles = async (): Promise<SenadorTitular[]> => {
    return await get<SenadorTitular[]>(`${baseUrl}/legisladores/directiva/titulares`)
  }

  const saveDirectiva = async (payload: SaveDirectivaPayload): Promise<any> => {
    return await put<any>(`${baseUrl}/legisladores/directiva`, payload)
  }

  const seedDirectiva = async (): Promise<any> => {
    return await post<any>(`${baseUrl}/legisladores/directiva/seed`, {})
  }

  return {
    getDirectivaAdmin,
    getTitularesDisponibles,
    saveDirectiva,
    seedDirectiva,
  }
}