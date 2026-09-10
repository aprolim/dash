<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin/avisos" class="text-gray-400 hover:text-gray-600 text-2xl">
        ←
      </NuxtLink>
      <h1 class="text-2xl font-semibold text-gray-900">Crear Nuevo Aviso</h1>
    </div>

    <form @submit.prevent="saveAviso" class="space-y-6">
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
          placeholder="Título del aviso"
        />
      </div>

      <!-- Descripción -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Descripción <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="form.descripcion"
          rows="4"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500"
          placeholder="Descripción del aviso..."
        ></textarea>
      </div>

      <!-- Tipo y Fecha -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select v-model="form.tipo" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="Normal">🟢 Normal</option>
            <option value="Informativo">🔵 Informativo</option>
            <option value="Importante">🟡 Importante</option>
            <option value="Urgente">🔴 Urgente</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha (opcional)</label>
          <input
            v-model="form.fecha"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Ej: 15/09/2026 (por defecto: hoy)"
          />
        </div>
      </div>

      <!-- Tags -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Etiquetas (separadas por coma)</label>
        <input
          v-model="tagsInput"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Ej: Sesión, Convocatoria, Importante"
        />
        <div class="flex flex-wrap gap-2 mt-2">
          <span v-for="tag in form.tags" :key="tag" class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            #{{ tag }}
          </span>
        </div>
      </div>

      <!-- Imagen -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">📷 Imagen (opcional)</h3>
        
        <div class="mb-4">
          <label class="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition inline-flex items-center gap-2">
            <span>Subir imagen</span>
            <input 
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              class="hidden"
              @change="handleFileSelect"
            />
          </label>
          <span v-if="uploadingImage" class="ml-3 text-sm text-gray-500">Subiendo...</span>
        </div>
        
        <div v-if="form.imagen" class="mt-4 p-4 bg-gray-100 rounded-lg">
          <img :src="form.imagen" class="w-full max-w-md h-64 object-cover mx-auto rounded-lg" />
          <button type="button" @click="form.imagen = null" class="mt-2 text-red-500 text-sm">✕ Eliminar imagen</button>
        </div>
      </div>

      <!-- PDF -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">📄 PDF (opcional)</h3>
        
        <div class="mb-4">
          <label class="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition inline-flex items-center gap-2">
            <span>Subir PDF</span>
            <input 
              ref="pdfInput"
              type="file"
              accept="application/pdf"
              class="hidden"
              @change="handlePdfSelect"
            />
          </label>
          <span v-if="uploadingPDF" class="ml-3 text-sm text-gray-500">Subiendo...</span>
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

      <!-- Estado -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">⚙️ Estado</h3>
        <label class="flex items-center gap-3">
          <input type="checkbox" v-model="form.activo" class="w-5 h-5" />
          <span class="text-sm text-gray-700">Activo (visible en la sección pública)</span>
        </label>
      </div>

      <!-- Botones -->
      <div class="flex justify-end space-x-3 pt-4 border-t">
        <NuxtLink
          to="/admin/avisos"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </NuxtLink>
        <button
          type="submit"
          :disabled="saving"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {{ saving ? 'Guardando...' : 'Guardar aviso' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAvisos } from '~/composables/useAvisos'

definePageMeta({ layout: 'default', middleware: 'auth' })

const router = useRouter()
const { createAviso, uploadImage: uploadImageApi, uploadPDF: uploadPDFApi } = useAvisos()

const saving = ref(false)
const uploadingImage = ref(false)
const uploadingPDF = ref(false)
const fileInput = ref(null)
const pdfInput = ref(null)
const tagsInput = ref('')

const form = reactive({
  titulo: '',
  descripcion: '',
  tipo: 'Normal',
  fecha: '',
  tags: [],
  imagen: null,
  pdf: { url: null, name: '', size: 0 },
  activo: true
})

// Sincronizar tags
watch(tagsInput, (newVal) => {
  form.tags = newVal.split(',').map(t => t.trim()).filter(t => t)
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
    const result = await uploadImageApi(file)
    form.imagen = result.url
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

const saveAviso = async () => {
  if (!form.titulo.trim()) {
    alert('El título es requerido')
    return
  }
  if (!form.descripcion.trim()) {
    alert('La descripción es requerida')
    return
  }

  saving.value = true
  try {
    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      tipo: form.tipo,
      fecha: form.fecha || new Date().toLocaleDateString('es-ES'),
      tags: form.tags,
      imagen: form.imagen,
      pdf: form.pdf.url ? form.pdf : null,
      activo: form.activo,
      origen: 'manual'
    }

    await createAviso(payload)
    router.push('/admin/avisos')
  } catch (error) {
    alert(error.message || 'Error al crear el aviso')
  } finally {
    saving.value = false
  }
}
</script>