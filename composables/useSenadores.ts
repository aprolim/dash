// composables/useSenadores.ts
import { senadores } from '~/data/senadores'

export interface Senador {
  id: number
  seatNumber: number
  name: string
  slug: string
  party: string
  partyShort: string
  partyColor: string
  department: string
  foto: string
}

export const useSenadores = () => {
  // Obtener todos los senadores para el select
  const getSenadoresList = (): Senador[] => {
    return senadores.map(s => ({
      id: s.id,
      seatNumber: s.seatNumber,
      name: s.name,
      slug: s.slug,
      party: s.party,
      partyShort: s.partyShort,
      partyColor: s.partyColor,
      department: s.department,
      foto: s.foto || '/images/default-avatar.png'
    }))
  }

  // Buscar senador por ID
  const getSenadorById = (id: number): Senador | null => {
    const senador = senadores.find(s => s.id === id)
    if (!senador) return null
    return {
      id: senador.id,
      seatNumber: senador.seatNumber,
      name: senador.name,
      slug: senador.slug,
      party: senador.party,
      partyShort: senador.partyShort,
      partyColor: senador.partyColor,
      department: senador.department,
      foto: senador.foto || '/images/default-avatar.png'
    }
  }

  // Buscar senadores por departamento
  const getSenadoresByDepartment = (department: string): Senador[] => {
    return senadores
      .filter(s => s.department === department)
      .map(s => ({
        id: s.id,
        seatNumber: s.seatNumber,
        name: s.name,
        slug: s.slug,
        party: s.party,
        partyShort: s.partyShort,
        partyColor: s.partyColor,
        department: s.department,
        foto: s.foto || '/images/default-avatar.png'
      }))
  }

  return {
    getSenadoresList,
    getSenadorById,
    getSenadoresByDepartment
  }
}