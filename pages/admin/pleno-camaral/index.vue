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
            v-if="s.tipo === 'suplente'"
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
          <div class="mt-3 flex gap-2">
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

      <div
        v-if="senadoresFiltrados.length === 0"
        class="col-span-full bg-white rounded-lg shadow p-12 text-center text-gray-500"
      >
        No hay senadores que coincidan con el filtro.
      </div>
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
import { usePlenoCamaral } from '~/composables/usePlenoCamaral'
import type { SenadorPleno, ResumenPleno } from '~/composables/usePlenoCamaral'
import { usePermissions } from '~/composables/usePermissions'

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

const { getSenadores, getResumen, uploadFoto, eliminarFoto } = usePlenoCamaral()
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
// FILTRO EN CLIENTE
// ============================================
const senadoresFiltrados = computed(() => {
  const q = filtroQ.value.trim().toLowerCase()

  return senadores.value.filter((s) => {
    if (tipoActivo.value === 'titular' && s.tipo !== 'titular') return false
    if (tipoActivo.value === 'suplente' && s.tipo !== 'suplente') return false
    if (soloSinFoto.value && s.foto) return false

    if (!q) return true
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.party || '').toLowerCase().includes(q) ||
      (s.partyShort || '').toLowerCase().includes(q) ||
      (s.department || '').toLowerCase().includes(q)
    )
  })
})

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
const onSelectFoto = async (event: Event, s: SenadorPleno) => {
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

  subiendo.value = s.id

  try {
    const result = await uploadFoto(s.id, file, 'titular')
    s.foto = result.url
    mostrarToast(`Foto actualizada: ${s.name}`)
    // Refrescar el resumen (contadores de "sin foto")
    getResumen().then((r) => (resumen.value = r)).catch(() => {})
  } catch (err: any) {
    mostrarToast(err.message || 'No se pudo subir la foto', 'error')
  } finally {
    subiendo.value = null
    target.value = ''
  }
}

const quitarFoto = async (s: SenadorPleno) => {
  const ok = window.confirm(
    `¿Quitar la foto de ${s.name}?\n\nEl archivo NO se borra del servidor, solo se deja de mostrar.`
  )
  if (!ok) return

  try {
    await eliminarFoto(s.id, 'titular')
    s.foto = ''
    mostrarToast('Foto quitada')
    getResumen().then((r) => (resumen.value = r)).catch(() => {})
  } catch (err: any) {
    mostrarToast(err.message || 'No se pudo quitar la foto', 'error')
  }
}

const cambiarTipo = (t: TipoFiltro) => {
  tipoActivo.value = t
}

onMounted(cargar)
</script>
