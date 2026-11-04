<!-- components/admin/DirectivaEditor.vue -->
<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">👥 Directiva Camaral</h2>
        <p class="text-sm text-gray-500 mt-1">
          Define quién ocupa cada cargo en la directiva actual
        </p>
      </div>
      <div class="flex gap-2">
        <button
          v-if="directiva?.esHardcoded"
          @click="importarBase"
          :disabled="seeding"
          class="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
        >
          <span v-if="seeding" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          🌱 Importar base
        </button>
        <button
          @click="cargar"
          :disabled="loading"
          class="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          🔄 Recargar
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-3 text-gray-600 text-sm">Cargando directiva...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800 text-sm">{{ error }}</p>
      <button @click="cargar" class="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm">
        Reintentar
      </button>
    </div>

    <form v-else @submit.prevent="guardar" class="space-y-6">
      <div v-if="directiva?.esHardcoded" class="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p class="text-sm text-amber-800">
          <strong>⚠️ Directiva no inicializada.</strong>
          Se están usando valores por defecto. Usa "Importar base" o guarda para crear el registro.
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Gestión <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.gestion"
          type="text"
          required
          maxlength="20"
          placeholder="Ej: 2025-2026"
          class="w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
        />
        <p class="mt-1 text-xs text-gray-500">Formato: AAAA-AAAA o AAAA</p>
      </div>

      <div class="border-t pt-4">
        <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">🏛️ Presidencia</h3>
        <SenadorSelector
          v-model="form.presidenteId"
          label="Presidente / Presidenta"
          :senadores="titulares"
          required
          :error="errores.presidenteId"
        />
      </div>

      <div class="border-t pt-4">
        <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">⚖️ Vicepresidencias</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SenadorSelector
            v-model="form.primeraViceId"
            label="Primera Vicepresidencia"
            :senadores="titulares"
            required
            :error="errores.primeraViceId"
          />
          <SenadorSelector
            v-model="form.segundaViceId"
            label="Segunda Vicepresidencia"
            :senadores="titulares"
            required
            :error="errores.segundaViceId"
          />
        </div>
      </div>

      <div class="border-t pt-4">
        <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">📋 Secretarías</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SenadorSelector
            v-model="form.primeraSecretariaId"
            label="Primera Secretaría"
            :senadores="titulares"
            required
            :error="errores.primeraSecretariaId"
          />
          <SenadorSelector
            v-model="form.segundaSecretariaId"
            label="Segunda Secretaría"
            :senadores="titulares"
            required
            :error="errores.segundaSecretariaId"
          />
          <SenadorSelector
            v-model="form.terceraSecretariaId"
            label="Tercera Secretaría"
            :senadores="titulares"
            required
            :error="errores.terceraSecretariaId"
          />
        </div>
      </div>

      <div v-if="errorGeneral" class="bg-red-50 border border-red-200 rounded-lg p-3">
        <p class="text-sm text-red-800">{{ errorGeneral }}</p>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          @click="cargar"
          :disabled="saving"
          class="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
        >
          Descartar cambios
        </button>
        <button
          type="submit"
          :disabled="saving || !formularioValido"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm flex items-center gap-2"
        >
          <span v-if="saving" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ saving ? 'Guardando...' : 'Guardar directiva' }}
        </button>
      </div>
    </form>

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
import {
  useDirectiva,
  type DirectivaAdmin,
  type SenadorTitular,
} from '~/composables/useDirectiva'
import SenadorSelector from './SenadorSelector.vue'

const {
  getDirectivaAdmin,
  getTitularesDisponibles,
  saveDirectiva,
  seedDirectiva,
} = useDirectiva()

const loading = ref(true)
const saving = ref(false)
const seeding = ref(false)
const error = ref<string | null>(null)
const errorGeneral = ref('')
const directiva = ref<DirectivaAdmin | null>(null)
const titulares = ref<SenadorTitular[]>([])

const form = reactive({
  gestion: '2025-2026',
  presidenteId: 0,
  primeraViceId: 0,
  segundaViceId: 0,
  primeraSecretariaId: 0,
  segundaSecretariaId: 0,
  terceraSecretariaId: 0,
})

const errores = reactive<Record<string, string>>({})
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

const formularioValido = computed(() => {
  return (
    form.gestion.trim() &&
    form.presidenteId > 0 &&
    form.primeraViceId > 0 &&
    form.segundaViceId > 0 &&
    form.primeraSecretariaId > 0 &&
    form.segundaSecretariaId > 0 &&
    form.terceraSecretariaId > 0
  )
})

const mostrarToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => (toast.value.show = false), 3500)
}

const validar = (): boolean => {
  Object.keys(errores).forEach((k) => delete errores[k])
  errorGeneral.value = ''

  if (!form.gestion.trim()) {
    errorGeneral.value = 'La gestión es requerida'
    return false
  }

  const campos = [
    { key: 'presidenteId', label: 'Presidente' },
    { key: 'primeraViceId', label: 'Primera Vicepresidencia' },
    { key: 'segundaViceId', label: 'Segunda Vicepresidencia' },
    { key: 'primeraSecretariaId', label: 'Primera Secretaría' },
    { key: 'segundaSecretariaId', label: 'Segunda Secretaría' },
    { key: 'terceraSecretariaId', label: 'Tercera Secretaría' },
  ] as const

  let ok = true
  for (const c of campos) {
    if (!form[c.key] || form[c.key] <= 0) {
      errores[c.key] = `${c.label} es requerido`
      ok = false
    }
  }

  const ids = [
    form.presidenteId,
    form.primeraViceId,
    form.segundaViceId,
    form.primeraSecretariaId,
    form.segundaSecretariaId,
    form.terceraSecretariaId,
  ].filter((id) => id > 0)

  const unicos = new Set(ids)
  if (unicos.size !== ids.length) {
    errorGeneral.value = 'Un senador no puede ocupar dos cargos en la directiva'
    ok = false
  }

  return ok
}

const cargar = async () => {
  loading.value = true
  error.value = null
  try {
    const [dir, tits] = await Promise.all([
      getDirectivaAdmin(),
      getTitularesDisponibles(),
    ])
    directiva.value = dir
    titulares.value = tits

    form.gestion = dir.gestion || '2025-2026'
    form.presidenteId = dir.presidenteId || 0
    form.primeraViceId = dir.primeraViceId || 0
    form.segundaViceId = dir.segundaViceId || 0
    form.primeraSecretariaId = dir.primeraSecretariaId || 0
    form.segundaSecretariaId = dir.segundaSecretariaId || 0
    form.terceraSecretariaId = dir.terceraSecretariaId || 0
  } catch (err: any) {
    error.value = err.message || 'Error al cargar la directiva'
  } finally {
    loading.value = false
  }
}

const guardar = async () => {
  if (!validar()) return

  saving.value = true
  try {
    await saveDirectiva({
      gestion: form.gestion.trim(),
      presidenteId: form.presidenteId,
      primeraViceId: form.primeraViceId,
      segundaViceId: form.segundaViceId,
      primeraSecretariaId: form.primeraSecretariaId,
      segundaSecretariaId: form.segundaSecretariaId,
      terceraSecretariaId: form.terceraSecretariaId,
    })
    mostrarToast('Directiva guardada correctamente')
    await cargar()
  } catch (err: any) {
    errorGeneral.value = err.message || 'Error al guardar'
    mostrarToast(err.message || 'Error al guardar', 'error')
  } finally {
    saving.value = false
  }
}

const importarBase = async () => {
  if (!confirm('¿Importar la directiva base (valores por defecto)?')) return

  seeding.value = true
  try {
    await seedDirectiva()
    mostrarToast('Directiva base importada')
    await cargar()
  } catch (err: any) {
    mostrarToast(err.message || 'Error al importar', 'error')
  } finally {
    seeding.value = false
  }
}

onMounted(cargar)
</script>