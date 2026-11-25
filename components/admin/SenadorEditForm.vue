<!-- components/admin/SenadorEditForm.vue -->
<template>
  <form @submit.prevent="enviar" class="space-y-6">

    <!-- Error general -->
    <div v-if="serverError" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
      {{ serverError }}
    </div>

    <!-- Aviso: qué se está editando -->
    <div
      v-if="esSuplente"
      class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900"
    >
      Editando los datos de <strong>suplente</strong> de
      <strong>{{ titularNombre }}</strong>.
      La foto se cambia desde el listado.
    </div>

    <!-- ============================================ -->
    <!-- DATOS PRINCIPALES                            -->
    <!-- ============================================ -->
    <section>
      <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
        Datos principales
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            :class="{ 'border-red-400': errores.name }"
          />
          <p v-if="errores.name" class="text-xs text-red-600 mt-1">{{ errores.name }}</p>
        </div>

        <!-- Solo titular -->
        <template v-if="!esSuplente">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Partido / Alianza</label>
            <input
              v-model="form.party"
              type="text"
              placeholder="Partido Demócrata Cristiano"
              class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sigla</label>
            <input
              v-model="form.partyShort"
              type="text"
              placeholder="PDC"
              class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Color del partido</label>
            <div class="flex gap-2 items-center">
              <input
                v-model="form.partyColor"
                type="color"
                class="h-10 w-16 border rounded cursor-pointer"
              />
              <input
                v-model="form.partyColor"
                type="text"
                placeholder="#2E7078"
                class="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
            <input
              v-model="form.department"
              type="text"
              placeholder="La Paz"
              class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
            <input
              v-model="form.cargo"
              type="text"
              placeholder="Senador"
              class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              v-model="form.estado"
              class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="suspendido">Suspendido</option>
              <option value="licencia">Licencia</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Comisión</label>
            <input
              v-model="form.comision"
              type="text"
              class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Comité</label>
            <input
              v-model="form.comite"
              type="text"
              class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </template>

        <!-- Solo suplente -->
        <template v-else>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cargo del suplente</label>
            <input
              v-model="form.cargoSuplente"
              type="text"
              placeholder="Senador Suplente"
              class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Comité del suplente</label>
            <input
              v-model="form.comiteSuplente"
              type="text"
              class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </template>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- INFORMACIÓN PERSONAL                         -->
    <!-- ============================================ -->
    <section>
      <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
        Información personal
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <template v-if="!esSuplente">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
            <input
              v-model="form.fechaNacimiento"
              type="text"
              placeholder="3 de octubre, 1985"
              class="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nacido en</label>
            <input
              v-model="form.nacidoEn"
              type="text"
              placeholder="Cochabamba - Chapare - Palca"
              class="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ocupación</label>
            <input
              v-model="form.ocupacion"
              type="text"
              class="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </template>

        <template v-else>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
            <input
              v-model="form.fechaNacimientoSuplente"
              type="text"
              class="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nacido en</label>
            <input
              v-model="form.nacidoEnSuplente"
              type="text"
              class="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ocupación</label>
            <input
              v-model="form.ocupacionSuplente"
              type="text"
              class="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </template>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- REDES SOCIALES                               -->
    <!-- ============================================ -->
    <section>
      <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
        Redes sociales
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <template v-if="!esSuplente">
          <div v-for="red in REDES" :key="red.key">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ red.label }}</label>
            <input
              v-model="form[red.key]"
              type="url"
              :placeholder="red.placeholder"
              class="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </template>

        <template v-else>
          <div v-for="red in REDES" :key="red.key">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ red.label }}</label>
            <input
              v-model="form[red.keySuplente]"
              type="url"
              :placeholder="red.placeholder"
              class="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </template>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- 📜 PROYECTOS DE LEY DESTACADOS               -->
    <!-- (solo titulares)                             -->
    <!-- ============================================ -->
    <section v-if="!esSuplente">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide">
          Proyectos de ley destacados
        </h3>
        <button
          type="button"
          @click="agregarProyecto"
          class="px-3 py-1.5 text-xs font-medium rounded-md border border-primary-200 text-primary-700 hover:bg-primary-50"
        >
          + Añadir proyecto
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Total de proyectos presentados
          </label>
          <input
            v-model.number="form.proyectosLeyCantidad"
            type="number"
            min="0"
            class="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <p class="text-xs text-gray-500 mt-1">
            Número que se muestra en el perfil (puede ser mayor que la lista).
          </p>
        </div>
      </div>

      <div v-if="form.proyectosLeyLista.length === 0" class="text-sm text-gray-500 border border-dashed rounded-lg p-4 text-center">
        Sin proyectos. Se muestran en el perfil público del senador.
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="(proyecto, i) in form.proyectosLeyLista"
          :key="i"
          class="flex gap-2 items-start"
        >
          <span class="text-xs text-gray-400 pt-2.5 w-6 text-right shrink-0">{{ i + 1 }}.</span>
          <textarea
            v-model="form.proyectosLeyLista[i]"
            rows="2"
            placeholder="Título del proyecto de ley"
            class="flex-1 px-3 py-2 border rounded-lg text-sm resize-y"
          ></textarea>
          <div class="flex flex-col gap-1 pt-0.5">
            <button
              type="button"
              @click="moverProyecto(i, -1)"
              :disabled="i === 0"
              class="px-2 py-0.5 text-xs border rounded hover:bg-gray-50 disabled:opacity-30"
              title="Subir"
            >▲</button>
            <button
              type="button"
              @click="moverProyecto(i, 1)"
              :disabled="i === form.proyectosLeyLista.length - 1"
              class="px-2 py-0.5 text-xs border rounded hover:bg-gray-50 disabled:opacity-30"
              title="Bajar"
            >▼</button>
          </div>
          <button
            type="button"
            @click="quitarProyecto(i)"
            class="px-2 py-1.5 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50 shrink-0"
            title="Eliminar"
          >✕</button>
        </div>
      </div>
    </section>

    <!-- Acciones -->
    <div class="flex justify-end gap-3 pt-2">
      <button
        type="button"
        @click="$emit('cancelar')"
        class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="saving"
        class="px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
      >
        {{ saving ? 'Guardando...' : 'Guardar cambios' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { SenadorPleno } from '~/composables/usePlenoCamaral'

const props = defineProps<{
  senador: SenadorPleno
  /** true = se editan los campos *Suplente del titular */
  esSuplente?: boolean
  titularNombre?: string
}>()

const emit = defineEmits<{
  (e: 'submit', payload: Record<string, any>): void
  (e: 'cancelar'): void
}>()

const REDES = [
  { key: 'facebook', keySuplente: 'facebookSuplente', label: 'Facebook', placeholder: 'https://facebook.com/...' },
  { key: 'twitter', keySuplente: 'twitterSuplente', label: 'Twitter / X', placeholder: 'https://x.com/...' },
  { key: 'instagram', keySuplente: 'instagramSuplente', label: 'Instagram', placeholder: 'https://instagram.com/...' },
  { key: 'youtube', keySuplente: 'youtubeSuplente', label: 'YouTube', placeholder: 'https://youtube.com/@...' },
  { key: 'tiktok', keySuplente: 'tiktokSuplente', label: 'TikTok', placeholder: 'https://tiktok.com/@...' }
] as const

const esSuplente = computed(() => Boolean(props.esSuplente))

const form = reactive<Record<string, any>>({
  // Titular
  name: props.esSuplente ? (props.senador.suplente || '') : (props.senador.name || ''),
  party: props.senador.party || '',
  partyShort: props.senador.partyShort || '',
  partyColor: props.senador.partyColor || '#2E7078',
  department: props.senador.department || '',
  cargo: props.senador.cargo || '',
  comision: props.senador.comision || '',
  comite: props.senador.comite || '',
  estado: props.senador.estado || 'activo',
  fechaNacimiento: props.senador.fechaNacimiento || '',
  nacidoEn: props.senador.nacidoEn || '',
  ocupacion: props.senador.ocupacion || '',
  facebook: props.senador.facebook || '',
  twitter: props.senador.twitter || '',
  instagram: props.senador.instagram || '',
  youtube: props.senador.youtube || '',
  tiktok: props.senador.tiktok || '',

  // Suplente
  cargoSuplente: props.senador.cargoSuplente || '',
  comiteSuplente: props.senador.comiteSuplente || '',
  fechaNacimientoSuplente: props.senador.fechaNacimientoSuplente || '',
  nacidoEnSuplente: props.senador.nacidoEnSuplente || '',
  ocupacionSuplente: props.senador.ocupacionSuplente || '',
  facebookSuplente: props.senador.facebookSuplente || '',
  twitterSuplente: props.senador.twitterSuplente || '',
  instagramSuplente: props.senador.instagramSuplente || '',
  youtubeSuplente: props.senador.youtubeSuplente || '',
  tiktokSuplente: props.senador.tiktokSuplente || '',

  // 📜 Proyectos de ley destacados (solo titular)
  proyectosLeyCantidad: props.senador.proyectosLey?.cantidad || 0,
  proyectosLeyLista: Array.isArray(props.senador.proyectosLey?.lista)
    ? [...props.senador.proyectosLey.lista]
    : []
})

const saving = ref(false)
const serverError = ref('')
const errores = reactive<Record<string, string>>({})

// ============================================
// 📜 PROYECTOS DE LEY
// ============================================
const agregarProyecto = () => {
  form.proyectosLeyLista.push('')
}

const quitarProyecto = (i: number) => {
  form.proyectosLeyLista.splice(i, 1)
}

const moverProyecto = (i: number, delta: number) => {
  const j = i + delta
  if (j < 0 || j >= form.proyectosLeyLista.length) return
  const tmp = form.proyectosLeyLista[i]
  form.proyectosLeyLista[i] = form.proyectosLeyLista[j]
  form.proyectosLeyLista[j] = tmp
}

const validar = (): boolean => {
  Object.keys(errores).forEach((k) => delete errores[k])
  serverError.value = ''

  if (!String(form.name || '').trim()) {
    errores.name = 'El nombre es obligatorio'
    return false
  }

  return true
}

const enviar = () => {
  if (!validar()) return

  saving.value = true

  let payload: Record<string, any>

  if (esSuplente.value) {
    // Solo campos del suplente
    payload = {
      suplente: String(form.name).trim(),
      cargoSuplente: form.cargoSuplente,
      comiteSuplente: form.comiteSuplente,
      fechaNacimientoSuplente: form.fechaNacimientoSuplente,
      nacidoEnSuplente: form.nacidoEnSuplente,
      ocupacionSuplente: form.ocupacionSuplente,
      facebookSuplente: form.facebookSuplente,
      twitterSuplente: form.twitterSuplente,
      instagramSuplente: form.instagramSuplente,
      youtubeSuplente: form.youtubeSuplente,
      tiktokSuplente: form.tiktokSuplente
    }
  } else {
    // Solo campos del titular
    payload = {
      name: String(form.name).trim(),
      party: form.party,
      partyShort: form.partyShort,
      partyColor: form.partyColor,
      department: form.department,
      cargo: form.cargo,
      comision: form.comision,
      comite: form.comite,
      estado: form.estado,
      fechaNacimiento: form.fechaNacimiento,
      nacidoEn: form.nacidoEn,
      ocupacion: form.ocupacion,
      facebook: form.facebook,
      twitter: form.twitter,
      instagram: form.instagram,
      youtube: form.youtube,
      tiktok: form.tiktok,

      // 📜 Se envía como objeto { cantidad, lista }, descartando vacíos
      proyectosLey: {
        cantidad: Number(form.proyectosLeyCantidad) || 0,
        lista: (form.proyectosLeyLista || [])
          .map((t: string) => String(t).trim())
          .filter(Boolean)
      }
    }
  }

  emit('submit', payload)
}

defineExpose({
  setSaving: (v: boolean) => (saving.value = v),
  setError: (m: string) => (serverError.value = m)
})
</script>
