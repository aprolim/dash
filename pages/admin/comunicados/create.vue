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
            <span v-if="uploadingImage" class="text-sm text-gray-500">Subiendo...</span>
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

      <!-- Programación -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">⏰ Programación</h3>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p class="text-sm text-blue-800">
            💡 El comunicado aparecerá como <strong>modal en la página principal</strong> durante el período configurado.
            Al finalizar, pasará automáticamente a <strong>Avisos y Comunicados</strong>.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado Inicial</label>
            <select v-model="form.estado" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="inactivo">⚪ Inactivo</option>
              <option value="programado">⏰ Programar</option>
              <option value="activo">🟢 Activar ahora</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Activación</label>
            <input v-model="form.fechaActivacion" type="datetime-local" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Desactivación</label>
            <input v-model="form.fechaDesactivacion" type="datetime-local" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>

        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Prioridad (0-10)</label>
          <input v-model.number="form.prioridad" type="number" min="0" max="10" class="w-32 px-3 py-2 border border-gray-300 rounded-lg" />
          <p class="text-xs text-gray-500 mt-1">Si hay varios activos, se mostrará el de mayor prioridad</p>
        </div>
      </div>

      <!-- Botones -->
      <div class="flex justify-end space-x-3 pt-4 border-t">
        <NuxtLink to="/admin/comunicados" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          Cancelar
        </NuxtLink>
        <button type="submit" :disabled="saving" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          {{ saving ? 'Guardando...' : 'Guardar comunicado' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
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
  estado: 'inactivo',
  fechaActivacion: '',
  fechaDesactivacion: '',
  prioridad: 0
})

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
  if (!form.titulo.trim()) return alert('El título es requerido')
  if (!form.contenido.trim()) return alert('El contenido es requerido')
  if (!form.imagen.url) return alert('La imagen es requerida')

  if (form.fechaActivacion && form.fechaDesactivacion) {
    if (new Date(form.fechaActivacion) > new Date(form.fechaDesactivacion)) {
      return alert('La fecha de activación debe ser anterior a la de desactivación')
    }
  }

  if (form.estado === 'programado' && !form.fechaActivacion) {
    return alert('Para programar un comunicado, especifica una fecha de activación')
  }

  saving.value = true
  try {
    const payload = {
      titulo: form.titulo,
      contenido: form.contenido,
      imagen: form.imagen,
      pdf: form.pdf.url ? form.pdf : null,
      estado: form.estado,
      fechaActivacion: form.fechaActivacion ? new Date(form.fechaActivacion).toISOString() : null,
      fechaDesactivacion: form.fechaDesactivacion ? new Date(form.fechaDesactivacion).toISOString() : null,
      prioridad: form.prioridad
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