<!-- pages/admin/tipos-destinatario/index.vue -->
<template>
  <div>
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <div>
        <NuxtLink
          to="/admin/legislativos"
          class="text-gray-500 hover:text-gray-800 text-sm inline-flex items-center gap-1 font-medium"
        >
          ← Volver a Documentos Legislativos
        </NuxtLink>
        <p class="text-sm text-gray-500 mt-1">
          Catálogo editable de Tipos de Destinatario usados en los formularios legislativos
        </p>
      </div>

      <div class="flex gap-2">
        <button
          v-if="canSeed"
          @click="importarBase"
          :disabled="seeding"
          class="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 text-sm font-medium transition-colors"
        >
          <span v-if="seeding" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          🌱 Importar catálogo base
        </button>
      </div>
    </div>

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
                type="text"
                placeholder="Buscar tipo de destinatario…"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" v-model="incluirInactivos" @change="cargar" class="w-4 h-4" />
              Incluir inactivos
            </label>
          </div>

          <div v-if="loading" class="text-center py-12">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
            <p class="mt-3 text-gray-600 text-sm">Cargando...</p>
          </div>

          <div v-else-if="itemsFiltrados.length === 0" class="text-center py-12 text-gray-500">
            <div class="text-4xl mb-2">📋</div>
            <p class="text-sm font-medium">
              {{ filtro ? 'Sin resultados para tu búsqueda' : 'No hay tipos de destinatario' }}
            </p>
            <p v-if="!filtro" class="text-xs text-gray-400 mt-1">
              Usa el botón "Importar catálogo base" o crea uno nuevo desde el formulario.
            </p>
          </div>

          <div v-else class="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            <div
              v-for="item in itemsFiltrados"
              :key="item._id"
              class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              :class="{ 'opacity-50 bg-gray-50': !item.activo }"
            >
              <span class="text-lg">📋</span>
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
            {{ editando ? '✏ Editar' : '+ Nuevo' }} tipo de destinatario
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
                maxlength="150"
                placeholder="Ej: Órgano Ejecutivo"
                class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
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
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
              <p class="mt-1 text-xs text-gray-500">Menor número = aparece primero en el select</p>
            </div>

            <label class="flex items-center gap-2 text-sm cursor-pointer">
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
                class="flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="guardando || !form.nombre"
                class="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span v-if="guardando" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {{ guardando ? 'Guardando...' : (editando ? 'Guardar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de eliminación -->
    <Modal v-model="showDeleteModal" title="Confirmar eliminación" size="lg">
      <div class="p-2">
        <p class="text-gray-700">
          ¿Eliminar <strong>{{ itemAEliminar?.nombre }}</strong> del catálogo?
        </p>
        <p class="text-amber-600 text-sm mt-2">
          ⚠️ Los documentos existentes que usen este nombre NO se verán afectados
          (guardan el texto, no la referencia). Solo desaparecerá del selector.
        </p>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showDeleteModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            @click="eliminar"
            :disabled="eliminando"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <span v-if="eliminando" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ eliminando ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </Modal>

    <!-- Toast -->
    <div
      v-if="toast.show"
      class="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all"
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
  useTiposDestinatario,
  type TipoDestinatarioItem
} from '~/composables/useTiposDestinatario'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { can } = usePermissions()

const canEdit = computed(() => can('legislativos', 'edit'))
const canDelete = computed(() => can('legislativos', 'delete'))
const canSeed = computed(() => can('legislativos', 'create'))

const {
  getTiposDestinatario,
  createTipoDestinatario,
  updateTipoDestinatario,
  deleteTipoDestinatario,
  seedTiposDestinatario
} = useTiposDestinatario()

// ============================================
// ESTADO
// ============================================
const items = ref<TipoDestinatarioItem[]>([])
const loading = ref(false)
const incluirInactivos = ref(false)
const filtro = ref('')

const form = reactive({
  nombre: '',
  orden: 0,
  activo: true
})

const editando = ref<TipoDestinatarioItem | null>(null)
const guardando = ref(false)
const seeding = ref(false)
const errorNombre = ref('')
const errorGeneral = ref('')

const showDeleteModal = ref(false)
const itemAEliminar = ref<TipoDestinatarioItem | null>(null)
const eliminando = ref(false)

const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

// ============================================
// COMPUTED
// ============================================
const itemsFiltrados = computed(() => {
  const q = filtro.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter((i) => i.nombre.toLowerCase().includes(q))
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

// ============================================
// CARGA
// ============================================
const cargar = async () => {
  loading.value = true
  try {
    items.value = await getTiposDestinatario({
      incluirInactivos: incluirInactivos.value
    })
  } catch (err: any) {
    mostrarToast(err.message || 'Error al cargar catálogo', 'error')
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
      await updateTipoDestinatario(editando.value._id, payload)
      mostrarToast('Actualizado correctamente')
    } else {
      await createTipoDestinatario(payload)
      mostrarToast('Creado correctamente')
    }

    resetForm()
    await cargar()
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

const editar = (item: TipoDestinatarioItem) => {
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

const confirmarEliminar = (item: TipoDestinatarioItem) => {
  itemAEliminar.value = item
  showDeleteModal.value = true
}

const eliminar = async () => {
  if (!itemAEliminar.value) return

  eliminando.value = true
  try {
    await deleteTipoDestinatario(itemAEliminar.value._id)
    showDeleteModal.value = false
    mostrarToast('Eliminado correctamente')
    await cargar()
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
  const hayDatos = items.value.length > 0
  const mensaje = hayDatos
    ? '⚠️ Ya existen datos. ¿Reemplazar el catálogo actual con el base?\n\nSe borrarán los actuales y se cargarán 7 tipos de destinatario.'
    : '¿Importar el catálogo base de tipos de destinatario?'

  if (!confirm(mensaje)) return

  seeding.value = true
  try {
    const result = await seedTiposDestinatario(hayDatos)
    mostrarToast(
      `Importados ${result.tiposDestinatario} tipos de destinatario`,
      'success'
    )
    await cargar()
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
  cargar()
})
</script>