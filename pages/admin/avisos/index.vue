<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">📌 Gestión de Avisos</h1>
        <p class="text-gray-600">Avisos que se muestran en la sección Avisos y Comunicados</p>
      </div>
      <NuxtLink 
        to="/admin/avisos/create" 
        class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        <span class="mr-2">+</span>
        Nuevo Aviso
      </NuxtLink>
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-gray-900">{{ stats.total }}</div>
        <div class="text-xs text-gray-500">Total</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-green-600">{{ stats.activos }}</div>
        <div class="text-xs text-gray-500">Activos</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-blue-600">{{ stats.manuales }}</div>
        <div class="text-xs text-gray-500">Manuales</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-purple-600">{{ stats.comunicados }}</div>
        <div class="text-xs text-gray-500">De Comunicados</div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap gap-4">
      <select v-model="filters.tipo" @change="loadAvisos" class="px-3 py-2 border rounded-lg text-sm">
        <option value="todos">Todos los tipos</option>
        <option value="Urgente">🔴 Urgente</option>
        <option value="Importante">🟡 Importante</option>
        <option value="Informativo">🔵 Informativo</option>
        <option value="Normal">🟢 Normal</option>
      </select>
      
      <select v-model="filters.origen" @change="loadAvisos" class="px-3 py-2 border rounded-lg text-sm">
        <option value="todos">Todos los orígenes</option>
        <option value="manual">📝 Manuales</option>
        <option value="comunicado">📢 De comunicados</option>
      </select>
      
      <div class="flex-1">
        <input 
          v-model="filters.search" 
          @input="onSearchInput"
          type="text" 
          placeholder="Buscar..." 
          class="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>
      
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" v-model="filters.incluirInactivos" @change="loadAvisos" />
        Incluir inactivos
      </label>

      <button @click="resetFilters" class="px-3 py-2 text-gray-600 hover:text-gray-800">
        Limpiar
      </button>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
      
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origen</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in avisos" :key="item._id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <img 
                v-if="item.imagen" 
                :src="item.imagen" 
                class="w-16 h-12 object-cover rounded"
              />
              <div v-else class="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                Sin img
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">{{ item.titulo }}</div>
              <div class="text-xs text-gray-500">{{ (item.descripcion || '').substring(0, 50) }}...</div>
            </td>
            <td class="px-6 py-4">
              <span :class="tipoClass(item.tipo)" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ item.tipo }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span :class="item.origen === 'comunicado' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ item.origen === 'comunicado' ? '📢 Comunicado' : '📝 Manual' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ item.fecha }}
            </td>
            <td class="px-6 py-4">
              <span :class="item.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ item.activo ? '🟢 Activo' : '⚪ Inactivo' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-end gap-2">
                <button 
                  @click="toggleActivo(item)" 
                  class="text-blue-600 hover:text-blue-900 text-lg"
                  :title="item.activo ? 'Desactivar' : 'Activar'"
                >
                  {{ item.activo ? '⏸' : '▶' }}
                </button>
                <NuxtLink 
                  v-if="item.origen === 'manual'"
                  :to="`/admin/avisos/edit/${item._id}`" 
                  class="text-primary-600 hover:text-primary-900 text-lg"
                >
                  ✏
                </NuxtLink>
                <button 
                  v-if="item.origen === 'manual'"
                  @click="confirmDelete(item)" 
                  class="text-red-600 hover:text-red-900 text-lg"
                >
                  🗑
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="avisos.length === 0 && !loading">
            <td colspan="7" class="px-6 py-12 text-center text-gray-500">
              No hay avisos con los filtros seleccionados
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="totalPages > 1" class="px-6 py-4 border-t flex justify-between items-center">
        <button @click="prevPage" :disabled="page === 1" class="px-3 py-1 border rounded disabled:opacity-50">
          Anterior
        </button>
        <span class="text-sm text-gray-600">Página {{ page }} de {{ totalPages }}</span>
        <button @click="nextPage" :disabled="page === totalPages" class="px-3 py-1 border rounded disabled:opacity-50">
          Siguiente
        </button>
      </div>
    </div>

    <Modal v-model="showDeleteModal" title="Confirmar eliminación" size="lg">
      <div class="p-4">
        <p class="text-gray-700">¿Eliminar el aviso <strong>{{ avisoToDelete?.titulo }}</strong>?</p>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showDeleteModal = false" class="px-4 py-2 border rounded-lg">Cancelar</button>
          <button @click="deleteAviso" :disabled="deleting" class="px-4 py-2 bg-red-600 text-white rounded-lg">
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAvisos } from '~/composables/useAvisos'
import Modal from '~/components/ui/Modal.vue'

definePageMeta({ layout: 'default', middleware: 'auth' })

const { 
  getAvisosAdmin, 
  deleteAviso: deleteAvisoApi,
  toggleActivo: toggleActivoApi,
  getStats 
} = useAvisos()

const avisos = ref([])
const stats = ref({ total: 0, activos: 0, manuales: 0, comunicados: 0 })
const loading = ref(false)
const error = ref(null)
const page = ref(1)
const totalPages = ref(1)

const filters = ref({
  tipo: 'todos',
  origen: 'todos',
  search: '',
  incluirInactivos: false
})

let searchTimeout = null

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadAvisos()
  }, 500)
}

const resetFilters = () => {
  filters.value = { tipo: 'todos', origen: 'todos', search: '', incluirInactivos: false }
  page.value = 1
  loadAvisos()
}

const loadAvisos = async () => {
  loading.value = true
  error.value = null
  try {
    const result = await getAvisosAdmin({
      page: page.value,
      limit: 10,
      tipo: filters.value.tipo,
      origen: filters.value.origen,
      search: filters.value.search,
      incluirInactivos: filters.value.incluirInactivos
    })
    avisos.value = result.avisos || []
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
    console.error(err)
  }
}

const prevPage = () => { if (page.value > 1) { page.value--; loadAvisos() } }
const nextPage = () => { if (page.value < totalPages.value) { page.value++; loadAvisos() } }

const showDeleteModal = ref(false)
const avisoToDelete = ref(null)
const deleting = ref(false)

const confirmDelete = (item) => {
  avisoToDelete.value = item
  showDeleteModal.value = true
}

const deleteAviso = async () => {
  if (!avisoToDelete.value) return
  deleting.value = true
  try {
    await deleteAvisoApi(avisoToDelete.value._id)
    showDeleteModal.value = false
    await loadAvisos()
    await loadStats()
  } catch (err) {
    alert(err.message)
  } finally {
    deleting.value = false
    avisoToDelete.value = null
  }
}

const toggleActivo = async (item) => {
  try {
    await toggleActivoApi(item._id, !item.activo)
    await loadAvisos()
    await loadStats()
  } catch (err) {
    alert(err.message)
  }
}

const tipoClass = (tipo) => {
  const classes = {
    Urgente: 'bg-red-100 text-red-700',
    Importante: 'bg-yellow-100 text-yellow-700',
    Informativo: 'bg-blue-100 text-blue-700',
    Normal: 'bg-green-100 text-green-700'
  }
  return classes[tipo] || 'bg-gray-100 text-gray-700'
}

onMounted(() => {
  loadAvisos()
  loadStats()
})
</script>