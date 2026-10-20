<!-- pages/admin/legislativos/catalogos.vue -->
<template>
  <div>
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <div>
        <NuxtLink
          to="/admin/legislativos"
          class="text-gray-400 hover:text-gray-600 text-sm inline-flex items-center gap-1 mb-1"
        >
          ← Volver a Documentos Legislativos
        </NuxtLink>
        <h1 class="text-2xl font-semibold text-gray-900">
          ⚙️ Catálogos de Legislación
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Listas exclusivas del módulo Legislación (senadores y comisiones especiales)
        </p>
      </div>

      <div class="flex gap-2">
        <button
          v-if="canSeed"
          @click="importarBase"
          :disabled="seeding"
          class="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 text-sm"
        >
          <span v-if="seeding" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          🌱 Importar catálogo base
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex space-x-8">
        <button
          @click="tabActivo = 'senadores'"
          class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
          :class="tabActivo === 'senadores' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
          👤 Senadores ({{ senadores.length }})
        </button>
        <button
          @click="tabActivo = 'comisiones'"
          class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
          :class="tabActivo === 'comisiones' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
          📋 Comisiones ({{ comisiones.length }})
        </button>
      </nav>
    </div>

    <!-- Contenido -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- ============================================ -->
      <!-- LISTA -->
      <!-- ============================================ -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow">
          <div class="p-4 border-b border-gray-200 flex flex-wrap gap-3 items-center">
            <div class="flex-1 min-w-[200px]">
              <input
                v-model="filtro"
                @input="filtrarLocal"
                type="text"
                :placeholder="tabActivo === 'senadores' ? 'Buscar senador…' : 'Buscar comisión…'"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" v-model="incluirInactivos" @change="cargarTodo" />
              Incluir inactivos
            </label>
          </div>

          <div v-if="loading" class="text-center py-12">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
            <p class="mt-3 text-gray-600 text-sm">Cargando...</p>
          </div>

          <div v-else-if="itemsFiltrados.length === 0" class="text-center py-12 text-gray-500">
            <div class="text-4xl mb-2">{{ tabActivo === 'senadores' ? '👤' : '📋' }}</div>
            <p class="text-sm">
              {{ filtro ? 'Sin resultados para tu búsqueda' : 'No hay elementos en el catálogo' }}
            </p>
            <p v-if="!filtro && tabActivo === 'senadores'" class="text-xs text-gray-400 mt-1">
              Usa el botón "Importar catálogo base" para cargar los 36 senadores.
            </p>
            <p v-if="!filtro && tabActivo === 'comisiones'" class="text-xs text-gray-400 mt-1">
              Usa el botón "Importar catálogo base" para cargar las comisiones iniciales.
            </p>
          </div>

          <div v-else class="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            <div
              v-for="item in itemsFiltrados"
              :key="item._id"
              class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              :class="{ 'opacity-50': !item.activo }"
            >
              <span class="text-lg">{{ tabActivo === 'senadores' ? '👤' : '📋' }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ item.nombre }}</p>
                <p class="text-xs text-gray-500">
                  Orden: {{ item.orden }}
                  <span v-if="!item.activo" class="ml-2 text-amber-600 font-medium">INACTIVO</span>
                </p>
              </div>
              <button
                v-if="canEdit"
                @click="editar(item)"
                class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
              >
                ✏ Editar
              </button>
              <button
                v-if="canDelete"
                @click="confirmarEliminar(item)"
                class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
              >
                🗑
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- FORMULARIO -->
      <!-- ============================================ -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow p-4 sticky top-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            {{ editando ? '✏ Editar' : '+ Nuevo' }}
            {{ tabActivo === 'senadores' ? 'senador' : 'comisión' }}
          </h2>

          <form @submit.prevent="guardar" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span class="text-red-500">*</span>
              </label>
              <input
                v-model.trim="form.nombre"
                type="text"
                required
                maxlength="300"
                :placeholder="tabActivo === 'senadores' ? 'Ej: Wilder Véliz Armas' : 'Ej: Comisión de Constitución'"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                :class="errorNombre ? 'border-red-400' : 'border-gray-300'"
              />
              <p v-if="errorNombre" class="mt-1 text-xs text-red-600">{{ errorNombre }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Orden</label>
              <input
                v-model.number="form.orden"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <p class="mt-1 text-xs text-gray-500">Menor número = aparece primero en el select</p>
            </div>

            <label class="flex items-center gap-2 text-sm">
              <input v-model="form.activo" type="checkbox" class="w-4 h-4" />
              Activo (visible en los selects)
            </label>

            <div v-if="errorGeneral" class="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-800">
              {{ errorGeneral }}
            </div>

            <div class="flex gap-2 pt-2">
              <button
                v-if="editando"
                type="button"
                @click="cancelar"
                class="flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="guardando || !form.nombre"
                class="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                <span v-if="guardando" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {{ guardando ? 'Guardando...' : (editando ? 'Guardar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <Modal v-model="showDeleteModal" title="Confirmar eliminación" size="lg">
      <div class="p-2">
        <p class="text-gray-700">
          ¿Eliminar
          <strong>{{ itemAEliminar?.nombre }}</strong>
          del catálogo?
        </p>
        <p class="text-amber-600 text-sm mt-2">
          ⚠️ Los documentos existentes que usen este nombre NO se verán afectados
          (guardan el texto, no la referencia). Solo desaparecerá del selector.
        </p>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showDeleteModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button
            @click="eliminar"
            :disabled="eliminando"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {{ eliminando ? 'Eliminando...' : 'Eliminar' }}
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
import { ref, reactive, computed, onMounted } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import { usePermissions } from '~/composables/usePermissions'
import {
  useLegislativosCatalogos,
  type CatalogoItem
} from '~/composables/useLegislativosCatalogos'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { can } = usePermissions()

const canEdit = computed(() => can('legislativos', 'edit'))
const canDelete = computed(() => can('legislativos', 'delete'))
const canSeed = computed(() => can('legislativos', 'create')) // SUPER_ADMIN/ADMIN

const {
  getSenadores,
  getComisiones,
  createSenador,
  updateSenador,
  deleteSenador,
  createComision,
  updateComision,
  deleteComision,
  seedCatalogos
} = useLegislativosCatalogos()

// ============================================
// ESTADO
// ============================================
const tabActivo = ref<'senadores' | 'comisiones'>('senadores')
const senadores = ref<CatalogoItem[]>([])
const comisiones = ref<CatalogoItem[]>([])
const loading = ref(false)
const incluirInactivos = ref(false)
const filtro = ref('')

const form = reactive({
  nombre: '',
  orden: 0,
  activo: true
})

const editando = ref<CatalogoItem | null>(null)
const guardando = ref(false)
const seeding = ref(false)
const errorNombre = ref('')
const errorGeneral = ref('')

const showDeleteModal = ref(false)
const itemAEliminar = ref<CatalogoItem | null>(null)
const eliminando = ref(false)

const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

// ============================================
// COMPUTED
// ============================================
const itemsActuales = computed(() =>
  tabActivo.value === 'senadores' ? senadores.value : comisiones.value
)

const itemsFiltrados = computed(() => {
  const q = filtro.value.trim().toLowerCase()
  if (!q) return itemsActuales.value
  return itemsActuales.value.filter((i) => i.nombre.toLowerCase().includes(q))
})

// ============================================
// HELPERS
// ============================================
const mostrarToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3500)
}

const resetForm = () => {
  form.nombre = ''
  form.orden = 0
  form.activo = true
  editando.value = null
  errorNombre.value = ''
  errorGeneral.value = ''
}

const filtrarLocal = () => {
  // Solo dispara el computed
}

// ============================================
// CARGA
// ============================================
const cargarTodo = async () => {
  loading.value = true
  try {
    const [s, c] = await Promise.all([
      getSenadores({ incluirInactivos: incluirInactivos.value }),
      getComisiones({ incluirInactivos: incluirInactivos.value })
    ])
    senadores.value = s
    comisiones.value = c
  } catch (err: any) {
    mostrarToast(err.message || 'Error al cargar catálogos', 'error')
  } finally {
    loading.value = false
  }
}

// ============================================
// CRUD
// ============================================
const guardar = async () => {
  if (!form.nombre.trim()) {
    errorNombre.value = 'El nombre es requerido'
    return
  }

  guardando.value = true
  errorNombre.value = ''
  errorGeneral.value = ''

  const payload = {
    nombre: form.nombre.trim(),
    orden: form.orden || 0,
    activo: form.activo
  }

  try {
    if (editando.value) {
      if (tabActivo.value === 'senadores') {
        await updateSenador(editando.value._id, payload)
      } else {
        await updateComision(editando.value._id, payload)
      }
      mostrarToast('Actualizado correctamente')
    } else {
      if (tabActivo.value === 'senadores') {
        await createSenador(payload)
      } else {
        await createComision(payload)
      }
      mostrarToast('Creado correctamente')
    }

    resetForm()
    await cargarTodo()
  } catch (err: any) {
    if (err.message?.toLowerCase().includes('existe')) {
      errorNombre.value = err.message
    } else {
      errorGeneral.value = err.message || 'Error al guardar'
    }
  } finally {
    guardando.value = false
  }
}

const editar = (item: CatalogoItem) => {
  editando.value = item
  form.nombre = item.nombre
  form.orden = item.orden
  form.activo = item.activo
  errorNombre.value = ''
  errorGeneral.value = ''
}

const cancelar = () => {
  resetForm()
}

const confirmarEliminar = (item: CatalogoItem) => {
  itemAEliminar.value = item
  showDeleteModal.value = true
}

const eliminar = async () => {
  if (!itemAEliminar.value) return

  eliminando.value = true
  try {
    if (tabActivo.value === 'senadores') {
      await deleteSenador(itemAEliminar.value._id)
    } else {
      await deleteComision(itemAEliminar.value._id)
    }
    showDeleteModal.value = false
    mostrarToast('Eliminado correctamente')
    await cargarTodo()
  } catch (err: any) {
    mostrarToast(err.message || 'Error al eliminar', 'error')
  } finally {
    eliminando.value = false
    itemAEliminar.value = null
  }
}

// ============================================
// SEED
// ============================================
const importarBase = async () => {
  const hayDatos = senadores.value.length > 0 || comisiones.value.length > 0
  const mensaje = hayDatos
    ? '⚠️ Ya existen datos. ¿Reemplazar los catálogos actuales con los base?\n\nSe borrarán los actuales y se cargarán 36 senadores + 10 comisiones.'
    : '¿Importar 36 senadores + 10 comisiones base?'

  if (!confirm(mensaje)) return

  seeding.value = true
  try {
    const result = await seedCatalogos(hayDatos)
    mostrarToast(
      `Importado: ${result.senadores} senadores y ${result.comisiones} comisiones`,
      'success'
    )
    await cargarTodo()
  } catch (err: any) {
    mostrarToast(err.message || 'Error al importar', 'error')
  } finally {
    seeding.value = false
  }
}

// ============================================
// LIFECYCLE
// ============================================
onMounted(() => {
  cargarTodo()
})
</script>