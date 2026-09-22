<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin/auditoria" class="text-gray-400 hover:text-gray-600 text-2xl">
        ←
      </NuxtLink>
      <div class="flex-1">
        <h1 class="text-2xl font-semibold text-gray-900">📄 POA - UAI</h1>
        <p class="text-sm text-gray-500 mt-1">Plan Operativo Anual Individual</p>
      </div>
      <NuxtLink
        to="/admin/auditoria/poa-uai/create"
        class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        <span class="mr-2">+</span>
        Nuevo POA
      </NuxtLink>
    </div>

    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-800">
      💡 <strong>Solo un POA puede estar activo a la vez.</strong> El activo se muestra destacado en el frontend.
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando POAs...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
      <button @click="loadPOAs" class="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm">
        Reintentar
      </button>
    </div>

    <div v-else-if="poas.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
      <div class="text-4xl mb-3">📭</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No hay POAs registrados</h3>
      <p class="text-gray-500 mb-4">Crea el primer POA para comenzar</p>
      <NuxtLink
        to="/admin/auditoria/poa-uai/create"
        class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        + Crear POA
      </NuxtLink>
    </div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Año</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activo</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PDF</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="poa in poasOrdenados"
            :key="poa._id"
            class="hover:bg-gray-50"
            :class="poa.activo ? 'bg-yellow-50' : ''"
          >
            <td class="px-6 py-4">
              <span class="text-lg font-bold text-senado-primary">{{ poa.anio }}</span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ poa.titulo }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ poa.fecha || '-' }}</td>
            <td class="px-6 py-4">
              <span :class="estadoClass(poa.estado)" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ poa.estado }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span v-if="poa.activo" class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                ⭐ VIGENTE
              </span>
              <span v-else class="text-xs text-gray-400">No</span>
            </td>
            <td class="px-6 py-4 text-sm">
              <a
                v-if="poa.pdfUrl"
                :href="poa.pdfUrl"
                target="_blank"
                class="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
              >
                📄 Ver PDF
              </a>
              <span v-else class="text-gray-300 text-xs">Sin PDF</span>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-end gap-2">
                <button
                  v-if="!poa.activo"
                  @click="activarPOA(poa)"
                  class="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 font-medium"
                  title="Marcar como vigente"
                >
                  ⭐ Activar
                </button>
                <button
                  v-else
                  @click="desactivarPOA(poa)"
                  class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium"
                  title="Quitar vigencia"
                >
                  Desactivar
                </button>
                <NuxtLink
                  :to="`/admin/auditoria/poa-uai/edit/${poa._id}`"
                  class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
                >
                  ✏ Editar
                </NuxtLink>
                <button
                  @click="confirmDelete(poa)"
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

    <Modal v-model="showDeleteModal" title="Confirmar eliminación" size="lg">
      <div class="p-4">
        <p class="text-gray-700">
          ¿Eliminar el POA <strong>{{ poaToDelete?.anio }} - {{ poaToDelete?.titulo }}</strong>?
        </p>
        <p class="text-red-600 text-sm mt-2">Esta acción no se puede deshacer.</p>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showDeleteModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button
            @click="deletePOA"
            :disabled="deleting"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </Modal>

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
import { useAuditoria, type AuditoriaPOA } from '~/composables/useAuditoria'
import Modal from '~/components/ui/Modal.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const { getPOAs, deletePOA: deletePOAApi, togglePOAActivo } = useAuditoria()

const poas = ref<AuditoriaPOA[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const showDeleteModal = ref(false)
const poaToDelete = ref<AuditoriaPOA | null>(null)
const deleting = ref(false)

const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

const poasOrdenados = computed(() => [...poas.value].sort((a, b) => b.anio - a.anio))

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

const loadPOAs = async () => {
  loading.value = true
  error.value = null
  try {
    poas.value = await getPOAs()
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const activarPOA = async (poa: AuditoriaPOA) => {
  try {
    await togglePOAActivo(poa._id, true)
    await loadPOAs()
    mostrarToast(`POA ${poa.anio} marcado como vigente`)
  } catch (err: any) {
    mostrarToast(err.message, 'error')
  }
}

const desactivarPOA = async (poa: AuditoriaPOA) => {
  if (
    !confirm(
      `¿Quitar la marca de vigente del POA ${poa.anio}?\n\nSi no hay otro POA activo, la página pública mostrará "Sin POA vigente".`
    )
  )
    return
  try {
    await togglePOAActivo(poa._id, false)
    await loadPOAs()
    mostrarToast('POA desactivado')
  } catch (err: any) {
    mostrarToast(err.message, 'error')
  }
}

const confirmDelete = (poa: AuditoriaPOA) => {
  poaToDelete.value = poa
  showDeleteModal.value = true
}

const deletePOA = async () => {
  if (!poaToDelete.value) return
  deleting.value = true
  try {
    await deletePOAApi(poaToDelete.value._id)
    showDeleteModal.value = false
    mostrarToast('POA eliminado')
    await loadPOAs()
  } catch (err: any) {
    mostrarToast(err.message, 'error')
  } finally {
    deleting.value = false
    poaToDelete.value = null
  }
}

onMounted(loadPOAs)
</script>