<!-- pages/admin/noticias/create.vue -->
<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin/noticias" class="text-gray-400 hover:text-gray-600 text-2xl">
        ←
      </NuxtLink>
      <h1 class="text-2xl font-semibold text-gray-900">Crear Nueva Noticia</h1>
    </div>

    <form @submit.prevent="saveNews" class="space-y-6">
      <!-- Título -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Título <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.title"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Título de la noticia"
        />
      </div>

      <!-- Slug -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Slug (URL amigable)
          <span class="text-gray-400 text-xs">(opcional)</span>
        </label>
        <input
          v-model="form.slug"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="mi-noticia-personalizada"
        />
        <p class="text-xs text-gray-500 mt-1">Dejar en blanco para generar automáticamente</p>
      </div>

      <!-- Extracto -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Extracto / Resumen
        </label>
        <textarea
          v-model="form.excerpt"
          rows="3"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
          placeholder="Breve descripción de la noticia (aparece en listados)"
        ></textarea>
      </div>

      <!-- Contenido con editor -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Contenido <span class="text-red-500">*</span>
        </label>
        <TiptapEditor v-model="form.content" placeholder="Escribe el contenido aquí..." />
      </div>

      <!-- Imagen destacada CON SUBIDA -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Imagen destacada
        </label>
        
        <!-- Opción 1: Subir archivo -->
        <div class="mb-3">
          <div class="flex gap-3 items-center">
            <label class="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Subir imagen
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
            <span v-if="uploadProgress" class="text-sm text-green-600">{{ uploadProgress }}</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">Formatos: JPG, PNG, WEBP, GIF. Máx 10MB</p>
        </div>
        
        <!-- Opción 2: URL externa -->
        <div class="mb-3">
          <div class="flex gap-3">
            <input
              v-model="form.featuredImage.url"
              type="url"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            <button
              v-if="form.featuredImage.url"
              type="button"
              @click="previewImageUrl"
              class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Previsualizar
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">O usa una URL externa de Unsplash, Imgur, etc.</p>
        </div>
        
        <!-- Vista previa de la imagen -->
        <div v-if="imagePreviewUrl" class="mt-3">
          <div class="relative inline-block">
            <img :src="imagePreviewUrl" class="h-40 w-auto object-cover rounded-lg shadow" />
            <button
              type="button"
              @click="clearImage"
              class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            >
              ✕
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ imagePreviewLabel }}</p>
        </div>
      </div>

      <!-- Categoría y Estado -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select v-model="form.category" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="noticias">Noticias</option>
            <option value="institucional">Institucional</option>
            <option value="legislacion">Legislación</option>
            <option value="eventos">Eventos</option>
            <option value="transparencia">Transparencia</option>
            <option value="participacion">Participación</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select v-model="form.status" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="draft">Borrador</option>
            <option value="published">Publicar</option>
          </select>
        </div>
      </div>

      <!-- Tags -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Tags (etiquetas)
        </label>
        <input
          v-model="tagsInput"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="economia, desarrollo, leyes (separados por comas)"
        />
        <div class="flex flex-wrap gap-2 mt-2">
          <span v-for="tag in form.tags" :key="tag" class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Vista previa del contenido -->
      <div v-if="form.content" class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-3">Vista previa</h3>
        <div class="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
          <RichContent :content="form.content" />
        </div>
      </div>

      <!-- Botones -->
      <div class="flex justify-end space-x-3 pt-4 border-t">
        <NuxtLink
          to="/admin/noticias"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </NuxtLink>
        <button
          type="submit"
          :disabled="saving"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
        >
          <span v-if="saving" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ saving ? 'Guardando...' : 'Publicar noticia' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNews } from '~/composables/useNews'
import TiptapEditor from '~/components/admin/TiptapEditor.vue'
import RichContent from '~/components/ui/RichContent.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const router = useRouter()
const { createNews, uploadImage: uploadImageApi } = useNews()

const saving = ref(false)
const uploadingImage = ref(false)
const uploadProgress = ref('')
const fileInput = ref<HTMLInputElement>()
const imagePreviewUrl = ref('')
const imagePreviewLabel = ref('')

const form = reactive({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'noticias',
  tags: [] as string[],
  status: 'draft' as 'draft' | 'published',
  featuredImage: { url: '', alt: '' }
})

const tagsInput = ref('')

watch(tagsInput, (newVal) => {
  form.tags = newVal.split(',').map(t => t.trim()).filter(t => t)
})

// Manejar selección de archivo
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Validar tipo de archivo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    alert('Formato no válido. Use JPG, PNG, WEBP o GIF.')
    return
  }

  // Validar tamaño (10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('La imagen no puede superar los 10MB')
    return
  }

  uploadingImage.value = true
  uploadProgress.value = 'Subiendo imagen...'

  try {
    const result = await uploadImageApi(file, form.title)
    form.featuredImage.url = result.url
    imagePreviewUrl.value = result.url
    imagePreviewLabel.value = `Imagen subida: ${result.originalName}`
    uploadProgress.value = '¡Imagen subida con éxito!'
    setTimeout(() => { uploadProgress.value = '' }, 3000)
  } catch (error: any) {
    console.error('Error:', error)
    alert(error.message || 'Error al subir la imagen')
    uploadProgress.value = ''
  } finally {
    uploadingImage.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

// Previsualizar URL externa
const previewImageUrl = () => {
  if (form.featuredImage.url) {
    imagePreviewUrl.value = form.featuredImage.url
    imagePreviewLabel.value = 'Vista previa desde URL'
  }
}

// Limpiar imagen
const clearImage = () => {
  form.featuredImage.url = ''
  imagePreviewUrl.value = ''
  imagePreviewLabel.value = ''
}

// Guardar noticia
const saveNews = async () => {
  if (!form.title.trim()) {
    alert('El título es requerido')
    return
  }
  if (!form.content.trim()) {
    alert('El contenido es requerido')
    return
  }

  saving.value = true
  try {
    await createNews(form)
    router.push('/admin/noticias')
  } catch (error: any) {
    console.error('Error:', error)
    alert(error.message || 'Error al crear la noticia')
  } finally {
    saving.value = false
  }
}
</script>