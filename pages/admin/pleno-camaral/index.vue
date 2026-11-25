<!-- pages/admin/pleno-camaral/index.vue -->
<template>
  <div>
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <p class="text-sm text-gray-600">
        Senadores que aparecen en el hemiciclo y en las secciones del portal público.
      </p>
    </div>

    <!-- Aviso solo lectura -->
    <div
      v-if="!canEdit"
      class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-800"
    >
      Estás como <strong>{{ roleLabel }}</strong>: podés consultar el pleno,
      pero no modificarlo.
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-gray-900">{{ resumen.titulares ?? '—' }}</div>
        <div class="text-xs text-gray-500 mt-1">Titulares</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-gray-900">{{ resumen.suplentes ?? '—' }}</div>
        <div class="text-xs text-gray-500 mt-1">Suplentes</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-amber-600">{{ resumen.sinFotoTitular ?? '—' }}</div>
        <div class="text-xs text-gray-500 mt-1">Titulares sin foto</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 text-center">
        <div class="text-2xl font-bold text-amber-600">{{ resumen.sinFotoSuplente ?? '—' }}</div>
        <div class="text-xs text-gray-500 mt-1">Suplentes sin foto</div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap gap-3 items-center">
      <div class="flex rounded-lg overflow-hidden border border-gray-300">
        <button
          v-for="t in TIPOS"
          :key="t.id"
          @click="cambiarTipo(t.id)"
          class="px-4 py-2 text-sm font-medium transition-colors"
          :class="tipoActivo === t.id
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'"
        >
          {{ t.label }}
        </button>
      </div>

      <div class="flex-1 min-w-[220px]">
        <input
          v-model="filtroQ"
          type="text"
          placeholder="Buscar por nombre, partido o departamento..."
          class="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>

      <label class="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" v-model="soloSinFoto" />
        Solo sin foto
      </label>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
      {{ error }}
    </div>

    <!-- Cargando -->
    <div v-if="loading" class="text-center py-12 text-gray-500">Cargando senadores...</div>

    <!-- ============================================ -->
    <!-- GRID DE SENADORES                            -->
    <!-- ============================================ -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <div
        v-for="s in senadoresFiltrados"
        :key="s._id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col"
      >
        <!-- Foto -->
        <div class="relative aspect-[3/4] bg-gray-100">
          <img
            v-if="fotoUrl(s.foto)"
            :src="fotoUrl(s.foto)"
            :alt="s.name"
            class="w-full h-full object-cover"
            @error="(e) => ((e.target as HTMLImageElement).style.opacity = '0.2')"
          />
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <span class="text-4xl">👤</span>
            <span class="text-xs mt-2">Sin foto</span>
          </div>

          <!-- Badge suplente -->
          <span
            v-if="esSuplente(s)"
            class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white"
          >SUPLENTE</span>

          <!-- Curul -->
          <span
            class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-gray-700"
          >#{{ s.seatNumber }}</span>
        </div>

        <!-- Datos -->
        <div class="p-3 flex-1 flex flex-col">
          <p class="text-sm font-semibold text-gray-900 leading-tight">{{ s.name }}</p>

          <!-- Contexto: a quién reemplaza este suplente -->
          <p v-if="esSuplente(s)" class="text-[11px] text-blue-700 mt-0.5 leading-tight">
            Suplente de <span class="font-medium">{{ s.titularDe }}</span>
          </p>

          <p class="text-xs text-gray-500 mt-1">
            <span
              class="inline-block px-1.5 py-0.5 rounded font-medium"
              :style="{
                backgroundColor: (s.partyColor || '#999') + '20',
                color: s.partyColor || '#666'
              }"
            >{{ s.partyShort || s.party }}</span>
            <span v-if="s.department" class="ml-1">{{ s.department }}</span>
          </p>

          <!-- Acciones -->
          <div class="mt-3 flex flex-col gap-2">
            <button
              v-if="canEdit"
              @click="abrirEdicion(s)"
              class="w-full px-2 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              ✏️ Editar datos
            </button>

            <div class="flex gap-2">
              <label
                v-if="canEdit"
                class="flex-1 text-center px-2 py-1.5 text-xs font-medium rounded-md border border-primary-200 text-primary-700 hover:bg-primary-50 cursor-pointer"
                :class="{ 'opacity-50 pointer-events-none': subiendo === s.id }"
              >
                {{ subiendo === s.id ? 'Subiendo...' : 'Cambiar foto' }}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  class="hidden"
                  @change="(e) => onSelectFoto(e, s)"
                />
              </label>
              <button
                v-if="canEdit && s.foto"
                @click="quitarFoto(s)"
                class="px-2 py-1.5 text-xs font-medium rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                title="Quitar foto"
              >✕</button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="senadoresFiltrados.length === 0"
        class="col-span-full bg-white rounded-lg shadow p-12 text-center text-gray-500"
      >
        No hay senadores que coincidan con el filtro.
      </div>
    </div>

    <!-- ============================================ -->
    <!-- MODAL DE EDICIÓN DE DATOS                    -->
    <!-- ============================================ -->
    <Teleport to="body">
      <div
        v-if="edicionAbierta"
        class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto"
        @click.self="cerrarEdicion"
      >
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
            <h2 class="text-lg font-bold text-gray-900">
              {{ esSuplenteEditando ? 'Editar datos del suplente' : 'Editar datos del senador' }}
            </h2>
            <button @click="cerrarEdicion" class="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
          </div>

          <div class="p-6">
            <SenadorEditForm
              v-if="senadorEditando"
              ref="editFormRef"
              :key="edicionKey"
              :senador="senadorEditando"
              :es-suplente="esSuplenteEditando"
              :titular-nombre="titularDeEditando"
              @submit="guardarEdicion"
              @cancelar="cerrarEdicion"
            />
          </div>
        </div>
      </div>
    </Teleport>

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
import { usePlenoCamaral } from '~/composables/usePlenoCamaral'
import type { SenadorPleno, ResumenPleno } from '~/composables/usePlenoCamaral'
import { usePermissions } from '~/composables/usePermissions'
import SenadorEditForm from '~/components/admin/SenadorEditForm.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

type TipoFiltro = 'todos' | 'titular' | 'suplente'

const TIPOS: { id: TipoFiltro; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'titular', label: 'Titulares' },
  { id: 'suplente', label: 'Suplentes' }
]

const { getSenadores, getResumen, uploadFoto, eliminarFoto, updateSenador } = usePlenoCamaral()
const { can, roleLabel } = usePermissions()

const canEdit = computed(() => can('pleno-camaral', 'edit'))

// ============================================
// ESTADO
// ============================================
const senadores = ref<SenadorPleno[]>([])
const resumen = ref<ResumenPleno>({} as ResumenPleno)

const loading = ref(true)
const error = ref('')

const tipoActivo = ref<TipoFiltro>('todos')
const filtroQ = ref('')
const soloSinFoto = ref(false)

const subiendo = ref<number | null>(null)

// --- Modal de edición de datos ---
const edicionAbierta = ref(false)
const senadorEditando = ref<SenadorPleno | null>(null)
const esSuplenteEditando = ref(false)
const titularDeEditando = ref('')
const edicionKey = ref(0)
const editFormRef = ref<any>(null)

const toast = reactive({ show: false, message: '', type: 'success' as 'success' | 'error' })

const mostrarToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 3500)
}

// ============================================
// IMÁGENES
// ============================================
const config = useRuntimeConfig()
const API_HOST = (config.public.apiUrl || 'https://demoback.senado.gob.bo/api')
  .replace(/\/api\/?$/, '')

const fotoUrl = (foto?: string) => {
  if (!foto) return ''
  if (/^https?:\/\//i.test(foto) || foto.startsWith('data:')) return foto
  return `${API_HOST}${foto.startsWith('/') ? '' : '/'}${foto}`
}

// ============================================
// SUPLENTES (derivados)
//
// ⚠️ En la base NO existen registros con tipo 'suplente': cada titular
// guarda los datos de su suplente en los campos `suplente`, `fotoSuplente`,
// etc. Por eso la lista de suplentes se construye a partir de los titulares.
//
// El `id` se mantiene como el del TITULAR, porque el endpoint de foto
// actualiza `fotoSuplente` sobre ese registro (destino='suplente').
// ============================================
interface SuplenteDerivado {
  id: number
  name: string
  foto: string
  party: string
  partyShort: string
  partyColor: string
  department: string
  seatNumber: number
  titularDe: string
  destino: 'suplente'
}

const suplentesDerivados = computed<SuplenteDerivado[]>(() =>
  senadores.value
    .filter((s) => s.tipo === 'titular' && (s.suplente || '').trim())
    .map((s) => ({
      id: s.id,
      name: (s.suplente || '').trim(),
      foto: s.fotoSuplente || '',
      party: s.party || '',
      partyShort: s.partyShort || '',
      partyColor: s.partyColor || '#999',
      department: s.department || '',
      seatNumber: s.seatNumber,
      titularDe: s.name,
      destino: 'suplente' as const
    }))
)

// ============================================
// FILA UNIFICADA PARA EL TEMPLATE
// Titulares y suplentes comparten la misma forma para que el v-for
// no tenga que distinguir tipos.
// ============================================
interface FilaPleno {
  id: number
  name: string
  foto: string
  party: string
  partyShort: string
  partyColor: string
  department: string
  seatNumber: number
  esSuplente: boolean
  titularDe: string
  destino: 'titular' | 'suplente'
}

const filasTitulares = computed<FilaPleno[]>(() =>
  senadores.value
    .filter((s) => s.tipo === 'titular')
    .map((s) => ({
      id: s.id,
      name: s.name,
      foto: s.foto || '',
      party: s.party || '',
      partyShort: s.partyShort || '',
      partyColor: s.partyColor || '#999',
      department: s.department || '',
      seatNumber: s.seatNumber,
      esSuplente: false,
      titularDe: '',
      destino: 'titular' as const
    }))
)

const filasSuplentes = computed<FilaPleno[]>(() =>
  suplentesDerivados.value.map((s) => ({
    ...s,
    esSuplente: true
  }))
)

// ============================================
// FILTRO EN CLIENTE
// ============================================
const senadoresFiltrados = computed<FilaPleno[]>(() => {
  const q = filtroQ.value.trim().toLowerCase()

  const base =
    tipoActivo.value === 'suplente'
      ? filasSuplentes.value
      : tipoActivo.value === 'titular'
        ? filasTitulares.value
        : [...filasTitulares.value, ...filasSuplentes.value]

  return base.filter((s) => {
    if (soloSinFoto.value && s.foto) return false
    if (!q) return true
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.titularDe || '').toLowerCase().includes(q) ||
      (s.party || '').toLowerCase().includes(q) ||
      (s.partyShort || '').toLowerCase().includes(q) ||
      (s.department || '').toLowerCase().includes(q)
    )
  })
})

// Helper del template
const esSuplente = (s: FilaPleno) => Boolean(s.esSuplente)

// ============================================
// CARGA
// ============================================
const cargar = async () => {
  loading.value = true
  error.value = ''
  try {
    const [lista, res] = await Promise.all([getSenadores(), getResumen()])
    senadores.value = lista
    resumen.value = res
  } catch (err: any) {
    console.error(err)
    error.value = err.message || 'Error al cargar los senadores'
  } finally {
    loading.value = false
  }
}

// ============================================
// FOTO
// ============================================
type FilaFoto = FilaPleno

const onSelectFoto = async (event: Event, s: FilaFoto) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    mostrarToast('Solo se permiten imágenes', 'error')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    mostrarToast('La imagen supera los 10 MB', 'error')
    return
  }

  // destino 'suplente' actualiza el campo fotoSuplente del titular
  const destino = s.destino === 'suplente' ? 'suplente' : 'titular'
  subiendo.value = s.id

  try {
    const result = await uploadFoto(s.id, file, destino)
    s.foto = result.url
    mostrarToast(`Foto actualizada: ${s.name}`)

    // Sincronizar el registro del titular para que el cambio se refleje
    // al cambiar de pestaña sin recargar.
    const titular = senadores.value.find((x) => x.id === s.id)
    if (titular) {
      if (destino === 'suplente') titular.fotoSuplente = result.url
      else titular.foto = result.url
    }

    getResumen().then((r) => (resumen.value = r)).catch(() => {})
  } catch (err: any) {
    mostrarToast(err.message || 'No se pudo subir la foto', 'error')
  } finally {
    subiendo.value = null
    target.value = ''
  }
}

const quitarFoto = async (s: FilaFoto) => {
  const destino = s.destino === 'suplente' ? 'suplente' : 'titular'
  const ok = window.confirm(
    `¿Quitar la foto de ${s.name}?\n\nEl archivo NO se borra del servidor, solo se deja de mostrar.`
  )
  if (!ok) return

  try {
    await eliminarFoto(s.id, destino)
    s.foto = ''
    const titular = senadores.value.find((x) => x.id === s.id)
    if (titular) {
      if (destino === 'suplente') titular.fotoSuplente = ''
      else titular.foto = ''
    }
    mostrarToast('Foto quitada')
    getResumen().then((r) => (resumen.value = r)).catch(() => {})
  } catch (err: any) {
    mostrarToast(err.message || 'No se pudo quitar la foto', 'error')
  }
}

const cambiarTipo = (t: TipoFiltro) => {
  tipoActivo.value = t
}

// ============================================
// MODAL DE EDICIÓN DE DATOS
// ============================================
/**
 * Abre el formulario.
 * - En la pestaña de suplentes se editan los campos *Suplente del titular.
 * - En cualquier otra, los campos del titular.
 */
const abrirEdicion = (s: FilaPleno) => {
  const titular = senadores.value.find((x) => x.id === s.id)
  if (!titular) {
    mostrarToast('No se encontró el registro del senador', 'error')
    return
  }

  senadorEditando.value = titular
  esSuplenteEditando.value = Boolean(s.esSuplente)
  titularDeEditando.value = s.esSuplente ? (s.titularDe || titular.name) : ''
  edicionKey.value += 1
  edicionAbierta.value = true
}

const cerrarEdicion = () => {
  edicionAbierta.value = false
  senadorEditando.value = null
  esSuplenteEditando.value = false
  titularDeEditando.value = ''
}

const guardarEdicion = async (payload: Record<string, any>) => {
  const s = senadorEditando.value
  if (!s) return

  try {
    await updateSenador(s.id, payload)

    // Refrescar la tarjeta sin recargar toda la lista
    if (esSuplenteEditando.value) {
      // Solo se tocaron campos del suplente
      s.suplente = payload.suplente
    } else {
      // Campos del titular (incluidos sus proyectos de ley)
      Object.assign(s, payload)
      s.name = payload.name
    }

    mostrarToast(
      esSuplenteEditando.value
        ? 'Datos del suplente actualizados'
        : 'Datos del senador actualizados'
    )
    cerrarEdicion()
  } catch (err: any) {
    editFormRef.value?.setSaving(false)
    editFormRef.value?.setError(err.message || 'No se pudo guardar')
  }
}

onMounted(cargar)
</script>
