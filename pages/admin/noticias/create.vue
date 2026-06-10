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
          @blur="generateSlugFromTitle"
        />
        <p class="text-xs text-gray-500 mt-1">Usa *texto* para palabras en color rojo (ej: *Senado* aprueba ley)</p>
      </div>

      <!-- Slug -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Slug (URL amigable) <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.slug"
          type="text"
          required
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
          :class="slugValidation.isValid === false ? 'border-red-500 bg-red-50' : 'border-gray-300'"
          placeholder="ejemplo: nueva-ley-aprobada-2024"
          @input="validateSlug"
        />
        <div class="flex justify-between items-center mt-1">
          <div>
            <p v-if="slugValidation.error" class="text-xs text-red-500">
              {{ slugValidation.error }}
            </p>
            <p v-else-if="slugValidation.isValid === true" class="text-xs text-green-600">
              ✓ Formato de slug válido
            </p>
          </div>
          <button
            v-if="form.title"
            type="button"
            @click="generateSlugFromTitle"
            class="text-xs text-primary-600 hover:text-primary-700"
          >
            🔄 Generar desde título
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Solo letras minúsculas, números y guiones. Ej: "nueva-ley-aprobada"
        </p>
      </div>

      <!-- Extracto - OBLIGATORIO -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Extracto / Resumen <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="form.excerpt"
          rows="3"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500"
          :class="excerptCharCount > 300 ? 'border-red-500 bg-red-50' : 'border-gray-300'"
          placeholder="Breve descripción de la noticia (aparece en listados, SEO y redes sociales)"
          @input="validateExcerpt"
        ></textarea>
        <div class="flex justify-between items-center mt-1">
          <p class="text-xs" :class="excerptCharCount > 300 ? 'text-red-500' : 'text-gray-500'">
            {{ excerptCharCount }} / 300 caracteres
            <span v-if="excerptCharCount > 300" class="text-red-500 font-medium"> (¡Máximo excedido!)</span>
          </p>
          <p class="text-xs text-blue-600">
            📌 Este texto aparecerá en:
            <span class="font-medium">Listados de noticias | Google | Facebook | Twitter</span>
          </p>
        </div>
      </div>

      <!-- Contenido con editor -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Contenido <span class="text-red-500">*</span>
        </label>
        <TiptapEditor v-model="form.content" placeholder="Escribe el contenido de la noticia aquí..." />
      </div>

      <!-- ============================================ -->
      <!-- IMAGEN DESTACADA - OBLIGATORIA -->
      <!-- ============================================ -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">📷 Imagen Destacada <span class="text-red-500">*</span></h3>
        <p class="text-sm text-gray-500 mb-3">Esta será la primera imagen que aparecerá en el carrusel de la noticia</p>
        
        <div class="mb-4">
          <div class="flex gap-3 items-center flex-wrap">
            <label class="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Subir imagen destacada
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
          <p class="text-xs text-gray-500 mt-2">Formatos: JPG, PNG, WEBP, GIF. Máx 10MB</p>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Texto que aparecerá DEBAJO de la imagen <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.featuredImage.name"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Ej: Sesión Plenaria del Senado - 15 de marzo 2024"
          />
          <p class="text-xs text-blue-600 mt-1">📌 Este texto se mostrará debajo de la imagen en el carrusel del frontend</p>
        </div>
        
        <!-- VISTA PREVIA -->
        <div v-if="featuredPreviewUrl" class="mt-4 p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
          <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span class="text-green-600">✓</span> Vista previa:
          </h4>
          <div class="bg-white rounded-lg overflow-hidden shadow-md max-w-md mx-auto">
            <img :src="featuredPreviewUrl" class="w-full h-48 object-cover" />
            <div class="p-3 bg-gray-50 text-center">
              <p class="text-sm font-medium text-gray-700 truncate">
                {{ form.featuredImage.name || 'Sin texto' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- GALERÍA DE IMÁGENES -->
      <!-- ============================================ -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">🖼️ Galería de Imágenes</h3>
        <p class="text-sm text-gray-500 mb-3">Estas imágenes aparecerán después de la imagen destacada en el carrusel</p>
        
        <div class="mb-4">
          <div class="flex gap-3 items-center flex-wrap">
            <label class="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
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
          <p class="text-xs text-gray-500 mt-2">Formatos: JPG, PNG, WEBP, GIF. Máx 10MB</p>
        </div>
        
        <div class="space-y-3 mb-3 max-h-96 overflow-y-auto border rounded-lg p-3 bg-gray-50">
          <div v-for="(img, idx) in form.gallery" :key="idx" class="bg-white rounded-lg p-3 border shadow-sm">
            <div class="flex gap-4">
              <div class="flex-shrink-0">
                <img :src="img.url" class="h-20 w-20 object-cover rounded-lg" />
              </div>
              
              <div class="flex-1">
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Texto que aparecerá DEBAJO de la imagen <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="img.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  :placeholder="`Texto para imagen ${idx + 1}`"
                />
                <p class="text-xs text-blue-600 mt-1">📌 Este texto se mostrará debajo de esta imagen</p>
              </div>
              
              <button
                type="button"
                @click="removeGalleryImage(idx)"
                class="self-start px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
              >
                ✕ Eliminar
              </button>
            </div>
          </div>
          <div v-if="form.gallery.length === 0" class="text-center py-8 text-gray-500">
            No hay imágenes en la galería. Usa el botón "Subir imagen a galería" para agregar.
          </div>
        </div>
      </div>

      <!-- Categoría y Estado -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select v-model="form.category" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="noticia">📰 Noticia</option>
            <option value="importante">⭐ Importante</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select v-model="form.status" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="published">✅ Publicado</option>
            <option value="draft">📝 Borrador</option>
            <option value="archived">📦 Archivado</option>
          </select>
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
import { ref, reactive, watch, computed } from 'vue'
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
const featuredPreviewUrl = ref('')

// Contador de caracteres del extracto
const excerptCharCount = computed(() => form.excerpt?.length || 0)

// ============================================
// FUNCIONES DE SLUG
// ============================================
const slugUtils = {
  normalizeToSlug: (text: string): string => {
    if (!text) return ''
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-')
  },
  
  isValidSlug: (slug: string): boolean => {
    if (!slug) return false
    const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/
    return slugRegex.test(slug) && slug.length >= 3
  },
  
  getErrorMessage: (slug: string): string => {
    if (!slug) return 'El slug es requerido'
    if (slug.length < 3) return 'El slug debe tener al menos 3 caracteres'
    if (!/^[a-z0-9-]+$/.test(slug)) return 'El slug solo puede contener letras minúsculas, números y guiones'
    if (slug.startsWith('-') || slug.endsWith('-')) return 'El slug no puede comenzar ni terminar con guión'
    if (slug.includes('--')) return 'El slug no puede tener guiones consecutivos'
    return ''
  }
}

// Estado de validación del slug
const slugValidation = reactive({
  isValid: null as boolean | null,
  error: ''
})

const validateSlug = () => {
  const error = slugUtils.getErrorMessage(form.slug)
  slugValidation.error = error
  slugValidation.isValid = error === ''
}

const generateSlugFromTitle = () => {
  if (form.title) {
    const cleanTitle = form.title.replace(/\*/g, '')
    form.slug = slugUtils.normalizeToSlug(cleanTitle)
    validateSlug()
  }
}

// ============================================
// VALIDACIÓN DEL EXTRACTO
// ============================================
const validateExcerpt = () => {
  // Solo validación visual
}

// ============================================
// CONVERTIR HTML A BLOQUES - CORREGIDO
// ============================================
const convertirHTMLaBloques = (htmlContent: string) => {
  if (!htmlContent) return []
  
  const bloques: any[] = []
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent
  
  const procesarTextoConMarcadores = (texto: string) => {
    if (!texto) return []
    
    const resultados: any[] = []
    let textoRestante = texto
    let lastIndex = 0
    
    // Buscar marcadores de VIDEO
    const videoRegex = /\[\[VIDEO:(.*?)\|(.*?)\|(.*?)\]\]/g
    let match
    
    while ((match = videoRegex.exec(textoRestante)) !== null) {
      if (match.index > lastIndex) {
        const textoAntes = textoRestante.substring(lastIndex, match.index).trim()
        if (textoAntes) {
          resultados.push({ type: 'paragraph', content: `<p>${textoAntes}</p>` })
        }
      }
      
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
    
    // Buscar marcadores de CITA - CORREGIDO
    let textoPostVideo = textoRestante.substring(lastIndex)
    const citaRegex = /\[\[CITA:(.*?)\|(.*?)\|(.*?)\]\]/g
    lastIndex = 0
    
    while ((match = citaRegex.exec(textoPostVideo)) !== null) {
      if (match.index > lastIndex) {
        const textoAntes = textoPostVideo.substring(lastIndex, match.index).trim()
        if (textoAntes) {
          resultados.push({ type: 'paragraph', content: `<p>${textoAntes}</p>` })
        }
      }
      
      // Extraer y limpiar datos
      let autor = match[1] || 'Senado de Bolivia'
      let cargo = match[2] || 'Cámara de Senadores'
      let texto = match[3] || ''
      
      // Limpiar saltos de línea y espacios extras
      autor = autor.trim().replace(/\n/g, ' ')
      cargo = cargo.trim().replace(/\n/g, ' ')
      texto = texto.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ')
      
      console.log('📝 Cita detectada:', { autor, cargo, texto: texto.substring(0, 50) + '...' })
      
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
  
  console.log('📦 Bloques generados:', bloques.length)
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
  featuredImage: { url: '', alt: '', name: '' },
  gallery: [] as { url: string; alt: string; name: string }[]
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
    const result = await uploadImageApi(file, form.title || 'imagen', form.title)
    form.featuredImage.url = result.url
    form.featuredImage.name = form.title || 'Imagen destacada'
    form.featuredImage.alt = form.title || ''
    featuredPreviewUrl.value = result.url
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
    const result = await uploadImageApi(file, `Imagen ${form.gallery.length + 1}`, form.title)
    form.gallery.push({
      url: result.url,
      alt: form.title || '',
      name: `Imagen ${form.gallery.length + 1}`
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

// Guardar noticia
const saveNews = async () => {
  if (!authStore.isAuthenticated) {
    alert('Tu sesión expiró. Por favor, inicia sesión nuevamente.')
    router.push('/auth/login')
    return
  }

  // Validaciones
  if (!form.title.trim()) {
    alert('El título es requerido')
    return
  }
  
  if (!form.slug.trim()) {
    alert('El slug es requerido')
    return
  }
  if (!slugUtils.isValidSlug(form.slug)) {
    alert(slugUtils.getErrorMessage(form.slug))
    return
  }
  
  if (!form.excerpt?.trim()) {
    alert('El extracto/resumen es obligatorio. Aparecerá en Google, redes sociales y listados de noticias.')
    return
  }
  if (form.excerpt.length > 300) {
    alert(`El extracto excede los 300 caracteres. Actualmente tiene ${form.excerpt.length} caracteres.`)
    return
  }
  
  if (!form.content.trim()) {
    alert('El contenido es requerido')
    return
  }
  
  if (!form.featuredImage.url) {
    alert('La imagen destacada es obligatoria. Sube una imagen.')
    return
  }
  if (!form.featuredImage.name?.trim()) {
    alert('La imagen destacada debe tener un texto que aparecerá debajo')
    return
  }
  
  for (const img of form.gallery) {
    if (!img.name?.trim()) {
      alert('Todas las imágenes de la galería deben tener un texto que aparecerá debajo')
      return
    }
  }

  saving.value = true
  
  const bloques = convertirHTMLaBloques(form.content)
  console.log('📦 Bloques a guardar:', JSON.stringify(bloques, null, 2))
  
  try {
    await createNews({
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      blocks: bloques,
      category: form.category,
      tags: form.tags,
      status: form.status,
      featuredImage: {
        url: form.featuredImage.url,
        alt: form.featuredImage.alt || form.title || '',
        name: form.featuredImage.name,
        caption: form.featuredImage.name
      },
      gallery: form.gallery.map((img, idx) => ({
        url: img.url,
        alt: img.alt || form.title || '',
        name: img.name,
        caption: img.name,
        order: idx
      }))
    })
    router.push('/admin/noticias')
  } catch (error: any) {
    console.error('Error:', error)
    alert(error.message || 'Error al crear la noticia')
  } finally {
    saving.value = false
  }
}
</script>