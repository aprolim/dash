<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin/comunicados" class="text-gray-400 hover:text-gray-600 text-2xl">
        ←
      </NuxtLink>
      <h1 class="text-2xl font-semibold text-gray-900">Crear Nuevo Comunicado</h1>
    </div>

    <form @submit.prevent="saveComunicado" class="space-y-6">
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
          placeholder="Título del comunicado"
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
          placeholder="Contenido del comunicado..."
        ></textarea>
      </div>

      <!-- Imagen -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">📷 Imagen <span class="text-red-500">*</span></h3>
        
        <div class="mb-4">
          <div class="flex gap-3 items-center flex-wrap">
            <label class="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
              <span>Subir imagen</span>
              <input 
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                class="hidden"
                @change="handleFileSelect"
              />
            </label>
            <span v-if="uploadingImage" class="text-sm text-gray-500 flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              Subiendo...
            </span>
          </div>
        </div>
        
        <div v-if="form.imagen.url" class="mt-4 p-4 bg-gray-100 rounded-lg">
          <img :src="form.imagen.url" class="w-full max-w-md h-64 object-cover mx-auto rounded-lg" />
        </div>
      </div>

      <!-- PDF -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">📄 PDF (opcional)</h3>
        
        <div class="mb-4">
          <div class="flex gap-3 items-center flex-wrap">
            <label class="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
              <span>Subir PDF</span>
              <input 
                ref="pdfInput"
                type="file"
                accept="application/pdf"
                class="hidden"
                @change="handlePdfSelect"
              />
            </label>
            <span v-if="uploadingPDF" class="text-sm text-gray-500">Subiendo...</span>
          </div>
        </div>
        
        <div v-if="form.pdf.url" class="mt-4 p-4 bg-gray-100 rounded-lg flex items-center gap-3">
          <span class="text-3xl">📄</span>
          <div>
            <p class="font-medium">{{ form.pdf.name }}</p>
            <p class="text-xs text-gray-500">{{ formatearTamaño(form.pdf.size) }}</p>
          </div>
          <button type="button" @click="form.pdf = { url: null, name: '', size: 0 }" class="ml-auto text-red-500">✕</button>
        </div>
      </div>

      <!-- 🔥 ESTADO Y PROGRAMACIÓN -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">⏰ Programación</h3>

        <!-- Selector de estado (SIN opción inactivo) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div 
            @click="form.estado = 'programado'"
            class="cursor-pointer border-2 rounded-lg p-4 transition-all"
            :class="form.estado === 'programado' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'"
          >
            <div class="flex items-start gap-3">
              <div class="text-2xl">⏰</div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900">Programado</h4>
                <p class="text-xs text-gray-600 mt-1">
                  Aparece y desaparece automáticamente según las fechas
                </p>
                <p class="text-xs text-yellow-700 mt-1 font-medium">
                  ⚠️ Requiere fecha inicio + fin
                </p>
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
                <h4 class="font-semibold text-gray-900">Activo</h4>
                <p class="text-xs text-gray-600 mt-1">
                  Aparece ahora mismo y se queda hasta inactivarlo
                </p>
                <p class="text-xs text-green-700 mt-1 font-medium">
                  ✓ Fecha fin opcional
                </p>
              </div>
              <div v-if="form.estado === 'activo'" class="text-green-500 text-xl">✓</div>
            </div>
          </div>
        </div>

        <!-- Fechas -->
        <div v-if="form.estado === 'programado'" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-sm text-yellow-800 mb-3">
            ⏰ El comunicado aparecerá como modal el <strong>{{ form.fechaActivacion ? formatearFechaLocal(form.fechaActivacion) : 'día de inicio' }}</strong> 
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
                :min="minDate"
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
                :min="form.fechaActivacion || minDate"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500" 
              />
            </div>
          </div>

          <div v-if="form.fechaActivacion && form.fechaDesactivacion && form.fechaActivacion >= form.fechaDesactivacion" 
               class="mt-3 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
            ❌ La fecha de fin debe ser posterior a la fecha de inicio
          </div>
        </div>

        <!-- Modo Activo -->
        <div v-if="form.estado === 'activo'" class="bg-green-50 border border-green-200 rounded-lg p-4">
          <p class="text-sm text-green-800 mb-3">
            ✅ El comunicado aparecerá como modal <strong>inmediatamente</strong>. 
            Se quedará visible hasta que lo inactives manualmente o llegue la fecha de fin (si la especificas).
          </p>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fecha de fin (opcional)
            </label>
            <input 
              v-model="form.fechaDesactivacion" 
              type="datetime-local" 
              :min="minDate"
              class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" 
            />
            <p class="text-xs text-gray-600 mt-1">
              Si la dejas vacía, el comunicado se quedará activo hasta que lo inactives manualmente.
            </p>
          </div>
        </div>

        <!-- Prioridad -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Prioridad (0-10)</label>
          <input v-model.number="form.prioridad" type="number" min="0" max="10" class="w-32 px-3 py-2 border border-gray-300 rounded-lg" />
          <p class="text-xs text-gray-500 mt-1">Si hay varios activos, se mostrará el de mayor prioridad</p>
        </div>
      </div>

      <!-- Validaciones -->
      <div v-if="errores.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="font-medium text-red-800 mb-2">Corrige los siguientes errores:</p>
        <ul class="list-disc list-inside text-sm text-red-700 space-y-1">
          <li v-for="(err, i) in errores" :key="i">{{ err }}</li>
        </ul>
      </div>

      <!-- Botones -->
      <div class="flex justify-end space-x-3 pt-4 border-t">
        <NuxtLink to="/admin/comunicados" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          Cancelar
        </NuxtLink>
        <button 
          type="submit" 
          :disabled="saving || !formularioValido" 
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ saving ? 'Guardando...' : 'Guardar comunicado' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useComunicados } from '~/composables/useComunicados'

definePageMeta({ layout: 'default', middleware: 'auth' })

const router = useRouter()
const { createComunicado, uploadImage: uploadImageApi, uploadPDF: uploadPDFApi } = useComunicados()

const saving = ref(false)
const uploadingImage = ref(false)
const uploadingPDF = ref(false)
const fileInput = ref(null)
const pdfInput = ref(null)

const form = reactive({
  titulo: '',
  contenido: '',
  imagen: { url: '', alt: '', name: '' },
  pdf: { url: null, name: '', size: 0 },
  estado: 'programado',   // 🔥 Default: programado
  fechaActivacion: '',
  fechaDesactivacion: '',
  prioridad: 0
})

const minDate = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

// 🔥 Validación en tiempo real
const errores = computed(() => {
  const e = []

  if (!form.titulo.trim()) e.push('El título es requerido')
  if (!form.contenido.trim()) e.push('El contenido es requerido')
  if (!form.imagen.url) e.push('La imagen es requerida')

  if (form.estado === 'programado') {
    if (!form.fechaActivacion) e.push('La fecha de inicio es requerida para programar')
    if (!form.fechaDesactivacion) e.push('La fecha de fin es requerida para programar')
    if (form.fechaActivacion && form.fechaDesactivacion) {
      if (new Date(form.fechaActivacion) >= new Date(form.fechaDesactivacion)) {
        e.push('La fecha de fin debe ser posterior a la fecha de inicio')
      }
      if (new Date(form.fechaActivacion) <= new Date()) {
        e.push('Para programar, la fecha de inicio debe ser futura. Si quieres que aparezca ahora, usa "Activo".')
      }
    }
  }

  if (form.estado === 'activo' && form.fechaDesactivacion) {
    if (new Date(form.fechaDesactivacion) <= new Date()) {
      e.push('La fecha de fin debe ser futura')
    }
  }

  return e
})

const formularioValido = computed(() => errores.value.length === 0)

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

const formatearTamaño = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleFileSelect = async (event) => {
  const target = event.target
  const file = target.files?.[0]
  if (!file) return

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    alert('Formato no válido. Use JPG, PNG, WEBP o GIF.')
    return
  }

  uploadingImage.value = true
  try {
    const result = await uploadImageApi(file, form.titulo || 'comunicado')
    form.imagen = {
      url: result.url,
      alt: form.titulo || 'Comunicado',
      name: result.filename
    }
  } catch (error) {
    alert(error.message || 'Error al subir la imagen')
  } finally {
    uploadingImage.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

const handlePdfSelect = async (event) => {
  const target = event.target
  const file = target.files?.[0]
  if (!file) return

  if (file.type !== 'application/pdf') {
    alert('Solo se permiten archivos PDF')
    return
  }

  uploadingPDF.value = true
  try {
    const result = await uploadPDFApi(file)
    form.pdf = {
      url: result.url,
      name: result.originalName || result.filename,
      size: result.size || file.size
    }
  } catch (error) {
    alert(error.message || 'Error al subir el PDF')
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
    const payload = {
      titulo: form.titulo,
      contenido: form.contenido,
      imagen: form.imagen,
      pdf: form.pdf.url ? form.pdf : null,
      estado: form.estado,
      prioridad: form.prioridad
    }

    if (form.estado === 'programado') {
      payload.fechaActivacion = new Date(form.fechaActivacion).toISOString()
      payload.fechaDesactivacion = new Date(form.fechaDesactivacion).toISOString()
    } else if (form.estado === 'activo') {
      // Sin fecha de activación (se activa ahora)
      if (form.fechaDesactivacion) {
        payload.fechaDesactivacion = new Date(form.fechaDesactivacion).toISOString()
      }
    }

    await createComunicado(payload)
    router.push('/admin/comunicados')
  } catch (error) {
    alert(error.message || 'Error al crear el comunicado')
  } finally {
    saving.value = false
  }
}
</script>