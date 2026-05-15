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
    console.log('\n🔵 [useNews.getNews] ========== INICIO ==========')
    console.log('🔵 Parámetros recibidos:', params)
    
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    
    if (params?.status && params.status !== 'all') {
      console.log('🔵 ✅ Enviando status:', params.status)
      query.append('status', params.status)
    } else {
      console.log('🔵 ⚠️ NO enviando status (es "all" o undefined)')
    }
    
    if (params?.type && params.type !== 'all') {
      console.log('🔵 ✅ Enviando type:', params.type)
      query.append('type', params.type)
    }
    
    if (params?.category) {
      console.log('🔵 ✅ Enviando category:', params.category)
      query.append('category', params.category)
    }
    
    if (params?.search) {
      console.log('🔵 ✅ Enviando search:', params.search)
      query.append('search', params.search)
    }
    
    const url = `${baseUrl}/content?${query.toString()}`
    console.log('🔵 URL final:', url)
    
    try {
      const result = await get<any>(url)
      console.log('🔵 Respuesta recibida - total:', result.total, 'pages:', result.pages)
      console.log('🔵 [useNews.getNews] ========== FIN ==========\n')
      return result
    } catch (error) {
      console.error('🔴 Error en getNews:', error)
      throw error
    }
  }

  // Obtener una noticia por ID
  const getNewsById = async (id: string) => {
    console.log(`🔵 [useNews.getNewsById] Buscando ID: ${id}`)
    const result = await get<NewsItem>(`${baseUrl}/content/${id}`)
    return result
  }

  // Crear noticia
  const createNews = async (data: Partial<NewsItem>) => {
    console.log('\n🔵 [useNews.createNews] ========== INICIO ==========')
    console.log('🔵 Datos a enviar:', {
      title: data.title,
      status: data.status,
      category: data.category,
      contentLength: data.content?.length || 0
    })
    
    const result = await post<NewsItem>(`${baseUrl}/content`, data)
    console.log('🔵 Respuesta del servidor:', { id: result._id, status: result.status, title: result.title })
    console.log('🔵 [useNews.createNews] ========== FIN ==========\n')
    return result
  }

  // Actualizar noticia
  const updateNews = async (id: string, data: Partial<NewsItem>) => {
    console.log(`🔵 [useNews.updateNews] Actualizando ID: ${id}`)
    console.log('🔵 Datos:', { title: data.title, status: data.status })
    const result = await put<NewsItem>(`${baseUrl}/content/${id}`, data)
    return result
  }

  // Eliminar noticia
  const deleteNews = async (id: string) => {
    console.log(`🔵 [useNews.deleteNews] Eliminando ID: ${id}`)
    const result = await del(`${baseUrl}/content/${id}`)
    return result
  }

  // Cambiar estado
  const changeStatus = async (id: string, status: string) => {
    console.log(`🔵 [useNews.changeStatus] Cambiando ${id} a ${status}`)
    const result = await put(`${baseUrl}/content/${id}/status`, { status })
    return result
  }

  // Subir imagen
  const uploadImage = async (file: File, alt?: string) => {
    console.log('📸 [uploadImage] Subiendo imagen:', file.name, file.type, file.size)
    const formData = new FormData()
    formData.append('image', file)
    if (alt) formData.append('alt', alt)

    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${baseUrl}/content/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    const result = await response.json()
    console.log('📸 [uploadImage] Respuesta:', result)
    if (!result.success) throw new Error(result.message)
    return result.data
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