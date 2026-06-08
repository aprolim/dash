// composables/useNews.ts
import { useApi } from './useApi'

export interface NewsItem {
  _id: string
  title: string
  slug: string
  content: string
  blocks: any[]
  excerpt: string
  type: 'news' | 'article' | 'announcement' | 'page'
  category: 'noticia' | 'importante'
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  featuredImage?: {
    url: string
    alt: string
    caption?: string
  }
  gallery?: {
    url: string
    alt: string
    caption: string
    order: number
  }[]
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
    if (params?.category && params.category !== 'all') query.append('category', params.category)
    if (params?.search) query.append('search', params.search)
    
    const url = `${baseUrl}/content/admin?${query.toString()}`
    const result = await get<any>(url)
    return result
  }

  const getNewsById = async (id: string) => {
    const result = await get<NewsItem>(`${baseUrl}/content/${id}`)
    return result
  }

  const createNews = async (data: Partial<NewsItem>) => {
    const result = await post<NewsItem>(`${baseUrl}/content`, data)
    return result
  }

  const updateNews = async (id: string, data: Partial<NewsItem>) => {
    const result = await put<NewsItem>(`${baseUrl}/content/${id}`, data)
    return result
  }

  const deleteNews = async (id: string) => {
    const result = await del(`${baseUrl}/content/${id}`)
    return result
  }

  const changeStatus = async (id: string, status: string) => {
    const result = await put(`${baseUrl}/content/${id}/status`, { status })
    return result
  }

  const uploadImage = async (file: File, alt?: string) => {
    const formData = new FormData()
    formData.append('image', file)
    if (alt) formData.append('alt', alt)

    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${baseUrl}/content/upload/image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })

    const result = await response.json()
    if (!result.success) throw new Error(result.message)
    return result.data
  }

  const getStats = async () => {
    const result = await get<any>(`${baseUrl}/content/stats`)
    return result
  }

  const getContentTypes = async () => {
    const result = await get<any[]>(`${baseUrl}/content/types`)
    return result
  }

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