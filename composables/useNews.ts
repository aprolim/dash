// composables/useNews.ts
import { useApi } from './useApi'

export interface NewsItem {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  type: 'news' | 'article' | 'announcement' | 'page'
  category: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  featuredImage?: {
    url: string
    alt: string
    caption?: string
  }
  publishedAt?: string
  views: number
  author: {
    _id: string
    email: string
    profile?: {
      firstName?: string
      lastName?: string
    }
  }
  createdAt: string
  updatedAt: string
}

export const useNews = () => {
  const { get, post, put, del } = useApi()
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiUrl || 'http://demoback.senado.gob.bo/api'

  // Obtener todas las noticias (admin)
  const getNews = async (params?: {
    page?: number
    limit?: number
    status?: string
    type?: string
    category?: string
    search?: string
  }) => {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.status && params.status !== 'all') query.append('status', params.status)
    if (params?.type && params.type !== 'all') query.append('type', params.type)
    if (params?.category) query.append('category', params.category)
    if (params?.search) query.append('search', params.search)

    const result = await get<any>(`${baseUrl}/content?${query.toString()}`)
    return result
  }

  // Obtener una noticia por ID
  const getNewsById = async (id: string) => {
    const result = await get<NewsItem>(`${baseUrl}/content/${id}`)
    return result
  }

  // Crear noticia
  const createNews = async (data: Partial<NewsItem>) => {
    const result = await post<NewsItem>(`${baseUrl}/content`, data)
    return result
  }

  // Actualizar noticia
  const updateNews = async (id: string, data: Partial<NewsItem>) => {
    const result = await put<NewsItem>(`${baseUrl}/content/${id}`, data)
    return result
  }

  // Eliminar noticia
  const deleteNews = async (id: string) => {
    const result = await del(`${baseUrl}/content/${id}`)
    return result
  }

  // Cambiar estado
  const changeStatus = async (id: string, status: string) => {
    const result = await put(`${baseUrl}/content/${id}/status`, { status })
    return result
  }

  // Subir imagen - VERSIÓN CORREGIDA
  const uploadImage = async (file: File, alt?: string) => {
    console.log('📸 [uploadImage] Iniciando subida de:', file.name)
    console.log('📸 Tipo:', file.type)
    console.log('📸 Tamaño:', file.size, 'bytes')
    
    const formData = new FormData()
    formData.append('image', file)
    if (alt) formData.append('alt', alt)
    
    const token = localStorage.getItem('auth_token')
    console.log('🔑 Token presente:', !!token)
    console.log('🔑 Token (primeros 30 chars):', token?.substring(0, 30) + '...')
    
    const url = `${baseUrl}/content/upload/image`
    console.log('📡 URL:', url)
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // ⚠️ NO poner 'Content-Type' aquí - fetch lo pone automáticamente con FormData
        },
        body: formData
      })

      console.log('📡 Response status:', response.status)
      
      const result = await response.json()
      console.log('📦 Response data:', result)
      
      if (!response.ok) {
        throw new Error(result.message || `Error HTTP ${response.status}`)
      }
      
      if (!result.success) {
        throw new Error(result.message || 'Error al subir la imagen')
      }
      
      console.log('✅ Imagen subida exitosamente:', result.data.url)
      return result.data
    } catch (error) {
      console.error('❌ Error en uploadImage:', error)
      throw error
    }
  }

  // Obtener estadísticas
  const getStats = async () => {
    const result = await get<any>(`${baseUrl}/content/stats`)
    return result
  }

  // Obtener tipos de contenido
  const getContentTypes = async () => {
    const result = await get<any[]>(`${baseUrl}/content/types`)
    return result
  }

  // Obtener categorías
  const getCategories = async () => {
    const result = await get<any[]>(`${baseUrl}/content/categories`)
    return result
  }

  return {
    getNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    changeStatus,
    uploadImage,
    getStats,
    getContentTypes,
    getCategories
  }
}