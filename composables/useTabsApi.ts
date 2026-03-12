// composables/useTabsApi.ts
import { useApi } from './useApi'

export interface TabCategory {
  categoryId: string
  name: string
  description: string
  order: number
  icon: string
  isActive: boolean
  linksCount?: number
  createdAt?: string
  updatedAt?: string
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
  createdAt?: string
  updatedAt?: string
}

export interface IconGalleryItem {
  id: string
  categoryId: string
  categoryName: string
  icono: string
  ejemplo: string
  preview: string
}

export const useTabsApi = () => {
  const { get, post, put, del } = useApi()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiUrl || 'http://demoback.senado.gob.bo/api'

  return {
    // CATEGORÍAS
    getCategories: (includeInactive = false) => 
      get<TabCategory[]>(`${baseUrl}/tabs/categories?includeInactive=${includeInactive}`),

    getCategory: (categoryId: string) => 
      get<TabCategory>(`${baseUrl}/tabs/categories/${categoryId}`),

    createCategory: (data: Partial<TabCategory>) => 
      post<TabCategory>(`${baseUrl}/tabs/categories`, data),

    updateCategory: (categoryId: string, data: Partial<TabCategory>) => 
      put<TabCategory>(`${baseUrl}/tabs/categories/${categoryId}`, data),

    deleteCategory: (categoryId: string) => 
      del(`${baseUrl}/tabs/categories/${categoryId}`),

    // LINKS
    getLinks: (params?: { categoryId?: string, includeInactive?: boolean, page?: number, limit?: number }) => {
      const query = new URLSearchParams()
      if (params?.categoryId) query.append('categoryId', params.categoryId)
      if (params?.includeInactive) query.append('includeInactive', 'true')
      if (params?.page) query.append('page', params.page.toString())
      if (params?.limit) query.append('limit', params.limit.toString())
      
      return get<any>(`${baseUrl}/tabs/links?${query.toString()}`)
    },

    getLink: (linkId: string) => 
      get<TabLink>(`${baseUrl}/tabs/links/${linkId}`),

    createLink: (data: Partial<TabLink>) => 
      post<TabLink>(`${baseUrl}/tabs/links`, data),

    updateLink: (linkId: string, data: Partial<TabLink>) => 
      put<TabLink>(`${baseUrl}/tabs/links/${linkId}`, data),

    deleteLink: (linkId: string) => 
      del(`${baseUrl}/tabs/links/${linkId}`),

    reorderLinks: (categoryId: string, order: { linkId: string; position: number }[]) => 
      post(`${baseUrl}/tabs/links/reorder`, { categoryId, order }),

    // ICONOS
    getIconsGallery: () => 
      get<{ byCategory: any[], all: IconGalleryItem[], total: number }>(`${baseUrl}/tabs/icons/gallery`),

    // DATOS PÚBLICOS
    getTabsData: () => 
      get<any>(`${baseUrl}/tabs`),

    getTabLinks: (tabId: string) => 
      get<any>(`${baseUrl}/tabs/${tabId}`),
  }
}