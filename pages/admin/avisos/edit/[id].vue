<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin/avisos" class="text-gray-400 hover:text-gray-600 text-2xl">
        ←
      </NuxtLink>
      <h1 class="text-2xl font-semibold text-gray-900">Editar Aviso</h1>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando aviso...</p>
    </div>

    <div v-else-if="error" class="text-center py-12 text-red-600">
      {{ error }}
    </div>

    <form v-else @submit.prevent="saveAviso" class="space-y-6">
      <!-- Advertencia si viene de comunicado -->
      <div v-if="esDeComunicado" class="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p class="text-sm text-purple-800">
          📢 <strong>Este aviso proviene de un comunicado.</strong>
          Algunos campos no pueden editarse porque fueron generados automáticamente.
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

      <!-- Descripción -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Descripción <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="form.descripcion"
          rows="4"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
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
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input
            v-model="form.fecha"
            type="text"
            :disabled="esDeComunicado"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
          />
        </div>
      </div>

      <!-- Tags -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Etiquetas</label>
        <input
          v-model="tagsInput"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Ej: Sesión, Convocatoria"
        />
        <div class="flex flex-wrap gap-2 mt-2">
          <span v-for="tag in form.tags" :key="tag" class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            #{{ tag }}
          </span>
        </div>
      </div>

      <!-- Imagen -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">📷 Imagen</h3>
        
        <div v-if="!esDeComunicado" class="mb-4">
          <label class="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg inline-flex">
            {{ form.imagen ? 'Cambiar imagen' : 'Subir imagen' }}
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />
          </label>
        </div>
        
        <div v-if="form.imagen" class="mt-4 p-4 bg-gray-100 rounded-lg">
          <img :src="form.imagen" class="w-full max-w-md h-64 object-cover mx-auto rounded-lg" />
          <button v-if="!esDeComunicado" type="button" @click="form.imagen = null" class="mt-2 text-red-500 text-sm">✕ Eliminar</button>
        </div>
      </div>

      <!-- PDF -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">📄 PDF</h3>
        
        <div v-if="!esDeComunicado" class="mb-4">
          <label class="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg inline-flex">
            Subir PDF
            <input ref="pdfInput" type="file" accept="application/pdf" class="hidden" @change="handlePdfSelect" />
          </label>
        </div>
        
        <div v-if="form.pdf.url" class="mt-4 p-4 bg-gray-100 rounded-lg flex items-center gap-3">
          <span class="text-3xl">📄</span>
          <div>
            <p class="font-medium">{{ form.pdf.name }}</p>
          </div>
          <button v-if="!esDeComunicado" type="button" @click="form.pdf = { url: null, name: '', size: 0 }" class="ml-auto text-red-500">✕</button>
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
        <NuxtLink to="/admin/avisos" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
          Cancelar
        </NuxtLink>
        <button type="submit" :disabled="saving" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          {{ saving ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAvisos } from '~/composables/useAvisos'

definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { getAvisoById, updateAviso, uploadImage: uploadImageApi, uploadPDF: uploadPDFApi } = useAvisos()

const loading = ref(true)
const saving = ref(false)
const error = ref(null)
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
  activo: true,
  origen: 'manual'
})

const esDeComunicado = computed(() => form.origen === 'comunicado')

watch(tagsInput, (newVal) => {
  form.tags = newVal.split(',').map(t => t.trim()).filter(t => t)
})

const loadAviso = async () => {
  try {
    const id = route.params.id
    const data = await getAvisoById(id)
    
    form.titulo = data.titulo
    form.descripcion = data.descripcion
    form.tipo = data.tipo
    form.fecha = data.fecha
    form.tags = data.tags || []
    form.imagen = data.imagen
    form.pdf = data.pdf || { url: null, name: '', size: 0 }
    form.activo = data.activo
    form.origen = data.origen || 'manual'
    
    tagsInput.value = form.tags.join(', ')
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
    const result = await uploadImageApi(file)
    form.imagen = result.url
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
    form.pdf = {
      url: result.url,
      name: result.originalName || result.filename,
      size: result.size || file.size
    }
  } catch (err) {
    alert(err.message)
  } finally {
    if (pdfInput.value) pdfInput.value.value = ''
  }
}

const saveAviso = async () => {
  if (!form.titulo.trim() || !form.descripcion.trim()) {
    alert('Complete todos los campos requeridos')
    return
  }

  saving.value = true
  try {
    const id = route.params.id
    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      tipo: form.tipo,
      fecha: form.fecha,
      tags: form.tags,
      imagen: form.imagen,
      pdf: form.pdf.url ? form.pdf : null,
      activo: form.activo
    }

    await updateAviso(id, payload)
    router.push('/admin/avisos')
  } catch (err) {
    alert(err.message)
  } finally {
    saving.value = false
  }
}

onMounted(loadAviso)
</script>