<!-- pages/admin/comisiones-comites/index.vue -->
<template>
  <div>
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <p class="text-sm text-gray-600">
        Estas comisiones se muestran en
        <a
          href="https://senado.gob.bo/comisiones-comites"
          target="_blank"
          class="text-primary-600 hover:underline"
        >senado.gob.bo/comisiones-comites</a>
      </p>
      <button
        v-if="canCreate"
        @click="abrirCrear"
        class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
      >
        <span class="mr-2">+</span> Nueva comisión
      </button>
    </div>

    <!-- Aviso de solo lectura -->
    <div
      v-if="!canEdit"
      class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-800"
    >
      Estás como <strong>{{ roleLabel }}</strong>: podés consultar las comisiones,
      pero no modificarlas.
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-gray-900">{{ comisiones.length }}</div>
        <div class="text-xs text-gray-500 mt-1">Comisiones</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-blue-600">{{ totalComites }}</div>
        <div class="text-xs text-gray-500 mt-1">Comités</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-green-600">{{ totalCargos }}</div>
        <div class="text-xs text-gray-500 mt-1">Cargos asignados</div>
      </div>
    </div>

    <!-- Buscador -->
    <div class="bg-gray-50 p-4 rounded-lg mb-6">
      <input
        v-model="filtro"
        type="text"
        placeholder="Buscar comisión o comité..."
        class="w-full px-3 py-2 border rounded-lg text-sm"
      />
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
      {{ error }}
    </div>

    <!-- Cargando -->
    <div v-if="loading" class="text-center py-12 text-gray-500">Cargando comisiones...</div>

    <!-- ============================================ -->
    <!-- LISTADO                                      -->
    <!-- ============================================ -->
    <div v-else class="space-y-4">
      <div
        v-for="comision in comisionesFiltradas"
        :key="comision._id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <!-- Cabecera de la comisión -->
        <div class="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-gray-900">{{ comision.nombre }}</h3>
            <p class="text-xs text-gray-500 mt-1">
              {{ (comision.comites || []).length }} comité{{ (comision.comites || []).length === 1 ? '' : 's' }}
            </p>
          </div>
          <div class="flex gap-2 shrink-0">
            <button
              v-if="canEdit"
              @click="abrirEditar(comision)"
              class="px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-800 border border-primary-200 rounded-md hover:bg-primary-50"
            >
              Editar
            </button>
            <button
              v-if="canDelete"
              @click="eliminar(comision)"
              class="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 border border-red-200 rounded-md hover:bg-red-50"
            >
              Eliminar
            </button>
          </div>
        </div>

        <!-- Presidente -->
        <div class="px-5 py-4 border-b border-gray-100">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Presidente</p>
          <PersonaRow
            :persona="getSenador(comision.presidenteId)"
            :persona-id="comision.presidenteId"
            etiqueta="Presidente de comisión"
          />
        </div>

        <!-- Comités -->
        <div class="px-5 py-4">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Comités</p>
          <div class="space-y-3">
            <div
              v-for="(comite, idx) in comision.comites"
              :key="idx"
              class="flex flex-col md:flex-row md:items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800">{{ comite.nombre }}</p>
              </div>
              <div class="md:w-80 shrink-0">
                <PersonaRow
                  :persona="getSenador(comite.secretarioId)"
                  :persona-id="comite.secretarioId"
                  etiqueta="Secretario de comité"
                  compact
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="comisionesFiltradas.length === 0" class="bg-white rounded-lg shadow p-12 text-center text-gray-500">
        <template v-if="comisiones.length === 0">
          No hay comisiones registradas.
          <button @click="abrirCrear" class="text-primary-600 hover:underline ml-1">Crear la primera</button>
        </template>
        <template v-else>
          Ninguna comisión coincide con "{{ filtro }}".
        </template>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- MODAL CREAR / EDITAR                         -->
    <!-- ============================================ -->
    <Teleport to="body">
      <div
        v-if="modalAbierto"
        class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto"
        @click.self="cerrarModal"
      >
        <div class="bg-gray-100 rounded-xl shadow-2xl w-full max-w-4xl my-8">
          <!-- Cabecera del modal -->
          <div class="flex items-center justify-between px-6 py-4 bg-white rounded-t-xl border-b border-gray-200 sticky top-0 z-10">
            <h2 class="text-lg font-bold text-gray-900">
              {{ comisionEditando ? 'Editar comisión' : 'Nueva comisión' }}
            </h2>
            <button @click="cerrarModal" class="text-gray-400 hover:text-gray-700 text-2xl leading-none">
              ×
            </button>
          </div>

          <!-- Formulario -->
          <div class="p-6">
            <ComisionForm
              ref="formRef"
              :key="claveFormulario"
              :comision="comisionEditando"
              :senadores="titulares"
              @submit="guardar"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <div
      v-if="toast.show"
      class="fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-lg shadow-lg text-white"
      :class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useComisionesComites } from '~/composables/useComisionesComites'
import { useDirectiva } from '~/composables/useDirectiva'
import type { ComisionAdmin, SaveComisionPayload } from '~/composables/useComisionesComites'
import type { SenadorTitular } from '~/composables/useDirectiva'
import ComisionForm from '~/components/admin/ComisionForm.vue'
import PersonaRow from '~/components/admin/PersonaRow.vue'
import { usePermissions } from '~/composables/usePermissions'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { getComisiones, createComision, updateComision, deleteComision } = useComisionesComites()
const { getTitularesDisponibles } = useDirectiva()

const { can, roleLabel } = usePermissions()
const canCreate = computed(() => can('comisiones-comites', 'create'))
const canEdit = computed(() => can('comisiones-comites', 'edit'))
const canDelete = computed(() => can('comisiones-comites', 'delete'))

const comisiones = ref<ComisionAdmin[]>([])
const titulares = ref<SenadorTitular[]>([])
const loading = ref(true)
const error = ref('')
const filtro = ref('')

const modalAbierto = ref(false)
const comisionEditando = ref<ComisionAdmin | null>(null)
const formRef = ref<any>(null)

// Cambia cada vez que se abre el modal para que el formulario se recree
// y nunca muestre datos de la comisión anterior.
const claveFormulario = ref(0)

const toast = reactive({ show: false, message: '', type: 'success' as 'success' | 'error' })

const mostrarToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 3500)
}

// ============================================
// COMPUTED
// ============================================
const getSenador = (id: number) => titulares.value.find((s) => s.id === id) || null

const totalComites = computed(() =>
  comisiones.value.reduce((n, c) => n + (c.comites || []).length, 0)
)
const totalCargos = computed(() => totalComites.value + comisiones.value.length)

const comisionesFiltradas = computed(() => {
  const q = filtro.value.trim().toLowerCase()
  if (!q) return comisiones.value

  return comisiones.value.filter((c) => {
    if ((c.nombre || '').toLowerCase().includes(q)) return true
    return (c.comites || []).some((co) => (co.nombre || '').toLowerCase().includes(q))
  })
})

// ============================================
// CARGA
// ============================================
const cargar = async () => {
  loading.value = true
  error.value = ''
  try {
    const [coms, tits] = await Promise.all([getComisiones(), getTitularesDisponibles()])
    comisiones.value = coms
    titulares.value = tits
  } catch (err: any) {
    console.error(err)
    error.value = err.message || 'Error al cargar las comisiones'
  } finally {
    loading.value = false
  }
}

// ============================================
// MODAL
// ============================================
const abrirCrear = () => {
  comisionEditando.value = null
  claveFormulario.value += 1
  modalAbierto.value = true
}

const abrirEditar = (comision: ComisionAdmin) => {
  comisionEditando.value = comision
  claveFormulario.value += 1
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
  comisionEditando.value = null
}

// ============================================
// GUARDAR
// ============================================
const guardar = async (payload: SaveComisionPayload) => {
  try {
    if (comisionEditando.value) {
      await updateComision(comisionEditando.value._id, payload)
      mostrarToast('Comisión actualizada')
    } else {
      await createComision(payload)
      mostrarToast('Comisión creada')
    }

    cerrarModal()
    await cargar()
  } catch (err: any) {
    formRef.value?.setSaving(false)
    formRef.value?.setError(err.message || 'Error al guardar la comisión')
  }
}

// ============================================
// ELIMINAR
// ============================================
const eliminar = async (comision: ComisionAdmin) => {
  const ok = window.confirm(
    `¿Eliminar la comisión?\n\n"${comision.nombre}"\n\n` +
    `Se eliminarán también sus ${(comision.comites || []).length} comité(s). Esta acción no se puede deshacer.`
  )
  if (!ok) return

  try {
    await deleteComision(comision._id)
    mostrarToast('Comisión eliminada')
    await cargar()
  } catch (err: any) {
    mostrarToast(err.message || 'No se pudo eliminar la comisión', 'error')
  }
}

onMounted(cargar)
</script>
