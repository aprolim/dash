<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin/comunicados" class="text-gray-400 hover:text-gray-600 text-2xl">
        ←
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Editar Comunicado</h1>
        <p class="text-sm text-gray-500">Modifica el contenido y la programación</p>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando...</p>
    </div>

    <div v-else-if="error" class="text-center py-12 text-red-600">
      {{ error }}
    </div>

    <form v-else @submit.prevent="saveComunicado" class="space-y-6">
      <!-- Info del estado actual -->
      <div :class="estadoInfoClass" class="border rounded-lg p-4">
        <p class="text-sm">
          <strong>Estado actual:</strong> {{ estadoText(form.estado) }}
          <span v-if="form.estado === 'programado' && form.fechaActivacion && form.fechaDesactivacion">
            — Se mostrará desde {{ formatearFechaLocal(form.fechaActivacion) }} hasta {{ formatearFechaLocal(form.fechaDesactivacion) }}
          </span>
          <span v-else-if="form.estado === 'activo' && !form.fechaDesactivacion">
            — Visible ahora, sin fecha de fin
          </span>
          <span v-else-if="form.estado === 'activo' && form.fechaDesactivacion">
            — Visible hasta {{ formatearFechaLocal(form.fechaDesactivacion) }}
          </span>
        </p>
      </div>

      <!-- Título -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Título <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.titulo"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <!-- Contenido -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Contenido <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="form.contenido"
          rows="5"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500"
        ></textarea>
      </div>

      <!-- Imagen -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">📷 Imagen</h3>
        <div class="mb-4">
          <label class="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg inline-flex transition">
            Cambiar imagen
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />
          </label>
          <span v-if="uploadingImage" class="ml-3 text-sm text-gray-500">Subiendo...</span>
        </div>
        <div v-if="form.imagen.url" class="p-4 bg-gray-100 rounded-lg">
          <img :src="form.imagen.url" class="w-full max-w-md h-64 object-cover mx-auto rounded-lg" />
        </div>
      </div>

      <!-- PDF -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">📄 PDF</h3>
        <div class="mb-4">
          <label class="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg inline-flex transition">
            {{ form.pdf.url ? 'Cambiar PDF' : 'Subir PDF' }}
            <input ref="pdfInput" type="file" accept="application/pdf" class="hidden" @change="handlePdfSelect" />
          </label>
          <span v-if="uploadingPDF" class="ml-3 text-sm text-gray-500">Subiendo...</span>
        </div>
        <div v-if="form.pdf.url" class="p-4 bg-gray-100 rounded-lg flex items-center gap-3">
          <span class="text-3xl">📄</span>
          <div>
            <p class="font-medium">{{ form.pdf.name }}</p>
          </div>
          <button type="button" @click="form.pdf = { url: null, name: '', size: 0 }" class="ml-auto text-red-500">✕</button>
        </div>
      </div>

      <!-- 🔥 ESTADO Y PROGRAMACIÓN -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">⏰ Estado y Programación</h3>

        <!-- Selector de estado (3 opciones en edición) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div 
            @click="form.estado = 'programado'"
            class="cursor-pointer border-2 rounded-lg p-4 transition-all"
            :class="form.estado === 'programado' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'"
          >
            <div class="flex items-start gap-3">
              <div class="text-2xl">⏰</div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 text-sm">Programado</h4>
                <p class="text-xs text-gray-600 mt-1">Aparece y desaparece solo</p>
              </div>
              <div v-if="form.estado === 'programado'" class="text-yellow-500 text-xl">✓</div>
            </div>
          </div>

          <div 
            @click="form.estado = 'activo'"
            class="cursor-pointer border-2 rounded-lg p-4 transition-all"
            :class="form.estado === 'activo' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'"
          >
            <div class="flex items-start gap-3">
              <div class="text-2xl">🟢</div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 text-sm">Activo</h4>
                <p class="text-xs text-gray-600 mt-1">Visible ahora</p>
              </div>
              <div v-if="form.estado === 'activo'" class="text-green-500 text-xl">✓</div>
            </div>
          </div>

          <div 
            @click="form.estado = 'inactivo'"
            class="cursor-pointer border-2 rounded-lg p-4 transition-all"
            :class="form.estado === 'inactivo' ? 'border-gray-500 bg-gray-100' : 'border-gray-200 hover:border-gray-300'"
          >
            <div class="flex items-start gap-3">
              <div class="text-2xl">⚪</div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 text-sm">Inactivo</h4>
                <p class="text-xs text-gray-600 mt-1">No se muestra</p>
              </div>
              <div v-if="form.estado === 'inactivo'" class="text-gray-500 text-xl">✓</div>
            </div>
          </div>
        </div>

        <!-- Info contextual según estado -->
        <div v-if="form.estado === 'programado'" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-sm text-yellow-800 mb-3">
            ⏰ El comunicado se mostrará automáticamente el <strong>{{ form.fechaActivacion ? formatearFechaLocal(form.fechaActivacion) : 'día de inicio' }}</strong>
            y desaparecerá el <strong>{{ form.fechaDesactivacion ? formatearFechaLocal(form.fechaDesactivacion) : 'día de fin' }}</strong>.
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Fecha de inicio <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="form.fechaActivacion" 
                type="datetime-local" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Fecha de fin <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="form.fechaDesactivacion" 
                type="datetime-local" 
                required
                :min="form.fechaActivacion"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500" 
              />
            </div>
          </div>

          <div v-if="form.fechaActivacion && form.fechaDesactivacion && form.fechaActivacion >= form.fechaDesactivacion" 
               class="mt-3 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
            ❌ La fecha de fin debe ser posterior a la fecha de inicio
          </div>
        </div>

        <div v-if="form.estado === 'activo'" class="bg-green-50 border border-green-200 rounded-lg p-4">
          <p class="text-sm text-green-800 mb-3">
            ✅ El comunicado está/se mostrará <strong>inmediatamente</strong> en el modal principal.
          </p>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fecha de fin (opcional)
            </label>
            <input 
              v-model="form.fechaDesactivacion" 
              type="datetime-local" 
              class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" 
            />
            <p class="text-xs text-gray-600 mt-1">
              Si la dejas vacía, el comunicado se quedará activo hasta que lo inactives manualmente.
            </p>
          </div>
        </div>

        <div v-if="form.estado === 'inactivo'" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p class="text-sm text-gray-700">
            ⚪ El comunicado NO se mostrará en el modal principal.
            Si lo inactivas aquí, desaparecerá inmediatamente de la vista pública.
          </p>
        </div>

        <!-- Prioridad -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Prioridad (0-10)</label>
          <input v-model.number="form.prioridad" type="number" min="0" max="10" class="w-32 px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>

      <!-- Errores de validación -->
      <div v-if="errores.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="font-medium text-red-800 mb-2">Corrige los siguientes errores:</p>
        <ul class="list-disc list-inside text-sm text-red-700 space-y-1">
          <li v-for="(err, i) in errores" :key="i">{{ err }}</li>
        </ul>
      </div>

      <!-- Botones -->
      <div class="flex justify-between items-center pt-4 border-t">
        <div>
          <!-- Botón rápido de inactivar si está activo -->
          <button
            v-if="form.estado === 'activo'"
            type="button"
            @click="form.estado = 'inactivo'"
            class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
          >
            ⏹️ Inactivar ahora
          </button>
        </div>
        <div class="flex gap-3">
          <NuxtLink to="/admin/comunicados" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancelar
          </NuxtLink>
          <button 
            type="submit" 
            :disabled="saving || !formularioValido" 
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useComunicados } from '~/composables/useComunicados'

definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { getComunicadoById, updateComunicado, uploadImage: uploadImageApi, uploadPDF: uploadPDFApi } = useComunicados()

const loading = ref(true)
const saving = ref(false)
const uploadingImage = ref(false)
const uploadingPDF = ref(false)
const error = ref(null)
const fileInput = ref(null)
const pdfInput = ref(null)

const form = reactive({
  titulo: '',
  contenido: '',
  imagen: { url: '', alt: '', name: '' },
  pdf: { url: null, name: '', size: 0 },
  estado: 'programado',
  fechaActivacion: '',
  fechaDesactivacion: '',
  prioridad: 0
})

const errores = computed(() => {
  const e = []

  if (!form.titulo.trim()) e.push('El título es requerido')
  if (!form.contenido.trim()) e.push('El contenido es requerido')
  if (!form.imagen.url) e.push('La imagen es requerida')

  if (form.estado === 'programado') {
    if (!form.fechaActivacion) e.push('La fecha de inicio es requerida')
    if (!form.fechaDesactivacion) e.push('La fecha de fin es requerida')
    if (form.fechaActivacion && form.fechaDesactivacion) {
      if (new Date(form.fechaActivacion) >= new Date(form.fechaDesactivacion)) {
        e.push('La fecha de fin debe ser posterior a la fecha de inicio')
      }
    }
  }

  if (form.estado === 'activo' && form.fechaDesactivacion) {
    // Solo validar que sea futura si tiene valor
    if (new Date(form.fechaDesactivacion) <= new Date()) {
      e.push('La fecha de fin debe ser futura')
    }
  }

  return e
})

const formularioValido = computed(() => errores.value.length === 0)

const estadoInfoClass = computed(() => {
  if (form.estado === 'activo') return 'bg-green-50 border-green-200 text-green-800'
  if (form.estado === 'programado') return 'bg-yellow-50 border-yellow-200 text-yellow-800'
  return 'bg-gray-50 border-gray-200 text-gray-700'
})

const estadoText = (estado) => {
  const texts = {
    activo: '🟢 Activo',
    programado: '⏰ Programado',
    inactivo: '⚪ Inactivo'
  }
  return texts[estado] || estado
}

const formatearFechaLocal = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Convertir ISO a formato datetime-local (con timezone local)
const toLocalDatetime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

const loadComunicado = async () => {
  try {
    const id = route.params.id
    const data = await getComunicadoById(id)
    
    form.titulo = data.titulo
    form.contenido = data.contenido
    form.imagen = data.imagen || { url: '', alt: '', name: '' }
    form.pdf = data.pdf || { url: null, name: '', size: 0 }
    form.estado = data.estado || 'programado'
    form.fechaActivacion = toLocalDatetime(data.fechaActivacion)
    form.fechaDesactivacion = toLocalDatetime(data.fechaDesactivacion)
    form.prioridad = data.prioridad || 0
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const handleFileSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  uploadingImage.value = true
  try {
    const result = await uploadImageApi(file, form.titulo)
    form.imagen = { url: result.url, alt: form.titulo, name: result.filename }
  } catch (err) {
    alert(err.message)
  } finally {
    uploadingImage.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

const handlePdfSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  uploadingPDF.value = true
  try {
    const result = await uploadPDFApi(file)
    form.pdf = { url: result.url, name: result.originalName || result.filename, size: result.size || file.size }
  } catch (err) {
    alert(err.message)
  } finally {
    uploadingPDF.value = false
    if (pdfInput.value) pdfInput.value.value = ''
  }
}

const saveComunicado = async () => {
  if (!formularioValido.value) {
    alert('Corrige los errores antes de guardar')
    return
  }

  saving.value = true
  try {
    const id = route.params.id
    const payload = {
      titulo: form.titulo,
      contenido: form.contenido,
      imagen: form.imagen,
      pdf: form.pdf.url ? form.pdf : null,
      estado: form.estado,
      prioridad: form.prioridad,
      fechaActivacion: form.fechaActivacion ? new Date(form.fechaActivacion).toISOString() : null,
      fechaDesactivacion: form.fechaDesactivacion ? new Date(form.fechaDesactivacion).toISOString() : null
    }

    await updateComunicado(id, payload)
    router.push('/admin/comunicados')
  } catch (err) {
    alert(err.message)
  } finally {
    saving.value = false
  }
}

onMounted(loadComunicado)
</script>