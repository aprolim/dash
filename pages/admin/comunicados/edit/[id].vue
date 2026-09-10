<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin/comunicados" class="text-gray-400 hover:text-gray-600 text-2xl">
        ←
      </NuxtLink>
      <h1 class="text-2xl font-semibold text-gray-900">Editar Comunicado</h1>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando...</p>
    </div>

    <div v-else-if="error" class="text-center py-12 text-red-600">
      {{ error }}
    </div>

    <form v-else @submit.prevent="saveComunicado" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Título <span class="text-red-500">*</span></label>
        <input v-model="form.titulo" type="text" required class="w-full px-4 py-2 border rounded-lg" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Contenido <span class="text-red-500">*</span></label>
        <textarea v-model="form.contenido" rows="5" required class="w-full px-4 py-2 border rounded-lg resize-none"></textarea>
      </div>

      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">📷 Imagen</h3>
        <label class="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg inline-flex mb-4">
          Cambiar imagen
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />
        </label>
        <div v-if="form.imagen.url" class="p-4 bg-gray-100 rounded-lg">
          <img :src="form.imagen.url" class="w-full max-w-md h-64 object-cover mx-auto rounded-lg" />
        </div>
      </div>

      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">📄 PDF</h3>
        <label class="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg inline-flex mb-4">
          Subir PDF
          <input ref="pdfInput" type="file" accept="application/pdf" class="hidden" @change="handlePdfSelect" />
        </label>
        <div v-if="form.pdf.url" class="p-4 bg-gray-100 rounded-lg flex items-center gap-3">
          <span class="text-3xl">📄</span>
          <div>
            <p class="font-medium">{{ form.pdf.name }}</p>
          </div>
          <button type="button" @click="form.pdf = { url: null, name: '', size: 0 }" class="ml-auto text-red-500">✕</button>
        </div>
      </div>

      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">⏰ Programación</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select v-model="form.estado" class="w-full px-4 py-2 border rounded-lg">
              <option value="inactivo">⚪ Inactivo</option>
              <option value="programado">⏰ Programado</option>
              <option value="activo">🟢 Activo</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Activación</label>
            <input v-model="form.fechaActivacion" type="datetime-local" class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Desactivación</label>
            <input v-model="form.fechaDesactivacion" type="datetime-local" class="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
          <input v-model.number="form.prioridad" type="number" min="0" max="10" class="w-32 px-3 py-2 border rounded-lg" />
        </div>
      </div>

      <div class="flex justify-end space-x-3 pt-4 border-t">
        <NuxtLink to="/admin/comunicados" class="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</NuxtLink>
        <button type="submit" :disabled="saving" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          {{ saving ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useComunicados } from '~/composables/useComunicados'

definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { getComunicadoById, updateComunicado, uploadImage: uploadImageApi, uploadPDF: uploadPDFApi } = useComunicados()

const loading = ref(true)
const saving = ref(false)
const error = ref(null)
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
    form.estado = data.estado
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
  try {
    const result = await uploadImageApi(file, form.titulo)
    form.imagen = { url: result.url, alt: form.titulo, name: result.filename }
  } catch (err) {
    alert(err.message)
  } finally {
    if (fileInput.value) fileInput.value.value = ''
  }
}

const handlePdfSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const result = await uploadPDFApi(file)
    form.pdf = { url: result.url, name: result.originalName || result.filename, size: result.size || file.size }
  } catch (err) {
    alert(err.message)
  } finally {
    if (pdfInput.value) pdfInput.value.value = ''
  }
}

const saveComunicado = async () => {
  if (!form.titulo.trim() || !form.contenido.trim() || !form.imagen.url) {
    return alert('Complete todos los campos requeridos')
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
      fechaActivacion: form.fechaActivacion ? new Date(form.fechaActivacion).toISOString() : null,
      fechaDesactivacion: form.fechaDesactivacion ? new Date(form.fechaDesactivacion).toISOString() : null,
      prioridad: form.prioridad
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