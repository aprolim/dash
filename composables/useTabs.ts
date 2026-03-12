// composables/useTabs.ts
export interface Tab {
  id: string
  label: string
  icono: string
}

export interface Area {
  titulo: string
  descripcion: string
}

export interface Link {
  id: string
  titulo: string
  descripcion: string
  icono: string
  path: string
}

export interface TabsData {
  tabs: Tab[]
  areas: Record<string, Area>
  links: Record<string, Link[]>
}

export const useTabs = () => {
  const config = useRuntimeConfig()
  // Usar la misma variable de entorno que el admin
  const baseUrl = config.public.apiUrl || 'http://demoback.senado.gob.bo/api'

  const getTabsData = async (): Promise<TabsData> => {
    try {
      const response = await fetch(`${baseUrl}/tabs`)
      
      if (!response.ok) {
        throw new Error('Error al cargar los tabs')
      }
      
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Error fetching tabs:', error)
      return {
        tabs: [],
        areas: {},
        links: {}
      }
    }
  }

  return {
    getTabsData
  }
}