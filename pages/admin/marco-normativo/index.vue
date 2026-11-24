<!-- pages/admin/marco-normativo/index.vue -->
<template>
  <div>
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <div>
        <p class="text-sm text-gray-600">
          Documentos que se muestran en
          <a
            href="https://senado.gob.bo/marco-normativo"
            target="_blank"
            class="text-primary-600 hover:underline"
          >senado.gob.bo/marco-normativo</a>
        </p>
      </div>
      <div class="flex gap-2">
        <NuxtLink
          to="/admin/marco-normativo/create"
          class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <span class="mr-2">+</span>
          Nuevo documento
        </NuxtLink>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-gray-900">{{ total }}</div>
        <div class="text-xs text-gray-500 mt-1">Total</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-amber-600">{{ totalDestacados }}</div>
        <div class="text-xs text-gray-500 mt-1">Destacados (tarjetas)</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-blue-600">{{ totalAcordeon }}</div>
        <div class="text-xs text-gray-500 mt-1">En el acordeón</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-red-600">{{ totalEliminados }}</div>
        <div class="text-xs text-gray-500 mt-1">Eliminados</div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap gap-3 items-center">
      <div class="flex-1 min-w-[250px]">
        <input
          v-model="filters.q"
          @input="onSearchInput"
          type="text"
          placeholder="Buscar por nombre, código o descripción..."
          class="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>

      <select
        v-model="filters.categoria"
        @change="onFilterChange"
        class="px-3 py-2 border rounded-lg text-sm"
      >
        <option value="">Todas las categorías</option>
        <option v-for="c in categoriasDisponibles" :key="c" :value="c">{{ c }}</option>
        <option :value="SIN_CATEGORIA">— Sin categoría —</option>
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

    <!-- Error -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
      {{ error }}
    </div>

    <!-- Cargando -->
    <div v-if="loading" class="text-center py-12 text-gray-500">Cargando...</div>

    <!-- Tabla -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Orden</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Categoría</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Gestión</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Archivos</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Estado</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="doc in documentos"
            :key="doc._id"
            class="hover:bg-gray-50"
            :class="{ 'opacity-50': doc.eliminado }"
          >
            <!-- Orden -->
            <td class="px-4 py-3 text-sm text-gray-600">
              <div class="flex items-center gap-1">
                <span class="font-mono">{{ doc.orden }}</span>
                <button
                  @click="moverOrden(doc, -1)"
                  class="text-gray-400 hover:text-gray-700"
                  title="Subir"
                >▲</button>
                <button
                  @click="moverOrden(doc, 1)"
                  class="text-gray-400 hover:text-gray-700"
                  title="Bajar"
                >▼</button>
              </div>
            </td>

            <!-- Documento -->
            <td class="px-4 py-3 text-sm">
              <div class="flex items-start gap-3">
                <img
                  v-if="doc.imagen"
                  :src="doc.imagen"
                  :alt="doc.nombre"
                  class="w-10 h-14 object-cover rounded border border-gray-200 shrink-0"
                  @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
                />
                <div class="min-w-0">
                  <div class="font-medium text-gray-900">{{ doc.nombre }}</div>
                  <div v-if="doc.codigo" class="text-xs text-gray-500">{{ doc.codigo }}</div>
                  <span
                    v-if="doc.destacado"
                    class="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800"
                  >★ DESTACADO</span>
                </div>
              </div>
            </td>

            <!-- Categoría -->
            <td class="px-4 py-3 text-sm text-gray-600">
              <span v-if="doc.categoria">{{ doc.categoria }}</span>
              <span v-else class="text-gray-400 italic">—</span>
            </td>

            <!-- Gestión -->
            <td class="px-4 py-3 text-sm text-gray-600">{{ doc.gestion || '—' }}</td>

            <!-- Archivos -->
            <td class="px-4 py-3 text-sm">
              <div class="flex gap-2">
                <span
                  :class="doc.archivo?.url ? 'text-green-600' : 'text-red-500'"
                  :title="doc.archivo?.url ? 'PDF cargado' : 'Sin PDF'"
                >📄</span>
                <span
                  :class="doc.imagen ? 'text-green-600' : 'text-gray-300'"
                  :title="doc.imagen ? 'Portada cargada' : 'Sin portada'"
                >🖼️</span>
              </div>
            </td>

            <!-- Estado -->
            <td class="px-4 py-3 text-sm">
              <span
                v-if="doc.eliminado"
                class="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800"
              >Eliminado</span>
              <span
                v-else-if="doc.activo === false"
                class="px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700"
              >Inactivo</span>
              <span
                v-else
                class="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800"
              >Activo</span>
            </td>

            <!-- Acciones -->
            <td class="px-4 py-3 text-sm text-right whitespace-nowrap">
              <NuxtLink
                :to="`/admin/marco-normativo/edit/${doc._id}`"
                class="text-primary-600 hover:text-primary-800 font-medium mr-3"
              >
                Editar
              </NuxtLink>

              <a
                v-if="doc.archivo?.url"
                :href="doc.archivo.url"
                target="_blank"
                class="text-gray-600 hover:text-gray-900 font-medium mr-3"
              >
                Ver PDF
              </a>

              <button
                v-if="!doc.eliminado"
                @click="eliminar(doc)"
                class="text-red-600 hover:text-red-800 font-medium"
              >
                Eliminar
              </button>
              <button
                v-else
                @click="restaurar(doc)"
                class="text-green-600 hover:text-green-800 font-medium"
              >
                Restaurar
              </button>
            </td>
          </tr>

          <tr v-if="documentos.length === 0">
            <td colspan="7" class="px-4 py-12 text-center text-gray-500">
              No hay documentos. Crea el primero con el botón «Nuevo documento».
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div v-if="pages > 1" class="flex justify-center items-center gap-2 mt-6">
      <button
        @click="irPagina(page - 1)"
        :disabled="page <= 1"
        class="px-3 py-1.5 border rounded-md text-sm disabled:opacity-40"
      >
        Anterior
      </button>
      <span class="text-sm text-gray-600">Página {{ page }} de {{ pages }}</span>
      <button
        @click="irPagina(page + 1)"
        :disabled="page >= pages"
        class="px-3 py-1.5 border rounded-md text-sm disabled:opacity-40"
      >
        Siguiente
      </button>
    </div>

    <!-- Toast -->
    <div
      v-if="toast.show"
      class="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white"
      :class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useMarcoNormativo } from '~/composables/useMarcoNormativo'
import type { MarcoNormativoItem } from '~/composables/useMarcoNormativo'

definePageMeta({ layout: 'default' })

const SIN_CATEGORIA = '__sin_categoria__'

const {
  getDocumentos,
  getCategorias,
  updateDocumento,
  deleteDocumento,
  restoreDocumento
} = useMarcoNormativo()

const documentos = ref<MarcoNormativoItem[]>([])
const categoriasDisponibles = ref<string[]>([])

const loading = ref(false)
const error = ref('')

const page = ref(1)
const limit = ref(50)
const pages = ref(1)
const total = ref(0)

const filters = reactive({
  q: '',
  categoria: '',
  incluirInactivos: false,
  incluirEliminados: false
})

const toast = reactive({ show: false, message: '', type: 'success' as 'success' | 'error' })

let searchTimeout: any = null

const mostrarToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 3500)
}

// Contadores locales (sobre lo cargado)
const totalDestacados = computed(() => documentos.value.filter(d => d.destacado && !d.eliminado).length)
const totalAcordeon = computed(() => documentos.value.filter(d => d.categoria && !d.eliminado).length)
const totalEliminados = computed(() => documentos.value.filter(d => d.eliminado).length)

// ============================================
// CARGA
// ============================================
const cargar = async () => {
  loading.value = true
  error.value = ''

  try {
    const params: any = {
      page: page.value,
      limit: limit.value,
      incluirInactivos: filters.incluirInactivos,
      incluirEliminados: filters.incluirEliminados
    }
    if (filters.q.trim()) params.q = filters.q.trim()
    if (filters.categoria === SIN_CATEGORIA) {
      // El backend filtra por categoría exacta; para "sin categoría" cargamos todo
      // y filtramos en cliente (son pocos registros).
      params.limit = 200
    } else if (filters.categoria) {
      params.categoria = filters.categoria
    }

    const result = await getDocumentos(params)

    let docs = result.documentos
    if (filters.categoria === SIN_CATEGORIA) {
      docs = docs.filter(d => !d.categoria)
    }

    documentos.value = docs
    total.value = filters.categoria === SIN_CATEGORIA ? docs.length : result.total
    pages.value = filters.categoria === SIN_CATEGORIA ? 1 : result.pages
    page.value = result.page
  } catch (err: any) {
    console.error(err)
    error.value = err.message || 'Error al cargar los documentos'
  } finally {
    loading.value = false
  }
}

const cargarCategorias = async () => {
  try {
    categoriasDisponibles.value = await getCategorias()
  } catch {
    categoriasDisponibles.value = []
  }
}

// ============================================
// FILTROS
// ============================================
const onSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    cargar()
  }, 400)
}

const onFilterChange = () => {
  page.value = 1
  cargar()
}

const resetFilters = () => {
  filters.q = ''
  filters.categoria = ''
  filters.incluirInactivos = false
  filters.incluirEliminados = false
  page.value = 1
  cargar()
}

const irPagina = (p: number) => {
  if (p < 1 || p > pages.value) return
  page.value = p
  cargar()
}

// ============================================
// ORDEN RÁPIDO (▲ ▼)
// ============================================
const moverOrden = async (doc: MarcoNormativoItem, delta: number) => {
  const nuevo = (doc.orden || 0) + delta
  if (nuevo < 0) return

  const anterior = doc.orden
  doc.orden = nuevo // optimista

  try {
    await updateDocumento(doc._id, { orden: nuevo })
    mostrarToast('Orden actualizado')
    // Reordenar en cliente para ver el efecto inmediato
    documentos.value = [...documentos.value].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
  } catch (err: any) {
    doc.orden = anterior // revertir
    mostrarToast(err.message || 'No se pudo actualizar el orden', 'error')
  }
}

// ============================================
// ELIMINAR / RESTAURAR
// ============================================
const eliminar = async (doc: MarcoNormativoItem) => {
  const motivo = window.prompt(
    `Motivo por el que se elimina «${doc.nombre}»:\n(dejar vacío para omitir)`
  )
  if (motivo === null) return // canceló

  try {
    await deleteDocumento(doc._id, motivo.trim())
    mostrarToast('Documento eliminado')
    await cargar()
  } catch (err: any) {
    mostrarToast(err.message || 'No se pudo eliminar', 'error')
  }
}

const restaurar = async (doc: MarcoNormativoItem) => {
  try {
    await restoreDocumento(doc._id)
    mostrarToast('Documento restaurado')
    await cargar()
  } catch (err: any) {
    mostrarToast(err.message || 'No se pudo restaurar', 'error')
  }
}

onMounted(async () => {
  await Promise.all([cargarCategorias(), cargar()])
})
</script>
