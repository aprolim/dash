// composables/useTabsApi.ts
import { useApi } from './useApi'

console.log('🟢 useTabsApi.ts cargado')

export interface TabCategory {
  categoryId: string
  name: string
  description: string
  order: number
  icon: string
  color: string
  isActive: boolean
  linksCount?: number
  createdAt?: string
  updatedAt?: string
  createdBy?: any
  lastUpdatedBy?: any
}

export interface TabLink {
  categoryId: string
  linkId: string
  titulo: string
  descripcion: string
  icono: string
  path: string
  orden: number
  isActive: boolean
  categoryName?: string
  categoryColor?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: any
  lastUpdatedBy?: any
}

export interface MasterIcon {
  id: string
  nombre: string
  categoria: string
  svg: string
}

export const useTabsApi = () => {
  console.log('🟢 useTabsApi() ejecutado')
  
  const { get, post, put, del } = useApi()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiUrl || 'http://demoback.senado.gob.bo/api'
  
  console.log('🟢 baseUrl:', baseUrl)

  return {
    // CATEGORÍAS
    getCategories: async (includeInactive = false) => {
      const result = await get<TabCategory[]>(`${baseUrl}/tabs/categories?includeInactive=${includeInactive}`)
      return result
    },

    getCategory: async (categoryId: string) => {
      const result = await get<TabCategory>(`${baseUrl}/tabs/categories/${categoryId}`)
      return result
    },

    createCategory: async (data: Partial<TabCategory>) => {
      const result = await post<TabCategory>(`${baseUrl}/tabs/categories`, data)
      return result
    },

    updateCategory: async (categoryId: string, data: Partial<TabCategory>) => {
      const result = await put<TabCategory>(`${baseUrl}/tabs/categories/${categoryId}`, data)
      return result
    },

    deleteCategory: async (categoryId: string) => {
      const result = await del(`${baseUrl}/tabs/categories/${categoryId}`)
      return result
    },

    // LINKS - VERSIÓN CORREGIDA
    getLinks: async (params?: { categoryId?: string, includeInactive?: boolean, page?: number, limit?: number }) => {
      console.log('🟡 getLinks llamado con params:', params)
      
      const query = new URLSearchParams()
      if (params?.categoryId) query.append('categoryId', params.categoryId)
      if (params?.includeInactive) query.append('includeInactive', 'true')
      if (params?.page) query.append('page', params.page.toString())
      if (params?.limit) query.append('limit', params.limit.toString())
      
      const url = `${baseUrl}/tabs/links?${query.toString()}`
      console.log('🟡 URL:', url)
      
      try {
        const result = await get<any>(url)
        console.log('🟢 Resultado CRUDO de get:', result)
        
        // ✅ VERSIÓN SEGURA - Maneja diferentes estructuras
        if (!result) {
          console.warn('⚠️ getLinks: result es undefined')
          return { links: [], pagination: { total: 0, page: 1, limit: 20, pages: 0 } }
        }
        
        // Si result ya tiene la estructura { links, pagination }
        if (result.links !== undefined) {
          console.log('🟢 getLinks: result tiene propiedad links')
          return result
        }
        
        // Si result tiene propiedad data con { links, pagination }
        if (result.data && result.data.links !== undefined) {
          console.log('🟢 getLinks: result.data tiene propiedad links')
          return result.data
        }
        
        // Si result es directamente un array
        if (Array.isArray(result)) {
          console.log('🟢 getLinks: result es un array')
          return { links: result, pagination: { total: result.length, page: 1, limit: result.length, pages: 1 } }
        }
        
        // Si no reconocemos la estructura, devolvemos objeto vacío
        console.warn('⚠️ getLinks: estructura no reconocida', result)
        return { links: [], pagination: { total: 0, page: 1, limit: 20, pages: 0 } }
        
      } catch (error) {
        console.error('🔴 Error en getLinks:', error)
        return { links: [], pagination: { total: 0, page: 1, limit: 20, pages: 0 } }
      }
    },

    getLink: async (linkId: string) => {
      const result = await get<TabLink>(`${baseUrl}/tabs/links/${linkId}`)
      return result
    },

    createLink: async (data: Partial<TabLink>) => {
      const result = await post<TabLink>(`${baseUrl}/tabs/links`, data)
      return result
    },

    updateLink: async (linkId: string, data: Partial<TabLink>) => {
      console.log('🟡 updateLink enviando:', {
        linkId,
        data: {
          ...data,
          iconoPreview: data.icono ? data.icono.substring(0, 30) + '...' : 'VACÍO'
        }
      })
      
      const result = await put<any>(`${baseUrl}/tabs/links/${linkId}`, data)
      return result.data
    },

    deleteLink: async (linkId: string) => {
      const result = await del(`${baseUrl}/tabs/links/${linkId}`)
      return result
    },

    reorderLinks: async (categoryId: string, order: { linkId: string; position: number }[]) => {
      const result = await post(`${baseUrl}/tabs/links/reorder`, { categoryId, order })
      return result
    },

    // ICONOS MAESTROS
    getMasterIcons: async () => {
      console.log('🟡 Obteniendo iconos maestros...')
      const response = await get<{ icons: MasterIcon[], total: number }>(`${baseUrl}/icons/master`)
      return response.icons
    },

    // DATOS PÚBLICOS
    getTabsData: async () => {
      const result = await get<any>(`${baseUrl}/tabs`)
      return result
    },

    getTabLinks: async (tabId: string) => {
      const result = await get<any>(`${baseUrl}/tabs/${tabId}`)
      return result
    },
  }
}