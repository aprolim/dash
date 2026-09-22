<template>
  <div>
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin/auditoria" class="text-gray-400 hover:text-gray-600 text-2xl">
        ←
      </NuxtLink>
      <div class="flex-1">
        <h1 class="text-2xl font-semibold text-gray-900">
          Categorías - {{ moduloNombre }}
        </h1>
        <p class="text-sm text-gray-500 mt-1">Administra las categorías de este módulo</p>
      </div>
      <button
        @click="abrirModalCrear"
        class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        <span class="mr-2">+</span>
        Nueva Categoría
      </button>
    </div>

    <!-- Aviso -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
      💡 Las categorías organizan los documentos. <strong>No puedes eliminar una categoría con documentos activos</strong>.
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando categorías...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-800">{{ error }}</p>
      <button @click="loadCategorias" class="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm">
        Reintentar
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="categorias.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
      <div class="text-4xl mb-3">📁</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No hay categorías</h3>
      <p class="text-gray-500 mb-4">Crea la primera categoría para comenzar</p>
      <button
        @click="abrirModalCrear"
        class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        + Crear Categoría
      </button>
    </div>

    <!-- Grid de categorías -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="cat in categoriasOrdenadas"
        :key="cat._id"
        class="bg-white rounded-lg shadow p-5 border-2 transition-all"
        :class="cat.activo ? 'border-gray-100 hover:border-blue-300' : 'border-gray-200 opacity-60'"
      >
        <div class="flex items-start gap-4">
          <!-- Icono -->
          <div class="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
            <span v-html="cat.icono || '📄'"></span>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-lg font-semibold text-gray-900">{{ cat.nombre }}</h3>
              <span
                :class="cat.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
                class="px-2 py-0.5 rounded-full text-xs font-medium"
              >
                {{ cat.activo ? 'Activa' : 'Inactiva' }}
              </span>
            </div>
            <p class="text-xs text-gray-500 font-mono mb-2">ID: {{ cat.key }}</p>
            <p class="text-xs text-gray-600">
              📄 {{ cat.documentosCount || 0 }} documento{{ (cat.documentosCount || 0) !== 1 ? 's' : '' }}
            </p>
          </div>

          <!-- Acciones -->
          <div class="flex flex-col gap-1">
            <button
              @click="abrirModalEditar(cat)"
              class="p-2 text-gray-400 hover:text-blue-600 transition"
              title="Editar"
            >
              ✏️
            </button>
            <button
              @click="toggleActivo(cat)"
              class="p-2 text-gray-400 hover:text-gray-700 transition"
              :title="cat.activo ? 'Desactivar' : 'Activar'"
            >
              {{ cat.activo ? '⏸️' : '▶️' }}
            </button>
            <button
              @click="confirmDelete(cat)"
              class="p-2 text-gray-400 hover:text-red-600 transition"
              :disabled="(cat.documentosCount || 0) > 0"
              :class="{ 'opacity-30 cursor-not-allowed': (cat.documentosCount || 0) > 0 }"
              :title="(cat.documentosCount || 0) > 0 ? 'No se puede eliminar: tiene documentos' : 'Eliminar'"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <Modal v-model="showModal" :title="editando ? 'Editar Categoría' : 'Nueva Categoría'" size="lg">
      <form @submit.prevent="guardar" class="p-4 space-y-4">
        <div v-if="!editando">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Key (ID único) <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.key"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
            placeholder="ej: cumplimiento"
          />
          <p class="text-xs text-gray-500 mt-1">
            Solo letras minúsculas, números y guiones. No se puede cambiar después.
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.nombre"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Ej: Auditoría de Cumplimiento"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Icono (opcional)
          </label>
          <input
            v-model="form.icono"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
            placeholder="mdi:clipboard-check"
          />
          <p class="text-xs text-gray-500 mt-1">
            Usa un nombre de icono de Iconify (ej: mdi:file-document, mdi:cog)
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Orden</label>
          <input
            v-model.number="form.orden"
            type="number"
            min="0"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <p class="text-xs text-gray-500 mt-1">Menor número = aparece primero</p>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t">
          <button type="button" @click="showModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            <span v-if="saving" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Modal eliminación -->
    <Modal v-model="showDeleteModal" title="Confirmar eliminación" size="lg">
      <div class="p-4">
        <p class="text-gray-700">
          ¿Desactivar la categoría <strong>{{ catToDelete?.nombre }}</strong>?
        </p>
        <p class="text-sm text-gray-500 mt-2">
          Si tiene documentos, no se podrá eliminar. Se marcará como inactiva.
        </p>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showDeleteModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button
            @click="deleteCategoria"
            :disabled="deleting"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {{ deleting ? 'Eliminando...' : 'Desactivar' }}
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
import { useRoute } from 'vue-router'
import { useAuditoria, type AuditoriaCategoria, type ModuloAuditoria } from '~/composables/useAuditoria'
import Modal from '~/components/ui/Modal.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const route = useRoute()
const modulo = route.params.modulo as ModuloAuditoria

const { getCategorias, createCategoria, updateCategoria, deleteCategoria: deleteCategoriaApi } = useAuditoria()

// Estado
const categorias = ref<AuditoriaCategoria[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const saving = ref(false)

// Modal
const showModal = ref(false)
const editando = ref(false)
const categoriaEditando = ref<AuditoriaCategoria | null>(null)

const form = reactive({
  key: '',
  nombre: '',
  icono: 'mdi:file-document',
  orden: 0,
})

// Modal eliminar
const showDeleteModal = ref(false)
const catToDelete = ref<AuditoriaCategoria | null>(null)
const deleting = ref(false)

// Toast
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

// Computed
const moduloNombre = computed(() => {
  const nombres: Record<string, string> = {
    'auditorias-ejecutadas': 'Auditorías Ejecutadas',
    'informes-actividades': 'Informes de Actividades',
    'otras-actividades': 'Otras Actividades',
  }
  return nombres[modulo] || modulo
})

const categoriasOrdenadas = computed(() => {
  return [...categorias.value].sort((a, b) => a.orden - b.orden)
})

// Funciones
const mostrarToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => (toast.value.show = false), 3000)
}

const loadCategorias = async () => {
  loading.value = true
  error.value = null
  try {
    categorias.value = await getCategorias(modulo, true)
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const abrirModalCrear = () => {
  editando.value = false
  categoriaEditando.value = null
  form.key = ''
  form.nombre = ''
  form.icono = 'mdi:file-document'
  form.orden = 0
  showModal.value = true
}

const abrirModalEditar = (cat: AuditoriaCategoria) => {
  editando.value = true
  categoriaEditando.value = cat
  form.key = cat.key
  form.nombre = cat.nombre
  form.icono = cat.icono || 'mdi:file-document'
  form.orden = cat.orden
  showModal.value = true
}

const guardar = async () => {
  saving.value = true
  try {
    if (editando.value && categoriaEditando.value) {
      await updateCategoria(modulo, categoriaEditando.value.key, {
        nombre: form.nombre,
        icono: form.icono,
        orden: form.orden,
      })
      mostrarToast('Categoría actualizada')
    } else {
      await createCategoria(modulo, {
        key: form.key,
        nombre: form.nombre,
        icono: form.icono,
        orden: form.orden,
      })
      mostrarToast('Categoría creada')
    }
    showModal.value = false
    await loadCategorias()
  } catch (err: any) {
    mostrarToast(err.message, 'error')
  } finally {
    saving.value = false
  }
}

const toggleActivo = async (cat: AuditoriaCategoria) => {
  try {
    await updateCategoria(modulo, cat.key, { activo: !cat.activo })
    cat.activo = !cat.activo
    mostrarToast(cat.activo ? 'Categoría activada' : 'Categoría desactivada')
  } catch (err: any) {
    mostrarToast(err.message, 'error')
  }
}

const confirmDelete = (cat: AuditoriaCategoria) => {
  if ((cat.documentosCount || 0) > 0) {
    mostrarToast('No se puede eliminar: tiene documentos asociados', 'error')
    return
  }
  catToDelete.value = cat
  showDeleteModal.value = true
}

const deleteCategoria = async () => {
  if (!catToDelete.value) return
  deleting.value = true
  try {
    await deleteCategoriaApi(modulo, catToDelete.value.key)
    showDeleteModal.value = false
    mostrarToast('Categoría desactivada')
    await loadCategorias()
  } catch (err: any) {
    mostrarToast(err.message, 'error')
  } finally {
    deleting.value = false
    catToDelete.value = null
  }
}

onMounted(loadCategorias)
</script>