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
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Título de la noticia"
        />
        <p class="text-xs text-gray-500 mt-1">Usa *texto* para palabras en color rojo (ej: *Senado* aprueba ley)</p>
      </div>

      <!-- Slug -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Slug (URL amigable)
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
        <p class="text-xs text-gray-500 mt-1">Máximo 300 caracteres</p>
      </div>

      <!-- Contenido con editor -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Contenido <span class="text-red-500">*</span>
        </label>
        <TiptapEditor v-model="form.content" placeholder="Escribe el contenido de la noticia aquí..." />
      </div>

      <!-- Imagen destacada -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Imagen destacada
        </label>
        
        <div class="mb-3">
          <div class="flex gap-3 items-center flex-wrap">
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
          <p class="text-xs text-gray-500 mt-1">O pega una URL de imagen externa</p>
        </div>
        
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

      <!-- Galería de imágenes -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Galería de imágenes
        </label>
        
        <div class="mb-3">
          <div class="flex gap-3 items-center flex-wrap">
            <label class="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Subir imagen a galería
              <input 
                ref="galleryFileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                class="hidden"
                @change="handleGalleryFileSelect"
              />
            </label>
            <span v-if="uploadingGalleryImage" class="text-sm text-gray-500 flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              Subiendo...
            </span>
            <span v-if="galleryUploadProgress" class="text-sm text-green-600">{{ galleryUploadProgress }}</span>
          </div>
        </div>
        
        <div class="space-y-2 mb-3">
          <div v-for="(img, idx) in form.gallery" :key="idx" class="flex gap-2 items-center">
            <div class="relative">
              <img :src="img.url" class="h-16 w-16 object-cover rounded-lg" />
            </div>
            <input
              v-model="img.url"
              type="text"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
              readonly
            />
            <button
              type="button"
              @click="removeGalleryImage(idx)"
              class="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div class="flex gap-2">
          <input
            v-model="nuevaGalleryUrl"
            type="url"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          <button
            type="button"
            @click="agregarGalleryUrlManual"
            class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Agregar URL
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-1">Pega una URL externa o sube una imagen</p>
      </div>

      <!-- Categoría y Estado -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select v-model="form.category" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="noticia">📰 Noticia</option>
            <option value="importante">⭐ Importante</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">
            <span class="font-medium">Noticia:</span> Contenido informativo regular<br>
            <span class="font-medium">Importante:</span> Noticias destacadas (aparecen en "Hechos Destacados")
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select v-model="form.status" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="published">✅ Publicado</option>
            <option value="draft">📝 Borrador</option>
            <option value="archived">📦 Archivado</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">
            <span class="font-medium">Publicado:</span> Visible en el portal<br>
            <span class="font-medium">Borrador:</span> Solo visible en el panel<br>
            <span class="font-medium">Archivado:</span> No visible en el portal
          </p>
        </div>
      </div>

      <!-- Tags -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
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
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useNews } from '~/composables/useNews'
import TiptapEditor from '~/components/admin/TiptapEditor.vue'

definePageMeta({ layout: 'default', middleware: 'auth' })

const router = useRouter()
const authStore = useAuthStore()
const { createNews, uploadImage: uploadImageApi } = useNews()

const saving = ref(false)

// Variables para imágenes
const fileInput = ref<HTMLInputElement>()
const galleryFileInput = ref<HTMLInputElement>()
const uploadingImage = ref(false)
const uploadingGalleryImage = ref(false)
const uploadProgress = ref('')
const galleryUploadProgress = ref('')
const imagePreviewUrl = ref('')
const imagePreviewLabel = ref('')
const nuevaGalleryUrl = ref('')

// ============================================
// CONVERTIR HTML A BLOQUES - VERSIÓN CORREGIDA
// ============================================
const convertirHTMLaBloques = (htmlContent: string) => {
  if (!htmlContent) return []
  
  const bloques: any[] = []
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent
  
  // Función para procesar texto y extraer marcadores
  const procesarTextoConMarcadores = (texto: string) => {
    if (!texto) return []
    
    const resultados: any[] = []
    let textoRestante = texto
    let lastIndex = 0
    
    // Buscar marcadores de VIDEO
    const videoRegex = /\[\[VIDEO:(.*?)\|(.*?)\|(.*?)\]\]/g
    let match
    
    while ((match = videoRegex.exec(textoRestante)) !== null) {
      // Texto antes del marcador
      if (match.index > lastIndex) {
        const textoAntes = textoRestante.substring(lastIndex, match.index).trim()
        if (textoAntes) {
          resultados.push({ type: 'paragraph', content: `<p>${textoAntes}</p>` })
        }
      }
      
      // Agregar bloque de video
      const url = match[1]
      const title = match[2] || 'Video'
      const caption = match[3] || ''
      
      let embedUrl = url
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1]?.split('&')[0]
        embedUrl = `https://www.youtube.com/embed/${videoId}`
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0]
        embedUrl = `https://www.youtube.com/embed/${videoId}`
      }
      
      resultados.push({
        type: 'video',
        url: embedUrl,
        title: title,
        caption: caption
      })
      
      lastIndex = match.index + match[0].length
    }
    
    // Procesar CITAS en el texto restante
    let textoPostVideo = textoRestante.substring(lastIndex)
    const citaRegex = /\[\[CITA:(.*?)\|(.*?)\|(.*?)\]\]/g
    lastIndex = 0
    
    while ((match = citaRegex.exec(textoPostVideo)) !== null) {
      // Texto antes de la cita
      if (match.index > lastIndex) {
        const textoAntes = textoPostVideo.substring(lastIndex, match.index).trim()
        if (textoAntes) {
          resultados.push({ type: 'paragraph', content: `<p>${textoAntes}</p>` })
        }
      }
      
      // Agregar bloque de cita
      const autor = match[1] || 'Senado de Bolivia'
      const cargo = match[2] || 'Cámara de Senadores'
      const texto = match[3] || ''
      
      resultados.push({
        type: 'quote',
        content: texto,
        author: autor,
        role: cargo
      })
      
      lastIndex = match.index + match[0].length
    }
    
    // Texto después del último marcador
    const textoFinal = textoPostVideo.substring(lastIndex).trim()
    if (textoFinal) {
      resultados.push({ type: 'paragraph', content: `<p>${textoFinal}</p>` })
    }
    
    return resultados
  }
  
  // Procesar cada nodo del HTML
  tempDiv.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      const resultados = procesarTextoConMarcadores(node.textContent)
      resultados.forEach(r => bloques.push(r))
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement
      const tagName = element.tagName.toLowerCase()
      
      if (tagName === 'p') {
        const innerHtml = element.innerHTML
        if (innerHtml.includes('[[VIDEO:') || innerHtml.includes('[[CITA:')) {
          const resultados = procesarTextoConMarcadores(innerHtml)
          resultados.forEach(r => bloques.push(r))
        } else {
          bloques.push({ type: 'paragraph', content: innerHtml })
        }
      } 
      else if (tagName === 'blockquote') {
        const author = element.getAttribute('data-author') || 'Senado de Bolivia'
        const role = element.getAttribute('data-role') || 'Cámara de Senadores'
        const quoteText = element.textContent?.trim() || ''
        const cleanText = quoteText.replace(/—.*$/, '').trim()
        
        bloques.push({
          type: 'quote',
          content: cleanText,
          author: author,
          role: role
        })
      } 
      else if (tagName === 'div' && element.getAttribute('data-type') === 'video') {
        const iframe = element.querySelector('iframe')
        const captionEl = element.querySelector('.video-caption')
        if (iframe) {
          bloques.push({
            type: 'video',
            url: iframe.getAttribute('src') || '',
            title: iframe.getAttribute('title') || '',
            caption: captionEl?.textContent || ''
          })
        }
      } 
      else if (tagName === 'iframe') {
        bloques.push({
          type: 'video',
          url: element.getAttribute('src') || '',
          title: element.getAttribute('title') || 'Video institucional',
          caption: ''
        })
      } 
      else {
        bloques.push({ type: 'paragraph', content: element.outerHTML })
      }
    }
  })
  
  return bloques
}

// ============================================
// FORMULARIO
// ============================================
const form = reactive({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'noticia' as 'noticia' | 'importante',
  tags: [] as string[],
  status: 'published' as 'draft' | 'published' | 'archived',
  featuredImage: { url: '', alt: '' },
  gallery: [] as { url: string; alt: string; caption: string; order: number }[]
})

const tagsInput = ref('')

watch(tagsInput, (newVal) => {
  form.tags = newVal.split(',').map(t => t.trim()).filter(t => t)
})

const removeGalleryImage = (idx: number) => {
  form.gallery.splice(idx, 1)
}

// Subir imagen destacada
const handleFileSelect = async (event: Event) => {
  if (!authStore.isAuthenticated) {
    alert('Tu sesión expiró. Por favor, inicia sesión nuevamente.')
    router.push('/auth/login')
    return
  }

  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    alert('Formato no válido. Use JPG, PNG, WEBP o GIF.')
    return
  }

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

// Subir imagen a galería
const handleGalleryFileSelect = async (event: Event) => {
  if (!authStore.isAuthenticated) {
    alert('Tu sesión expiró. Por favor, inicia sesión nuevamente.')
    router.push('/auth/login')
    return
  }

  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    alert('Formato no válido. Use JPG, PNG, WEBP o GIF.')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    alert('La imagen no puede superar los 10MB')
    return
  }

  uploadingGalleryImage.value = true
  galleryUploadProgress.value = 'Subiendo imagen...'

  try {
    const result = await uploadImageApi(file, form.title)
    form.gallery.push({
      url: result.url,
      alt: form.title,
      caption: '',
      order: form.gallery.length
    })
    galleryUploadProgress.value = '¡Imagen subida con éxito!'
    setTimeout(() => { galleryUploadProgress.value = '' }, 3000)
  } catch (error: any) {
    console.error('Error:', error)
    alert(error.message || 'Error al subir la imagen')
    galleryUploadProgress.value = ''
  } finally {
    uploadingGalleryImage.value = false
    if (galleryFileInput.value) galleryFileInput.value.value = ''
  }
}

// Agregar URL manual a galería
const agregarGalleryUrlManual = () => {
  if (nuevaGalleryUrl.value && nuevaGalleryUrl.value.trim()) {
    form.gallery.push({
      url: nuevaGalleryUrl.value,
      alt: form.title,
      caption: '',
      order: form.gallery.length
    })
    nuevaGalleryUrl.value = ''
  }
}

const previewImageUrl = () => {
  if (form.featuredImage.url) {
    imagePreviewUrl.value = form.featuredImage.url
    imagePreviewLabel.value = 'Vista previa desde URL'
  }
}

const clearImage = () => {
  form.featuredImage.url = ''
  imagePreviewUrl.value = ''
  imagePreviewLabel.value = ''
}

const saveNews = async () => {
  if (!authStore.isAuthenticated) {
    alert('Tu sesión expiró. Por favor, inicia sesión nuevamente.')
    router.push('/auth/login')
    return
  }

  if (!form.title.trim()) {
    alert('El título es requerido')
    return
  }
  if (!form.content.trim()) {
    alert('El contenido es requerido')
    return
  }

  saving.value = true
  
  const bloques = convertirHTMLaBloques(form.content)
  console.log('📦 [create] Bloques a guardar:', JSON.stringify(bloques, null, 2))
  
  try {
    await createNews({
      title: form.title,
      slug: form.slug || undefined,
      excerpt: form.excerpt,
      content: form.content,
      blocks: bloques,
      category: form.category,
      tags: form.tags,
      status: form.status,
      featuredImage: form.featuredImage,
      gallery: form.gallery
    })
    router.push('/admin/noticias')
  } catch (error: any) {
    console.error('Error:', error)
    alert(error.message || 'Error al crear la noticia')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
  }
})
</script>
