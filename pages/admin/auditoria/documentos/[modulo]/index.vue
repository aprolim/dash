<template>
  <div>
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin/auditoria" class="text-gray-400 hover:text-gray-600 text-2xl">
        ←
      </NuxtLink>
      <div class="flex-1">
        <h1 class="text-2xl font-semibold text-gray-900">
          {{ moduloNombre }}
        </h1>
        <p class="text-sm text-gray-500 mt-1">Documentos organizados por categorías</p>
      </div>
      <NuxtLink
        :to="`/admin/auditoria/documentos/${modulo}/create`"
        class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        <span class="mr-2">+</span>
        Nuevo Documento
      </NuxtLink>
    </div>

    <!-- Filtros -->
    <div class="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap gap-3">
      <select
        v-model="filters.categoria"
        @change="loadDocumentos"
        class="px-3 py-2 border rounded-lg text-sm"
      >
        <option value="">Todas las categorías</option>
        <option v-for="cat in categorias" :key="cat.key" :value="cat.key">
          {{ cat.nombre }}
        </option>
      </select>

      <select
        v-model="filters.gestion"
        @change="loadDocumentos"
        class="px-3 py-2 border rounded-lg text-sm"
      >
        <option value="">Todas las gestiones</option>
        <option v-for="year in gestionesDisponibles" :key="year" :value="year">
          {{ year }}
        </option>
      </select>

      <div class="flex-1 min-w-[200px]">
        <input
          v-model="filters.search"
          @input="onSearchInput"
          type="text"
          placeholder="Buscar por título o descripción..."
          class="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>

      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" v-model="filters.incluirInactivos" @change="loadDocumentos" />
        Incluir inactivos
      </label>

      <button @click="resetFilters" class="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm">
        Limpiar
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando documentos...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-800">{{ error }}</p>
      <button @click="loadDocumentos" class="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm">
        Reintentar
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="documentos.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
      <div class="text-4xl mb-3">📭</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No hay documentos</h3>
      <p class="text-gray-500 mb-4">
        {{ tieneFiltros ? 'Prueba con otros filtros o limpia la búsqueda' : 'Crea el primer documento para comenzar' }}
      </p>
      <NuxtLink
        :to="`/admin/auditoria/documentos/${modulo}/create`"
        class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        + Crear Documento
      </NuxtLink>
    </div>

    <!-- Tabla -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gestión</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PDF</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="doc in documentos"
              :key="doc._id"
              class="hover:bg-gray-50"
              :class="{ 'opacity-60 bg-gray-50': !doc.activo }"
            >
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">{{ doc.titulo }}</div>
                <div v-if="doc.descripcion" class="text-xs text-gray-500 line-clamp-2">
                  {{ doc.descripcion.substring(0, 100) }}{{ doc.descripcion.length > 100 ? '...' : '' }}
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {{ getCategoriaNombre(doc.categoria) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ doc.gestion }}</td>
              <td class="px-4 py-3">
                <span :class="estadoClass(doc.estado)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ doc.estado }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">
                <a
                  v-if="doc.url"
                  :href="doc.url"
                  target="_blank"
                  class="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                  title="Ver PDF"
                >
                  📄 Ver
                </a>
                <span v-else class="text-gray-300 text-xs">Sin PDF</span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    @click="toggleActivo(doc)"
                    class="px-2 py-1 text-xs rounded font-medium"
                    :class="doc.activo ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'"
                    :title="doc.activo ? 'Desactivar' : 'Activar'"
                  >
                    {{ doc.activo ? '⏸' : '▶' }}
                  </button>
                  <NuxtLink
                    :to="`/admin/auditoria/documentos/${modulo}/edit/${doc._id}`"
                    class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
                  >
                    ✏ Editar
                  </NuxtLink>
                  <button
                    @click="confirmDelete(doc)"
                    class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
                  >
                    🗑
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Contador -->
      <div class="px-4 py-3 border-t bg-gray-50 text-sm text-gray-600">
        Mostrando {{ documentos.length }} documento{{ documentos.length !== 1 ? 's' : '' }}
        <span v-if="tieneFiltros">(filtrados)</span>
      </div>
    </div>

    <!-- Modal de eliminación -->
    <Modal v-model="showDeleteModal" title="Confirmar eliminación" size="lg">
      <div class="p-4">
        <p class="text-gray-700">
          ¿Eliminar el documento <strong>{{ docToDelete?.titulo }}</strong>?
        </p>
        <p class="text-red-600 text-sm mt-2">Esta acción no se puede deshacer.</p>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showDeleteModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button
            @click="deleteDocumento"
            :disabled="deleting"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </Modal>

    <!-- Toast -->
    <div
      v-if="toast.show"
      class="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50"
      :class="toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuditoria, type AuditoriaCategoria, type AuditoriaDocumento, type ModuloAuditoria } from '~/composables/useAuditoria'
import Modal from '~/components/ui/Modal.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const route = useRoute()
const modulo = route.params.modulo as ModuloAuditoria

const { getDocumentosAdmin, getCategorias, deleteDocumento: deleteDocumentoApi, updateDocumento } = useAuditoria()

// Estado
const documentos = ref<AuditoriaDocumento[]>([])
const categorias = ref<AuditoriaCategoria[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Filtros
const filters = ref({
  categoria: '',
  gestion: '',
  search: '',
  incluirInactivos: false,
})

let searchTimeout: NodeJS.Timeout

// Modal
const showDeleteModal = ref(false)
const docToDelete = ref<AuditoriaDocumento | null>(null)
const deleting = ref(false)

// Toast
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

// Computed
const moduloNombre = computed(() => {
  const nombres: Record<string, string> = {
    'auditorias-ejecutadas': '📋 Auditorías Ejecutadas',
    'informes-actividades': '📊 Informes de Actividades',
    'otras-actividades': '📌 Otras Actividades',
  }
  return nombres[modulo] || modulo
})

const gestionesDisponibles = computed(() => {
  const years = new Set<number>()
  documentos.value.forEach(d => years.add(d.gestion))
  return Array.from(years).sort((a, b) => b - a)
})

const tieneFiltros = computed(() => {
  return !!(filters.value.categoria || filters.value.gestion || filters.value.search || filters.value.incluirInactivos)
})

// Funciones
const mostrarToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => (toast.value.show = false), 3000)
}

const estadoClass = (estado: string) => {
  const clases: Record<string, string> = {
    Publicado: 'bg-green-100 text-green-800',
    'En Revisión': 'bg-yellow-100 text-yellow-800',
    Borrador: 'bg-gray-100 text-gray-800',
  }
  return clases[estado] || 'bg-gray-100 text-gray-800'
}

const getCategoriaNombre = (key: string) => {
  const cat = categorias.value.find(c => c.key === key)
  return cat?.nombre || key
}

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadDocumentos()
  }, 500)
}

const resetFilters = () => {
  filters.value = { categoria: '', gestion: '', search: '', incluirInactivos: false }
  loadDocumentos()
}

const loadCategorias = async () => {
  try {
    categorias.value = await getCategorias(modulo, true)
  } catch (err) {
    console.error('Error cargando categorías:', err)
  }
}

const loadDocumentos = async () => {
  loading.value = true
  error.value = null
  try {
    const params: any = {
      incluirInactivos: filters.value.incluirInactivos,
    }
    if (filters.value.categoria) params.categoria = filters.value.categoria
    if (filters.value.gestion) params.gestion = parseInt(filters.value.gestion)
    if (filters.value.search) params.search = filters.value.search

    const result = await getDocumentosAdmin(modulo, params)
    documentos.value = result.documentos || []
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const toggleActivo = async (doc: AuditoriaDocumento) => {
  try {
    await updateDocumento(modulo, doc._id, { activo: !doc.activo })
    doc.activo = !doc.activo
    mostrarToast(doc.activo ? 'Documento activado' : 'Documento desactivado')
  } catch (err: any) {
    mostrarToast(err.message, 'error')
  }
}

const confirmDelete = (doc: AuditoriaDocumento) => {
  docToDelete.value = doc
  showDeleteModal.value = true
}

const deleteDocumento = async () => {
  if (!docToDelete.value) return
  deleting.value = true
  try {
    await deleteDocumentoApi(modulo, docToDelete.value._id)
    showDeleteModal.value = false
    mostrarToast('Documento eliminado')
    await loadDocumentos()
  } catch (err: any) {
    mostrarToast(err.message, 'error')
  } finally {
    deleting.value = false
    docToDelete.value = null
  }
}

onMounted(async () => {
  await loadCategorias()
  await loadDocumentos()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>