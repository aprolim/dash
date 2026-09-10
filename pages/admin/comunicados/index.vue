<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">📢 Gestión de Comunicados</h1>
        <p class="text-gray-600">Comunicados programados que aparecen como modal en la página principal</p>
      </div>
      <NuxtLink 
        to="/admin/comunicados/create" 
        class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        <span class="mr-2">+</span>
        Nuevo Comunicado
      </NuxtLink>
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-gray-900">{{ stats.total }}</div>
        <div class="text-xs text-gray-500">Total</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-green-600">{{ stats.activos }}</div>
        <div class="text-xs text-gray-500">Activos</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-yellow-600">{{ stats.programados }}</div>
        <div class="text-xs text-gray-500">Programados</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-gray-600">{{ stats.inactivos }}</div>
        <div class="text-xs text-gray-500">Inactivos</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-blue-600">{{ stats.expirados }}</div>
        <div class="text-xs text-gray-500">→ Avisos</div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap gap-4">
      <select v-model="filters.estado" @change="loadComunicados" class="px-3 py-2 border rounded-lg text-sm">
        <option value="todos">Todos los estados</option>
        <option value="activo">🟢 Activos</option>
        <option value="programado">⏰ Programados</option>
        <option value="inactivo">⚪ Inactivos</option>
      </select>
      
      <div class="flex-1">
        <input 
          v-model="filters.search" 
          @input="onSearchInput"
          type="text" 
          placeholder="Buscar por título..." 
          class="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>

      <button 
        @click="forceUpdateEstados" 
        class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
      >
        🔄 Actualizar estados
      </button>
      
      <button @click="resetFilters" class="px-3 py-2 text-gray-600 hover:text-gray-800">
        Limpiar
      </button>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando comunicados...</p>
      </div>
      
      <div v-else-if="error" class="text-center py-12 text-red-600">
        {{ error }}
      </div>
      
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programación</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lanzamiento</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in comunicados" :key="item._id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <img 
                v-if="item.imagen && item.imagen.url"
                :src="item.imagen.url" 
                class="w-16 h-12 object-cover rounded"
              />
              <div v-else class="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
                Sin img
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">{{ item.titulo }}</div>
            </td>
            <td class="px-6 py-4">
              <span :class="estadoClass(item.estado)" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ estadoText(item.estado) }}
              </span>
            </td>
            <td class="px-6 py-4 text-xs text-gray-500">
              <div v-if="item.fechaActivacion">
                <span class="text-green-600">▶</span> {{ formatearFecha(item.fechaActivacion) }}
              </div>
              <div v-if="item.fechaDesactivacion">
                <span class="text-red-600">⏹</span> {{ formatearFecha(item.fechaDesactivacion) }}
              </div>
              <div v-if="!item.fechaActivacion && !item.fechaDesactivacion" class="italic text-gray-400">
                Sin programación
              </div>
            </td>
            <td class="px-6 py-4 text-xs text-gray-500">
              {{ formatearFecha(item.fechaLanzamiento) }}
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-end gap-2">
                <button 
                  @click="cambiarEstado(item)" 
                  class="text-blue-600 hover:text-blue-900 text-lg"
                  :title="item.estado === 'activo' ? 'Desactivar' : 'Activar'"
                >
                  {{ item.estado === 'activo' ? '⏸' : '▶' }}
                </button>
                <NuxtLink 
                  :to="`/admin/comunicados/edit/${item._id}`" 
                  class="text-primary-600 hover:text-primary-900 text-lg"
                >
                  ✏
                </NuxtLink>
                <button @click="confirmDelete(item)" class="text-red-600 hover:text-red-900 text-lg">
                  🗑
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="comunicados.length === 0 && !loading">
            <td colspan="6" class="px-6 py-12 text-center text-gray-500">
              No hay comunicados con los filtros seleccionados
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="totalPages > 1" class="px-6 py-4 border-t flex justify-between items-center">
        <button 
          @click="prevPage" 
          :disabled="page === 1" 
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span class="text-sm text-gray-600">Página {{ page }} de {{ totalPages }}</span>
        <button 
          @click="nextPage" 
          :disabled="page === totalPages" 
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <Modal v-model="showDeleteModal" title="Confirmar eliminación" size="lg">
      <div class="p-4">
        <p class="text-gray-700">¿Estás seguro de que deseas eliminar el comunicado <strong>{{ comunicadoToDelete?.titulo }}</strong>?</p>
        <p class="text-red-600 text-sm mt-2">Esta acción no se puede deshacer.</p>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showDeleteModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button @click="deleteComunicado" :disabled="deleting" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useComunicados } from '~/composables/useComunicados'
import Modal from '~/components/ui/Modal.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { 
  getComunicados, 
  deleteComunicado: deleteComunicadoApi,
  changeEstado,
  getStats,
  forceUpdate
} = useComunicados()

const comunicados = ref([])
const stats = ref({ total: 0, activos: 0, inactivos: 0, programados: 0, expirados: 0 })
const loading = ref(false)
const error = ref(null)
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)

const filters = ref({
  estado: 'todos',
  search: ''
})

let searchTimeout = null

const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha'
  try {
    const date = new Date(fecha)
    if (isNaN(date.getTime())) return 'Fecha inválida'
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Fecha inválida'
  }
}

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadComunicados()
  }, 500)
}

const resetFilters = () => {
  filters.value = { estado: 'todos', search: '' }
  page.value = 1
  loadComunicados()
}

const loadComunicados = async () => {
  loading.value = true
  error.value = null
  
  try {
    const result = await getComunicados({
      page: page.value,
      limit: 10,
      estado: filters.value.estado,
      search: filters.value.search
    })
    
    comunicados.value = result.comunicados || []
    total.value = result.total || 0
    totalPages.value = result.pages || 1
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    stats.value = await getStats()
  } catch (err) {
    console.error('Error cargando stats:', err)
  }
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    loadComunicados()
  }
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++
    loadComunicados()
  }
}

const showDeleteModal = ref(false)
const comunicadoToDelete = ref(null)
const deleting = ref(false)

const confirmDelete = (item) => {
  comunicadoToDelete.value = item
  showDeleteModal.value = true
}

const deleteComunicado = async () => {
  if (!comunicadoToDelete.value) return
  
  deleting.value = true
  try {
    await deleteComunicadoApi(comunicadoToDelete.value._id)
    showDeleteModal.value = false
    await loadComunicados()
    await loadStats()
  } catch (err) {
    console.error('Error deleting:', err)
    alert('Error al eliminar el comunicado')
  } finally {
    deleting.value = false
    comunicadoToDelete.value = null
  }
}

const cambiarEstado = async (item) => {
  const nuevoEstado = item.estado === 'activo' ? 'inactivo' : 'activo'
  if (!confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) return
  
  try {
    await changeEstado(item._id, nuevoEstado)
    await loadComunicados()
    await loadStats()
  } catch (err) {
    alert(err.message || 'Error al cambiar estado')
  }
}

const forceUpdateEstados = async () => {
  try {
    const result = await forceUpdate()
    alert(result.message || 'Estados actualizados')
    await loadComunicados()
    await loadStats()
  } catch (err) {
    alert(err.message || 'Error al actualizar estados')
  }
}

const estadoClass = (estado) => {
  const classes = {
    activo: 'bg-green-100 text-green-800',
    programado: 'bg-yellow-100 text-yellow-800',
    inactivo: 'bg-gray-100 text-gray-800'
  }
  return classes[estado] || 'bg-gray-100 text-gray-800'
}

const estadoText = (estado) => {
  const texts = {
    activo: '🟢 Activo',
    programado: '⏰ Programado',
    inactivo: '⚪ Inactivo'
  }
  return texts[estado] || estado
}

onMounted(() => {
  loadComunicados()
  loadStats()
})
</script>