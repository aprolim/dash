<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin/noticias" class="text-gray-400 hover:text-gray-600 text-2xl">
        ←
      </NuxtLink>
      <h1 class="text-2xl font-semibold text-gray-900">Editar Noticia</h1>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando noticia...</p>
    </div>

    <div v-else-if="error" class="text-center py-12 text-red-600">
      {{ error }}
    </div>

    <form v-else @submit.prevent="saveNews" class="space-y-6">
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

      <!-- Extracto -->
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
            📌 Este texto aparecerá en: <span class="font-medium">Listados de noticias | Google | Facebook | Twitter</span>
          </p>
        </div>
      </div>

      <!-- Contenido -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Contenido <span class="text-red-500">*</span>
        </label>
        <TiptapEditor v-model="form.content" placeholder="Escribe el contenido de la noticia aquí..." />
      </div>

      <!-- Imagen Destacada -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">📷 Imagen Destacada <span class="text-red-500">*</span></h3>
        <p class="text-sm text-gray-500 mb-3">Esta será la primera imagen que aparecerá en el carrusel de la noticia</p>
        
        <div class="mb-4">
          <div class="flex gap-3 items-center flex-wrap">
            <label class="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Subir/Reemplazar imagen
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

      <!-- Galería -->
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

      <!-- 🔥 SENADORES PARTICIPANTES -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">👥 Senadores Participantes</h3>
        <p class="text-sm text-gray-500 mb-3">
          Selecciona los senadores que participaron en esta noticia
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Buscar senador
            </label>
            <div class="relative">
              <input
                v-model="busquedaSenador"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Escribe el nombre del senador..."
                @input="filtrarSenadores"
              />
              <div v-if="senadoresFiltrados.length > 0 && busquedaSenador" 
                   class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                <div
                  v-for="senador in senadoresFiltrados"
                  :key="senador.id"
                  @click="agregarSenador(senador)"
                  class="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <img 
                    :src="senador.foto" 
                    :alt="senador.name"
                    class="w-8 h-8 rounded-full object-cover"
                    @error="(e) => e.target.src = '/images/default-avatar.png'"
                  />
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ senador.name }}</p>
                    <p class="text-xs text-gray-500">{{ senador.department }} • {{ senador.partyShort }}</p>
                  </div>
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1">Busca por nombre, departamento o partido</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Senadores seleccionados ({{ form.participantes.length }})
            </label>
            <div class="border border-gray-200 rounded-lg p-3 min-h-[100px] bg-gray-50">
              <div v-if="form.participantes.length === 0" class="text-center text-gray-400 py-4">
                No hay senadores seleccionados
              </div>
              <div v-else class="flex flex-wrap gap-2">
                <div
                  v-for="senador in senadoresSeleccionados"
                  :key="senador.id"
                  class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm"
                >
                  <img 
                    :src="senador.foto" 
                    :alt="senador.name"
                    class="w-6 h-6 rounded-full object-cover"
                    @error="(e) => e.target.src = '/images/default-avatar.png'"
                  />
                  <span class="text-sm font-medium text-gray-700">{{ senador.name }}</span>
                  <button
                    type="button"
                    @click="removerSenador(senador.id)"
                    class="text-red-500 hover:text-red-700 text-sm ml-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sugerencias por departamento -->
        <div class="mt-3">
          <p class="text-xs text-gray-500 mb-2">Agregar todos los senadores de un departamento:</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="dept in departamentos"
              :key="dept"
              type="button"
              @click="agregarSenadoresPorDepartamento(dept)"
              class="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition"
            >
              + {{ dept }}
            </button>
          </div>
        </div>
      </div>

      <!-- Categoría, Estado y Programación -->
      <div class="border-t pt-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select v-model="form.category" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="noticia">📰 Noticia</option>
              <option value="importante">⭐ Importante</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado de publicación</label>
            <select 
              v-model="form.status" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="draft">📝 Borrador</option>
              <option value="published">✅ Publicar ahora</option>
              <option value="scheduled">⏰ Programar</option>
              <option value="archived">📦 Archivado</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              "Programar" permite definir fecha y hora de publicación futura
            </p>
          </div>
        </div>

        <!-- Advertencias visuales según estado -->
        <div v-if="form.status === 'draft' && (form.publishedDate || form.scheduledDate)" 
             class="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p class="text-sm text-yellow-800">
            ⚠️ <strong>Nota:</strong> Esta noticia está en <strong>BORRADOR</strong>.
            La fecha que configures se guardará pero NO se usará para publicación automática.
          </p>
        </div>
        
        <div v-if="form.status === 'published' && isFutureDate" 
             class="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-800">
            ❌ <strong>Error:</strong> Para "Publicar ahora", la fecha debe ser ACTUAL o PASADA.
          </p>
        </div>
        
        <div v-if="form.status === 'scheduled' && isScheduledPastDate" 
             class="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-800">
            ❌ <strong>Error:</strong> Para "Programar", la fecha debe ser FUTURA.
          </p>
        </div>
        
        <div v-if="form.status === 'scheduled' && (!form.scheduledDate || !form.scheduledTime)" 
             class="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-800">
            ❌ <strong>Error:</strong> Para programar una noticia, debes especificar <strong>fecha y hora</strong>.
          </p>
        </div>
        
        <!-- Fecha y hora de programación -->
        <div v-if="form.status === 'scheduled'" class="mt-4 border-l-4 border-yellow-400 pl-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.scheduledDate"
                type="date"
                :min="minDate"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Hora <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.scheduledTime"
                type="time"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <p class="text-xs text-yellow-600 mt-2">
            ⏰ La noticia será visible automáticamente el {{ form.scheduledDate || 'YYYY-MM-DD' }} a las {{ form.scheduledTime || 'HH:MM' }}
          </p>
        </div>

        <!-- Fecha de Publicación -->
        <div class="mt-4 border-t border-gray-200 pt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-3">📅 Fecha de Publicación</h4>
          <p class="text-xs text-gray-500 mb-2">
            Por defecto se usa la fecha/hora actual. 
            <span v-if="form.status === 'draft'" class="text-yellow-600">
              ⚠️ En borrador, la fecha se guarda pero NO se usa.
            </span>
            <span v-if="form.status === 'published'" class="text-green-600">
              ✅ Se usará esta fecha al publicar.
            </span>
            <span v-if="form.status === 'archived'" class="text-gray-600">
              📦 En archivado, la fecha se guarda pero NO se usa.
            </span>
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                v-model="form.publishedDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Hora
              </label>
              <input
                v-model="form.publishedTime"
                type="time"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div class="flex items-end">
              <button
                type="button"
                @click="setNow"
                class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                📅 Usar ahora
              </button>
            </div>
          </div>
          
          <div v-if="form.publishedDate && form.publishedTime" class="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <p class="text-sm text-green-700">
              <span class="font-medium">📝 Fecha configurada:</span> 
              {{ form.publishedDate }} a las {{ form.publishedTime }}
            </p>
          </div>
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
          {{ saving ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useNews } from '~/composables/useNews'
import { useSenadores } from '~/composables/useSenadores'
import TiptapEditor from '~/components/admin/TiptapEditor.vue'

definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { getNewsById, updateNews, uploadImage: uploadImageApi } = useNews()
const { getSenadoresList, getSenadorById, getSenadoresByDepartment } = useSenadores()

const API_BASE_URL = 'http://demoback.senado.gob.bo/api'

const loading = ref(true)
const saving = ref(false)
const error = ref(null)

const fileInput = ref(null)
const galleryFileInput = ref(null)
const uploadingImage = ref(false)
const uploadingGalleryImage = ref(false)
const uploadProgress = ref('')
const galleryUploadProgress = ref('')
const featuredPreviewUrl = ref('')

// ============================================
// SENADORES PARTICIPANTES
// ============================================
const busquedaSenador = ref('')
const senadoresFiltrados = ref([])
const todosLosSenadores = ref(getSenadoresList())

const departamentos = computed(() => {
  const depts = new Set()
  todosLosSenadores.value.forEach(s => depts.add(s.department))
  return Array.from(depts).sort()
})

const senadoresSeleccionados = computed(() => {
  return form.participantes
    .map(id => getSenadorById(id))
    .filter(Boolean)
})

const filtrarSenadores = () => {
  const query = busquedaSenador.value.toLowerCase().trim()
  if (!query) {
    senadoresFiltrados.value = []
    return
  }
  
  senadoresFiltrados.value = todosLosSenadores.value.filter(s => {
    if (form.participantes.includes(s.id)) return false
    
    const nameMatch = s.name.toLowerCase().includes(query)
    const deptMatch = s.department.toLowerCase().includes(query)
    const partyMatch = s.partyShort.toLowerCase().includes(query)
    const partyFullMatch = s.party.toLowerCase().includes(query)
    
    return nameMatch || deptMatch || partyMatch || partyFullMatch
  }).slice(0, 10)
}

const agregarSenador = (senador) => {
  if (!form.participantes.includes(senador.id)) {
    form.participantes.push(senador.id)
  }
  busquedaSenador.value = ''
  senadoresFiltrados.value = []
}

const removerSenador = (id) => {
  form.participantes = form.participantes.filter(p => p !== id)
}

const agregarSenadoresPorDepartamento = (departamento) => {
  const senadoresDept = getSenadoresByDepartment(departamento)
  const ids = senadoresDept.map(s => s.id)
  const nuevosIds = ids.filter(id => !form.participantes.includes(id))
  form.participantes.push(...nuevosIds)
}

// ============================================
// EXCERPT VALIDATION
// ============================================
const excerptCharCount = computed(() => form.excerpt?.length || 0)

// ============================================
// FECHA
// ============================================
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const isFutureDate = computed(() => {
  if (!form.publishedDate || !form.publishedTime) return false
  const fechaPub = new Date(`${form.publishedDate}T${form.publishedTime}:00`)
  return fechaPub > new Date()
})

const isScheduledPastDate = computed(() => {
  if (!form.scheduledDate || !form.scheduledTime) return false
  const fechaProg = new Date(`${form.scheduledDate}T${form.scheduledTime}:00`)
  return fechaProg <= new Date()
})

// ============================================
// SLUG VALIDATION
// ============================================
const slugValidation = reactive({ 
  isValid: null, 
  error: '' 
})

const slugUtils = {
  normalizeToSlug: (text) => {
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
  isValidSlug: (slug) => {
    if (!slug) return false
    const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/
    return slugRegex.test(slug) && slug.length >= 3
  },
  getErrorMessage: (slug) => {
    if (!slug) return 'El slug es requerido'
    if (slug.length < 3) return 'El slug debe tener al menos 3 caracteres'
    if (!/^[a-z0-9-]+$/.test(slug)) return 'El slug solo puede contener letras minúsculas, números y guiones'
    if (slug.startsWith('-') || slug.endsWith('-')) return 'El slug no puede comenzar ni terminar con guión'
    if (slug.includes('--')) return 'El slug no puede tener guiones consecutivos'
    return ''
  }
}

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

const validateExcerpt = () => {}

const checkSlugExists = async (slug, excludeId) => {
  if (!slug) return false
  try {
    const response = await fetch(`${API_BASE_URL}/content/slug/${slug}`)
    if (response.status === 404) return false
    if (response.ok) {
      const result = await response.json()
      const existingNewsId = result.data?._id
      return existingNewsId !== null && existingNewsId !== undefined && existingNewsId !== excludeId
    }
    return false
  } catch {
    return false
  }
}

// ============================================
// FORM
// ============================================
const form = reactive({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'noticia',
  tags: [],
  status: 'draft',
  scheduledDate: '',
  scheduledTime: '',
  publishedDate: '',
  publishedTime: '',
  publishedAt: null,
  participantes: [], // 🔥 NUEVO: IDs de senadores
  featuredImage: { url: '', alt: '', name: '' },
  gallery: []
})

const setNow = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  form.publishedDate = `${year}-${month}-${day}`
  form.publishedTime = `${hours}:${minutes}`
}

const tagsInput = ref('')

watch(tagsInput, (newVal) => {
  form.tags = newVal.split(',').map(t => t.trim()).filter(t => t)
})

// ============================================
// IMAGENES
// ============================================
const removeGalleryImage = (idx) => {
  form.gallery.splice(idx, 1)
}

const handleFileSelect = async (event) => {
  if (!authStore.isAuthenticated) {
    alert('Tu sesión expiró. Por favor, inicia sesión nuevamente.')
    router.push('/auth/login')
    return
  }

  const target = event.target
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
  } catch (error) {
    console.error('Error:', error)
    alert(error.message || 'Error al subir la imagen')
    uploadProgress.value = ''
  } finally {
    uploadingImage.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

const handleGalleryFileSelect = async (event) => {
  if (!authStore.isAuthenticated) {
    alert('Tu sesión expiró. Por favor, inicia sesión nuevamente.')
    router.push('/auth/login')
    return
  }

  const target = event.target
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
  } catch (error) {
    console.error('Error:', error)
    alert(error.message || 'Error al subir la imagen')
    galleryUploadProgress.value = ''
  } finally {
    uploadingGalleryImage.value = false
    if (galleryFileInput.value) galleryFileInput.value.value = ''
  }
}

// ============================================
// CONVERTIR BLOQUES A HTML
// ============================================
const convertirBloquesAHTML = (blocks) => {
  if (!blocks || blocks.length === 0) return ''
  let html = ''
  for (const block of blocks) {
    if (block.type === 'paragraph') {
      html += `<p>${block.content}</p>`
    } else if (block.type === 'quote') {
      const author = (block.author || 'Senado de Bolivia').trim()
      const role = (block.role || 'Cámara de Senadores').trim()
      const content = (block.content || '').trim()
      html += `<p>[[CITA:${author}|${role}|${content}]]</p>`
    } else if (block.type === 'video') {
      const url = block.url || ''
      const title = block.title || 'Video'
      const caption = block.caption || ''
      html += `<p>[[VIDEO:${url}|${title}|${caption}]]</p>`
    }
  }
  return html
}

// ============================================
// CARGAR NOTICIA
// ============================================
const loadNews = async () => {
  const id = route.params.id
  try {
    loading.value = true
    const news = await getNewsById(id)
    
    form.title = news.title
    form.slug = news.slug
    form.excerpt = news.excerpt || ''
    
    if (news.blocks && news.blocks.length > 0) {
      form.content = convertirBloquesAHTML(news.blocks)
    } else {
      form.content = news.content || ''
    }
    
    form.category = news.category || 'noticia'
    form.tags = news.tags || []
    form.status = news.status || 'draft'
    form.publishedAt = news.publishedAt || null
    
    // 🔥 Cargar participantes
    if (news.participantes && Array.isArray(news.participantes)) {
      form.participantes = news.participantes
    } else {
      form.participantes = []
    }
    
    // Cargar fechas según estado
    if (news.status === 'scheduled' && news.scheduledFor) {
      const dateObj = new Date(news.scheduledFor)
      form.scheduledDate = dateObj.toISOString().split('T')[0]
      form.scheduledTime = dateObj.toTimeString().slice(0, 5)
      form.publishedDate = ''
      form.publishedTime = ''
    } else if (news.publishedAt) {
      const dateObj = new Date(news.publishedAt)
      form.publishedDate = dateObj.toISOString().split('T')[0]
      form.publishedTime = dateObj.toTimeString().slice(0, 5)
      form.scheduledDate = ''
      form.scheduledTime = ''
    }
    
    if (news.featuredImage) {
      form.featuredImage = {
        url: news.featuredImage.url || '',
        alt: news.featuredImage.alt || '',
        name: news.featuredImage.name || news.featuredImage.caption || news.title || 'Imagen destacada'
      }
      if (form.featuredImage.url) {
        featuredPreviewUrl.value = form.featuredImage.url
      }
    }
    
    if (news.gallery && Array.isArray(news.gallery)) {
      form.gallery = news.gallery.map((img) => ({
        url: img.url,
        alt: img.alt || '',
        name: img.name || img.caption || 'Imagen'
      }))
    }
    
    tagsInput.value = form.tags.join(', ')
    validateSlug()
    
  } catch (err) {
    console.error('Error cargando noticia:', err)
    error.value = err.message || 'Error al cargar la noticia'
  } finally {
    loading.value = false
  }
}

// ============================================
// GUARDAR NOTICIA
// ============================================
const saveNews = async () => {
  if (!authStore.isAuthenticated) {
    alert('Tu sesión expiró. Por favor, inicia sesión nuevamente.')
    router.push('/auth/login')
    return
  }

  // Validaciones básicas
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
  
  const currentId = route.params.id
  const slugExists = await checkSlugExists(form.slug, currentId)
  if (slugExists) {
    alert(`❌ ERROR: El slug "${form.slug}" ya está siendo usado por otra noticia.\n\nPor favor, cambia el slug (URL amigable) e intenta nuevamente.`)
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

  // Validaciones de estado y fechas
  if (form.status === 'draft' && (form.publishedDate || form.scheduledDate)) {
    if (!confirm(
      '⚠️ Has configurado una fecha para esta noticia pero está en estado BORRADOR.\n\n' +
      'La fecha se GUARDARÁ pero NO se usará para publicar automáticamente.\n\n' +
      '¿Deseas continuar?'
    )) {
      return
    }
  }

  if (form.status === 'published') {
    if (form.publishedDate && form.publishedTime) {
      const fechaPub = new Date(`${form.publishedDate}T${form.publishedTime}:00`)
      const ahora = new Date()
      if (fechaPub > ahora) {
        alert('❌ Para "Publicar ahora", la fecha debe ser ACTUAL o PASADA.\n\n' +
              'Si quieres que se publique automáticamente en el futuro, usa "Programar".')
        return
      }
    } else {
      setNow()
    }
  }

  if (form.status === 'scheduled') {
    if (!form.scheduledDate || !form.scheduledTime) {
      alert('❌ Para programar una noticia, debes especificar fecha y hora.')
      return
    }
    const fechaProg = new Date(`${form.scheduledDate}T${form.scheduledTime}:00`)
    const ahora = new Date()
    if (fechaProg <= ahora) {
      alert('❌ Para "Programar", la fecha debe ser FUTURA.\n\n' +
            'Si quieres publicar ahora, usa "Publicar ahora".')
      return
    }
  }

  if (form.status === 'archived' && (form.publishedDate || form.scheduledDate)) {
    if (!confirm(
      '⚠️ Has configurado una fecha para esta noticia pero está ARCHIVADA.\n\n' +
      'La fecha se GUARDARÁ pero NO se usará porque la noticia está archivada.\n\n' +
      '¿Deseas continuar?'
    )) {
      return
    }
  }

  saving.value = true
  const id = route.params.id
  
  // Construir fechas
  let publishedAt = null
  if (form.status === 'published' && form.publishedDate && form.publishedTime) {
    publishedAt = new Date(`${form.publishedDate}T${form.publishedTime}:00`).toISOString()
  } else if ((form.status === 'draft' || form.status === 'archived') && form.publishedDate && form.publishedTime) {
    publishedAt = new Date(`${form.publishedDate}T${form.publishedTime}:00`).toISOString()
  } else if (form.publishedAt) {
    publishedAt = new Date(form.publishedAt).toISOString()
  }
  
  let scheduledFor = null
  if (form.status === 'scheduled' && form.scheduledDate && form.scheduledTime) {
    scheduledFor = new Date(`${form.scheduledDate}T${form.scheduledTime}:00`).toISOString()
  }
  
  // 🔥 PAYLOAD CON PARTICIPANTES
  const payload = {
    title: form.title,
    slug: form.slug,
    excerpt: form.excerpt,
    content: form.content,
    category: form.category,
    tags: form.tags,
    status: form.status,
    participantes: form.participantes, // 🔥 NUEVO
    publishedAt: publishedAt,
    scheduledFor: scheduledFor,
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
  }
  
  try {
    await updateNews(id, payload)
    router.push('/admin/noticias?reload=true')
  } catch (error) {
    console.error('Error:', error)
    if (error.message?.includes('duplicate key') || error.message?.includes('E11000')) {
      alert(`❌ ERROR: El slug "${form.slug}" ya está siendo usado por otra noticia.\n\nPor favor, cambia el slug e intenta nuevamente.`)
    } else {
      alert(error.message || 'Error al guardar los cambios')
    }
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
    return
  }
  loadNews()
})
</script>