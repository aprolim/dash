<!-- pages/admin/legislativos/index.vue -->
<template>
  <div>
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl font-semibold text-gray-900">
          📚 Documentos Legislativos
        </h1>
        <p class="text-gray-600 text-sm mt-1">
          Gestiona peticiones, resoluciones, declaraciones, minutas y proyectos de ley
        </p>
      </div>
      <div class="flex gap-2">
        <!-- 🔥 NUEVO: botón a la página de catálogos -->
        <NuxtLink
          v-if="canEdit"
          to="/admin/legislativos/catalogos"
          class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
        >
          ⚙️ Administrar catálogos
        </NuxtLink>

        <NuxtLink
          v-if="canCreate"
          :to="`/admin/legislativos/create?tipo=${tipoActivo}`"
          class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <span class="mr-2">+</span>
          Nuevo Documento
        </NuxtLink>
      </div>
    </div>

    <div
      v-if="!canEdit"
      class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-800"
    >
      Estás como <strong>{{ roleLabel }}</strong>: podés consultar los documentos,
      pero no crearlos ni modificarlos.
    </div>

    <!-- Selector de tipo -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Tipo de documento
      </label>
      <select
        v-model="tipoActivo"
        @change="onTipoChange"
        class="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
      >
        <optgroup
          v-for="(bloque, bloqueId) in BLOQUES"
          :key="bloqueId"
          :label="bloque.label"
        >
          <option v-for="t in bloque.tipos" :key="t" :value="t">
            {{ getConfigTipo(t)?.label || t }}
          </option>
        </optgroup>
      </select>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-gray-900">{{ stats.total }}</div>
        <div class="text-xs text-gray-500 mt-1">Total</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-green-600">{{ stats.activos }}</div>
        <div class="text-xs text-gray-500 mt-1">Activos</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-red-600">{{ stats.eliminados }}</div>
        <div class="text-xs text-gray-500 mt-1">Eliminados</div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap gap-3 items-center">
      <div class="flex-1 min-w-[250px]">
        <input
          v-model="filters.search"
          @input="onSearchInput"
          type="text"
          placeholder="Buscar por código, asunto, peticionario o destinatario..."
          class="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>
      <select
        v-model="filters.gestion"
        @change="onFilterChange"
        class="px-3 py-2 border rounded-lg text-sm"
      >
        <option value="">Todas las gestiones</option>
        <option v-for="year in aniosDisponibles" :key="year" :value="year">
          {{ year }}
        </option>
      </select>
      <label class="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" v-model="filters.incluirInactivos" @change="onFilterChange" />
        Incluir inactivos
      </label>
      <label class="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" v-model="filters.incluirEliminados" @change="onFilterChange" />
        Incluir eliminados
      </label>
      <button
        @click="resetFilters"
        class="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
      >
        Limpiar
      </button>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando documentos...</p>
      </div>

      <div v-else-if="error" class="p-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800 text-sm">{{ error }}</p>
          <button
            @click="loadDocumentos"
            class="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Reintentar
          </button>
        </div>
      </div>

      <div v-else-if="documentos.length === 0" class="p-12 text-center">
        <div class="text-4xl mb-3">📭</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          No hay documentos
        </h3>
        <p class="text-gray-500 mb-4 text-sm">
          {{ tieneFiltros ? 'Prueba con otros filtros.' : 'Crea el primer documento para comenzar.' }}
        </p>
        <NuxtLink
          v-if="canCreate"
          :to="`/admin/legislativos/create?tipo=${tipoActivo}`"
          class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
        >
          + Crear Documento
        </NuxtLink>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="col in columnasVisibles"
                :key="col.key"
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                :style="col.ancho ? { width: col.ancho } : {}"
              >
                {{ col.label }}
              </th>
              <th
                v-if="canEdit || canDelete"
                class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="doc in documentos"
              :key="doc._id"
              class="hover:bg-gray-50"
              :class="{ 'bg-red-50/40': doc.eliminado, 'bg-gray-50 opacity-70': !doc.activo && !doc.eliminado }"
            >
              <td
                v-for="col in columnasVisibles"
                :key="col.key"
                class="px-3 py-2 align-top"
              >
                <template v-if="col.key === 'numero'">
                  <span class="font-bold text-primary-700">{{ doc.numero }}</span>
                  <span v-if="doc.eliminado" class="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                    ELIMINADO
                  </span>
                  <span v-else-if="!doc.activo" class="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    INACTIVO
                  </span>
                </template>

                <template v-else-if="col.type === 'date'">
                  <span class="text-gray-700 whitespace-nowrap">
                    {{ formatearFecha((doc as any)[col.key]) }}
                  </span>
                </template>

                <template v-else-if="col.key === 'archivo'">
                  <a
                    v-if="doc.archivo?.url"
                    :href="doc.archivo.url"
                    target="_blank"
                    class="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium"
                  >
                    📄 Ver PDF
                  </a>
                  <span v-else class="text-gray-300 text-xs">Sin PDF</span>
                </template>

                <template v-else-if="col.key === 'archivoAnexo'">
                  <div v-if="doc.archivoAnexo && doc.archivoAnexo.length > 0" class="flex flex-col gap-1">
                    <a
                      v-for="(anexo, i) in doc.archivoAnexo"
                      :key="i"
                      :href="anexo.url"
                      target="_blank"
                      class="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 text-xs font-medium"
                      :title="anexo.originalName || anexo.filename"
                    >
                      📎 Anexo {{ Number(i) + 1 }}
                    </a>
                  </div>
                  <span v-else class="text-gray-300 text-xs">Sin anexo</span>
                </template>

                <template v-else-if="col.key === 'numeroLey'">
                  <span v-if="doc.numeroLey" class="font-semibold text-blue-700">
                    {{ doc.numeroLey }}
                  </span>
                  <span v-else class="text-gray-300 text-xs">—</span>
                </template>

                <!-- 🔥 ARRAY (peticionario / comisiones) -->
                <template v-else-if="col.type === 'array'">
                  <div v-if="Array.isArray((doc as any)[col.key]) && (doc as any)[col.key].length > 0" class="flex flex-wrap gap-1 max-w-xs">
                    <span
                      v-for="(item, i) in (doc as any)[col.key]"
                      :key="i"
                      class="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] leading-tight"
                      :title="item"
                    >
                      {{ item }}
                    </span>
                  </div>
                  <span v-else class="text-gray-300 text-xs">—</span>
                </template>

                <template v-else-if="col.type === 'longtext'">
                  <div class="max-w-md text-xs text-gray-700 leading-snug line-clamp-3 text-justify">
                    {{ doc[col.key as keyof typeof doc] || '—' }}
                  </div>
                </template>

                <template v-else>
                  <span class="text-xs text-gray-700">
                    {{ doc[col.key as keyof typeof doc] || '—' }}
                  </span>
                </template>
              </td>

              <td
                v-if="canEdit || canDelete"
                class="px-3 py-2 text-right align-top whitespace-nowrap"
              >
                <div class="flex justify-end gap-1">
                  <a
                    v-if="doc.archivo?.url"
                    :href="doc.archivo.url"
                    target="_blank"
                    class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    title="Ver PDF"
                  >
                    👁
                  </a>

                  <NuxtLink
                    v-if="canEdit && !doc.eliminado"
                    :to="`/admin/legislativos/edit/${doc._id}?tipo=${tipoActivo}`"
                    class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
                  >
                    ✏ Editar
                  </NuxtLink>

                  <button
                    v-if="canDelete && !doc.eliminado"
                    @click="abrirEliminar(doc)"
                    class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
                  >
                    🗑
                  </button>

                  <button
                    v-if="isSuperAdmin && doc.eliminado"
                    @click="restaurarDocumento(doc)"
                    class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium"
                    title="Restaurar"
                  >
                    ♻ Restaurar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="totalPages > 1 && !loading"
        class="px-4 py-3 border-t flex flex-wrap justify-between items-center gap-3"
      >
        <button
          @click="prevPage"
          :disabled="page === 1"
          class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
        >
          ← Anterior
        </button>
        <span class="text-sm text-gray-600">
          Página {{ page }} de {{ totalPages }} · {{ total }} documento{{ total !== 1 ? 's' : '' }}
        </span>
        <button
          @click="nextPage"
          :disabled="page === totalPages"
          class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
        >
          Siguiente →
        </button>
      </div>
    </div>

    <DeleteModal
      v-model="showDeleteModal"
      :documento="docToDelete"
      :loading="deleting"
      @confirm="confirmarEliminar"
    />

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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePermissions } from '~/composables/usePermissions'
import {
  useDocumentosLegislativos,
  type DocumentoLegislativo
} from '~/composables/useDocumentosLegislativos'
import {
  getConfigTipo,
  BLOQUES,
  TIPOS_DOCUMENTO,
  type TipoDocumento,
  type ColumnaConfig
} from '~/utils/documentoTypes'
import DeleteModal from '~/components/admin/DeleteModal.vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { can, roleLabel } = usePermissions()

const canCreate = computed(() => can('legislativos', 'create'))
const canEdit = computed(() => can('legislativos', 'edit'))
const canDelete = computed(() => can('legislativos', 'delete'))
const isSuperAdmin = computed(() => authStore.isSuperAdmin)

const {
  getDocumentosAdmin,
  deleteDocumento: deleteDocumentoApi,
  restoreDocumento: restoreDocumentoApi,
  getStats
} = useDocumentosLegislativos()

const tipoActivo = ref<TipoDocumento>(getTipoInicial())

const documentos = ref<DocumentoLegislativo[]>([])
const stats = ref({ total: 0, activos: 0, eliminados: 0 })
const loading = ref(false)
const error = ref<string | null>(null)
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)

const filters = ref({
  search: '',
  gestion: '',
  incluirInactivos: false,
  incluirEliminados: false
})

let searchTimeout: ReturnType<typeof setTimeout> | undefined

const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

const showDeleteModal = ref(false)
const docToDelete = ref<DocumentoLegislativo | null>(null)
const deleting = ref(false)

const config = computed(() => getConfigTipo(tipoActivo.value))
const columnasVisibles = computed<ColumnaConfig[]>(() => config.value?.columnas || [])

const tieneFiltros = computed(() => {
  return !!(
    filters.value.search ||
    filters.value.gestion ||
    filters.value.incluirInactivos ||
    filters.value.incluirEliminados
  )
})

const aniosDisponibles = computed(() => {
  const actual = new Date().getFullYear()
  const anios: number[] = []
  for (let y = actual + 1; y >= 2020; y--) {
    anios.push(y)
  }
  return anios
})

function getTipoInicial(): TipoDocumento {
  const fromQuery = route.query.tipo as TipoDocumento | undefined
  if (fromQuery && TIPOS_DOCUMENTO[fromQuery]) return fromQuery
  return 'peticion-informe-escrito'
}

const mostrarToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3500)
}

const formatearFecha = (fecha: string | null | undefined): string => {
  if (!fecha) return '—'
  try {
    const d = new Date(fecha)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    })
  } catch {
    return '—'
  }
}

const loadDocumentos = async () => {
  loading.value = true
  error.value = null

  try {
    const params: any = {
      page: page.value,
      limit: 20
    }

    if (filters.value.search) params.search = filters.value.search
    if (filters.value.gestion) params.gestion = parseInt(filters.value.gestion)
    if (filters.value.incluirInactivos) params.incluirInactivos = true
    if (filters.value.incluirEliminados) params.incluirEliminados = true

    const result = await getDocumentosAdmin(tipoActivo.value, params)
    documentos.value = result.documentos || []
    total.value = result.total || 0
    totalPages.value = result.pages || 1
  } catch (err: any) {
    error.value = err.message || 'Error al cargar los documentos'
    documentos.value = []
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    stats.value = await getStats(tipoActivo.value)
  } catch (err) {
    console.error('Error cargando stats:', err)
  }
}

const recargarTodo = async () => {
  await Promise.all([loadDocumentos(), loadStats()])
}

const onTipoChange = () => {
  page.value = 1
  resetFiltrosInterno()
  router.replace({ query: { tipo: tipoActivo.value } })
  recargarTodo()
}

const onFilterChange = () => {
  page.value = 1
  loadDocumentos()
}

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadDocumentos()
  }, 500)
}

const resetFiltrosInterno = () => {
  filters.value = {
    search: '',
    gestion: '',
    incluirInactivos: false,
    incluirEliminados: false
  }
}

const resetFilters = () => {
  resetFiltrosInterno()
  page.value = 1
  loadDocumentos()
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    loadDocumentos()
  }
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++
    loadDocumentos()
  }
}

const abrirEliminar = (doc: DocumentoLegislativo) => {
  docToDelete.value = doc
  showDeleteModal.value = true
}

const confirmarEliminar = async (motivo: string) => {
  if (!docToDelete.value) return

  deleting.value = true
  try {
    await deleteDocumentoApi(tipoActivo.value, docToDelete.value._id, motivo)
    showDeleteModal.value = false
    mostrarToast('Documento eliminado correctamente. Los datos se conservan para auditoría.')
    await recargarTodo()
  } catch (err: any) {
    mostrarToast(err.message || 'Error al eliminar el documento', 'error')
  } finally {
    deleting.value = false
    docToDelete.value = null
  }
}

const restaurarDocumento = async (doc: DocumentoLegislativo) => {
  if (!confirm(`¿Restaurar el documento Nº ${doc.numero} - ${doc.codigo}?`)) return

  try {
    await restoreDocumentoApi(tipoActivo.value, doc._id)
    mostrarToast('Documento restaurado exitosamente')
    await recargarTodo()
  } catch (err: any) {
    mostrarToast(err.message || 'Error al restaurar', 'error')
  }
}

onMounted(() => {
  recargarTodo()
})

watch(
  () => route.query.tipo,
  (nuevo) => {
    if (nuevo && TIPOS_DOCUMENTO[nuevo as TipoDocumento] && nuevo !== tipoActivo.value) {
      tipoActivo.value = nuevo as TipoDocumento
      page.value = 1
      resetFiltrosInterno()
      recargarTodo()
    }
  }
)
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>