<!-- pages/admin/noticias/index.vue -->
<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Gestión de Noticias</h1>
        <p class="text-gray-600">Crea, edita y administra todas las noticias del portal</p>
      </div>
      <NuxtLink 
        to="/admin/noticias/create" 
        class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        <span class="mr-2">+</span>
        Nueva Noticia
      </NuxtLink>
    </div>

    <!-- Filtros -->
    <div class="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap gap-4">
      <select v-model="filters.status" @change="loadNews" class="px-3 py-2 border rounded-lg text-sm">
        <option value="all">Todos los estados</option>
        <option value="published">Publicadas</option>
        <option value="draft">Borradores</option>
        <option value="archived">Archivadas</option>
      </select>
      
      <select v-model="filters.type" @change="loadNews" class="px-3 py-2 border rounded-lg text-sm">
        <option value="all">Todos los tipos</option>
        <option value="news">Noticias</option>
        <option value="article">Artículos</option>
        <option value="announcement">Anuncios</option>
      </select>
      
      <div class="flex-1">
        <input 
          v-model="filters.search" 
          @input="debouncedSearch"
          type="text" 
          placeholder="Buscar por título..." 
          class="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>
      
      <button @click="resetFilters" class="px-3 py-2 text-gray-600 hover:text-gray-800">
        Limpiar
      </button>
    </div>

    <!-- Tabla de noticias -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando noticias...</p>
      </div>
      
      <div v-else-if="error" class="text-center py-12 text-red-600">
        {{ error }}
      </div>
      
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitas</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in newsList" :key="item._id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">{{ item.title }}</div>
              <div class="text-xs text-gray-500">{{ item.slug }}</div>
            </td>
            <td class="px-6 py-4">
              <span :class="statusClass(item.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ statusText(item.status) }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ item.category || '-' }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('es-ES') : '-' }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ item.views || 0 }}</td>
            <td class="px-6 py-4 text-right text-sm font-medium">
              <div class="flex justify-end gap-2">
                <NuxtLink :to="`/admin/noticias/edit/${item._id}`" class="text-primary-600 hover:text-primary-900">
                  Editar
                </NuxtLink>
                <button @click="toggleStatus(item)" class="text-yellow-600 hover:text-yellow-900">
                  {{ item.status === 'published' ? 'Archivar' : 'Publicar' }}
                </button>
                <button @click="confirmDelete(item)" class="text-red-600 hover:text-red-900">
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Paginación -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t flex justify-between items-center">
        <button 
          @click="prevPage" 
          :disabled="page === 1" 
          class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Anterior
        </button>
        <span class="text-sm text-gray-600">Página {{ page }} de {{ totalPages }}</span>
        <button 
          @click="nextPage" 
          :disabled="page === totalPages" 
          class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Siguiente
        </button>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <Modal v-model="showDeleteModal" title="Confirmar eliminación" size="lg">
      <div class="p-4">
        <p class="text-gray-700">¿Estás seguro de que deseas eliminar la noticia <strong>{{ newsToDelete?.title }}</strong>?</p>
        <p class="text-red-600 text-sm mt-2">Esta acción no se puede deshacer.</p>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showDeleteModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button @click="deleteNews" :disabled="deleting" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useNews, type NewsItem } from '~/composables/useNews'
import Modal from '~/components/ui/Modal.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { getNews, deleteNews: deleteNewsApi, changeStatus } = useNews()

const newsList = ref<NewsItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)

const filters = ref({
  status: 'all',
  type: 'all',
  search: ''
})

let searchTimeout: NodeJS.Timeout

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadNews()
  }, 500)
}

const loadNews = async () => {
  loading.value = true
  error.value = null
  
  try {
    const params: any = {
      page: page.value,
      limit: 10
    }
    
    if (filters.value.status !== 'all') params.status = filters.value.status
    if (filters.value.type !== 'all') params.type = filters.value.type
    if (filters.value.search) params.search = filters.value.search
    
    const result = await getNews(params)
    newsList.value = result.contents || []
    total.value = result.total || 0
    totalPages.value = result.pages || 1
  } catch (err: any) {
    error.value = err.message
    console.error('Error loading news:', err)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = { status: 'all', type: 'all', search: '' }
  page.value = 1
  loadNews()
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    loadNews()
  }
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++
    loadNews()
  }
}

const toggleStatus = async (item: NewsItem) => {
  const newStatus = item.status === 'published' ? 'archived' : 'published'
  try {
    await changeStatus(item._id, newStatus)
    await loadNews()
  } catch (err) {
    console.error('Error toggling status:', err)
  }
}

// Delete
const showDeleteModal = ref(false)
const newsToDelete = ref<NewsItem | null>(null)
const deleting = ref(false)

const confirmDelete = (item: NewsItem) => {
  newsToDelete.value = item
  showDeleteModal.value = true
}

const deleteNews = async () => {
  if (!newsToDelete.value) return
  
  deleting.value = true
  try {
    await deleteNewsApi(newsToDelete.value._id)
    showDeleteModal.value = false
    await loadNews()
  } catch (err) {
    console.error('Error deleting news:', err)
  } finally {
    deleting.value = false
    newsToDelete.value = null
  }
}

const statusClass = (status: string) => {
  const classes: Record<string, string> = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const statusText = (status: string) => {
  const texts: Record<string, string> = {
    published: 'Publicada',
    draft: 'Borrador',
    archived: 'Archivada'
  }
  return texts[status] || status
}

watch(() => filters.value.status, () => { page.value = 1; loadNews() })
watch(() => filters.value.type, () => { page.value = 1; loadNews() })

onMounted(() => {
  loadNews()
})
</script>