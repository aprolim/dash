<!-- components/admin/ComisionForm.vue -->
<template>
  <form @submit.prevent="enviar" class="space-y-6 max-w-4xl">

    <!-- Error general -->
    <div v-if="serverError" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
      {{ serverError }}
    </div>

    <!-- ============================================ -->
    <!-- DATOS DE LA COMISIÓN                         -->
    <!-- ============================================ -->
    <section class="bg-white rounded-lg shadow-sm p-5">
      <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">
        Datos de la comisión
      </h3>

      <div class="space-y-4">
        <!-- Nombre -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la comisión <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.nombre"
            type="text"
            placeholder="Ej: Comisión de Constitución, Derechos Humanos, Legislación y Sistema Electoral"
            class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            :class="{ 'border-red-400': errores.nombre }"
          />
          <p v-if="errores.nombre" class="text-xs text-red-600 mt-1">{{ errores.nombre }}</p>
        </div>

        <!-- Presidente -->
        <SenadorSelector
          v-model="form.presidenteId"
          label="Presidente de la comisión"
          :senadores="senadores"
          required
          :error="errores.presidenteId"
        />
      </div>
    </section>

    <!-- ============================================ -->
    <!-- COMITÉS                                      -->
    <!-- ============================================ -->
    <section class="bg-white rounded-lg shadow-sm p-5">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide">
            Comités <span class="text-red-500">*</span>
          </h3>
          <p class="text-xs text-gray-500 mt-1">
            Cada comité tiene un secretario. Mínimo uno.
          </p>
        </div>
        <button
          type="button"
          @click="agregarComite"
          class="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <span>+</span> Añadir comité
        </button>
      </div>

      <p v-if="errores.comites" class="text-xs text-red-600 mb-3">{{ errores.comites }}</p>

      <div class="space-y-4">
        <div
          v-for="(comite, idx) in form.comites"
          :key="comite.uid"
          class="border border-gray-200 rounded-lg p-4 bg-gray-50 relative"
        >
          <div class="flex items-start gap-3">
            <div class="flex-1 space-y-3">
              <!-- Nombre del comité -->
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">
                  Nombre del comité {{ idx + 1 }} <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="comite.nombre"
                  type="text"
                  placeholder="Ej: COMITÉ DE CONSTITUCIÓN, LEGISLACIÓN E INTERPRETACIÓN..."
                  class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  :class="{ 'border-red-400': erroresComite[idx]?.nombre }"
                />
                <p v-if="erroresComite[idx]?.nombre" class="text-xs text-red-600 mt-1">
                  {{ erroresComite[idx].nombre }}
                </p>
              </div>

              <!-- Secretario -->
              <SenadorSelector
                v-model="comite.secretarioId"
                :label="`Secretario del comité ${idx + 1}`"
                :senadores="senadores"
                required
                :error="erroresComite[idx]?.secretarioId"
              />
            </div>

            <!-- Quitar -->
            <button
              type="button"
              @click="quitarComite(idx)"
              :disabled="form.comites.length === 1"
              class="mt-6 text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              title="Quitar comité"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- ACCIONES                                     -->
    <!-- ============================================ -->
    <div class="flex justify-end gap-3">
      <NuxtLink
        to="/admin/comisiones-comites"
        class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Cancelar
      </NuxtLink>
      <button
        type="submit"
        :disabled="saving"
        class="px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
      >
        {{ saving ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Crear comisión') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { ComisionAdmin, SaveComisionPayload } from '~/composables/useComisionesComites'
import type { SenadorTitular } from '~/composables/useDirectiva'
import SenadorSelector from './SenadorSelector.vue'

const props = defineProps<{
  comision?: ComisionAdmin | null
  senadores: SenadorTitular[]
}>()

const emit = defineEmits<{
  (e: 'submit', payload: SaveComisionPayload): void
}>()

const esEdicion = computed(() => Boolean(props.comision?._id))

// Identificador interno estable para el v-for (evita que Vue reutilice
// el DOM de un comité por otro y se pierdan el foco o los valores).
let uidSeq = 0
const nuevoUid = () => `comite-${++uidSeq}`

type ComiteForm = { uid: string; nombre: string; secretarioId: number }

const form = reactive({
  nombre: props.comision?.nombre || '',
  presidenteId: props.comision?.presidenteId || 0,
  comites: (props.comision?.comites && props.comision.comites.length > 0
    ? props.comision.comites.map((c) => ({
        uid: nuevoUid(),
        nombre: c.nombre || '',
        secretarioId: c.secretarioId || 0
      }))
    : [{ uid: nuevoUid(), nombre: '', secretarioId: 0 }]
  ) as ComiteForm[]
})

const saving = ref(false)
const serverError = ref('')
const errores = reactive<Record<string, string>>({})
const erroresComite = ref<Record<number, { nombre?: string; secretarioId?: string }>>({})

// ============================================
// GESTIÓN DE COMITÉS
// ============================================
const agregarComite = () => {
  form.comites.push({ uid: nuevoUid(), nombre: '', secretarioId: 0 })
}

const quitarComite = (idx: number) => {
  if (form.comites.length === 1) return
  form.comites.splice(idx, 1)
  erroresComite.value = {}
}

// ============================================
// VALIDACIÓN
// ============================================
const validar = (): boolean => {
  Object.keys(errores).forEach((k) => delete errores[k])
  erroresComite.value = {}
  serverError.value = ''

  if (!form.nombre.trim()) {
    errores.nombre = 'El nombre de la comisión es obligatorio'
  }

  if (!form.presidenteId) {
    errores.presidenteId = 'Seleccioná un presidente'
  }

  if (form.comites.length === 0) {
    errores.comites = 'La comisión debe tener al menos un comité'
  }

  // Validar cada comité
  const errsComite: Record<number, { nombre?: string; secretarioId?: string }> = {}

  form.comites.forEach((c, idx) => {
    const e: { nombre?: string; secretarioId?: string } = {}
    if (!c.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!c.secretarioId) e.secretarioId = 'Seleccioná un secretario'
    if (Object.keys(e).length > 0) errsComite[idx] = e
  })

  if (Object.keys(errsComite).length > 0) {
    erroresComite.value = errsComite
  } else {
    // Un senador no puede repetirse en la misma comisión
    const ids = [form.presidenteId, ...form.comites.map((c) => c.secretarioId)].filter(Boolean)
    if (new Set(ids).size !== ids.length) {
      errores.comites = 'Un senador no puede ocupar dos cargos en la misma comisión'
    }
  }

  const hayErrores =
    Object.keys(errores).length > 0 || Object.keys(erroresComite.value).length > 0

  if (hayErrores && !serverError.value) {
    serverError.value = 'Revisá los campos marcados en rojo'
  }

  return !hayErrores
}

// ============================================
// ENVÍO
// ============================================
const enviar = () => {
  if (!validar()) return

  saving.value = true

  emit('submit', {
    nombre: form.nombre.trim(),
    presidenteId: form.presidenteId,
    comites: form.comites.map((c) => ({
      nombre: c.nombre.trim(),
      secretarioId: c.secretarioId
    }))
  })
}

defineExpose({
  setSaving: (v: boolean) => (saving.value = v),
  setError: (m: string) => (serverError.value = m)
})
</script>
