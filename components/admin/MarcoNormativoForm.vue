<!-- components/admin/MarcoNormativoForm.vue -->
<template>
  <form @submit.prevent="enviar" class="space-y-6 max-w-4xl">

    <!-- Error general -->
    <div v-if="serverError" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
      {{ serverError }}
    </div>

    <!-- ============================================ -->
    <!-- DATOS DEL DOCUMENTO                          -->
    <!-- ============================================ -->
    <section class="bg-white rounded-lg shadow-sm p-5">
      <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">
        Datos del documento
      </h3>

      <div class="space-y-4">
        <!-- Nombre -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Nombre del documento <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.nombre"
            type="text"
            placeholder="Ej: Manual de Organización y Funciones"
            class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            :class="{ 'border-red-400': errores.nombre }"
          />
          <p v-if="errores.nombre" class="text-xs text-red-600 mt-1">{{ errores.nombre }}</p>
        </div>

        <!-- Código -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Código <span class="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            v-model="form.codigo"
            type="text"
            placeholder="Ej: MANUAL DE ORGANIZACIÓN Y FUNCIONES"
            class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          />
          <p class="text-xs text-gray-500 mt-1">
            Se usa para evitar duplicados en la importación.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Gestión -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Gestión</label>
            <input
              v-model.number="form.gestion"
              type="number"
              min="1900"
              max="2100"
              placeholder="2020"
              class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <!-- Categoría -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Categoría del acordeón
            </label>
            <input
              v-model="form.categoria"
              type="text"
              list="categorias-existentes"
              placeholder="Ej: Normativa Administrativa"
              class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
            <datalist id="categorias-existentes">
              <option v-for="c in categoriasExistentes" :key="c" :value="c" />
            </datalist>
            <p class="text-xs text-gray-500 mt-1">
              Dejalo vacío si el documento es solo una tarjeta destacada.
            </p>
          </div>
        </div>

        <!-- Descripción -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Descripción <span class="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            v-model="form.descripcion"
            rows="3"
            class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          ></textarea>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- VISIBILIDAD Y ORDEN                          -->
    <!-- ============================================ -->
    <section class="bg-white rounded-lg shadow-sm p-5">
      <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">
        Visibilidad y orden
      </h3>

      <div class="space-y-4">
        <!-- Destacado -->
        <div class="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <input
            id="destacado"
            v-model="form.destacado"
            type="checkbox"
            class="mt-1 w-4 h-4"
          />
          <label for="destacado" class="cursor-pointer">
            <span class="text-sm font-medium text-gray-800">Mostrar como tarjeta destacada</span>
            <p class="text-xs text-gray-600 mt-0.5">
              Aparece en las tarjetas superiores del Marco Normativo.
              <strong>Requiere imagen de portada.</strong>
              Máximo 6 visibles (el resto se oculta).
            </p>
          </label>
        </div>

        <!-- Orden -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Orden <span class="text-gray-400 font-normal">(menor = primero)</span>
          </label>
          <input
            v-model.number="form.orden"
            type="number"
            min="0"
            class="w-32 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <!-- Activo -->
        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input v-model="form.activo" type="checkbox" class="w-4 h-4" />
          Documento activo (visible en el sitio público)
        </label>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- ARCHIVO PDF                                  -->
    <!-- ============================================ -->
    <section class="bg-white rounded-lg shadow-sm p-5">
      <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">
        Archivo PDF
      </h3>

      <!-- PDF actual -->
      <div v-if="form.archivo.url" class="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
        <span class="text-2xl">📄</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">
            {{ form.archivo.originalName || form.archivo.filename }}
          </p>
          <p class="text-xs text-gray-600">
            {{ formatearTamaño(form.archivo.size) }}
            · <a :href="form.archivo.url" target="_blank" class="text-primary-600 hover:underline">Ver PDF</a>
          </p>
        </div>
        <button
          type="button"
          @click="quitarPDF"
          class="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Quitar
        </button>
      </div>

      <!-- Input de PDF -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ form.archivo.url ? 'Reemplazar PDF' : 'Subir PDF' }}
        </label>
        <input
          ref="inputPDF"
          type="file"
          accept="application/pdf"
          @change="onSelectPDF"
          class="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
        <p v-if="uploadingPDF" class="text-xs text-blue-600 mt-1">Subiendo PDF...</p>
        <p v-if="errorPDF" class="text-xs text-red-600 mt-1">{{ errorPDF }}</p>
        <p class="text-xs text-gray-500 mt-1">Solo PDF. Tamaño máximo: 350 MB.</p>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- IMAGEN DE PORTADA                            -->
    <!-- ============================================ -->
    <section class="bg-white rounded-lg shadow-sm p-5">
      <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">
        Imagen de portada
        <span v-if="form.destacado" class="text-red-500">(obligatoria si es destacado)</span>
      </h3>

      <div class="flex gap-5">
        <!-- Vista previa -->
        <div class="shrink-0">
          <div class="w-32 h-44 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              v-if="form.imagen"
              :src="form.imagen"
              alt="Portada"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-gray-400 text-xs text-center px-2">Sin portada</span>
          </div>
        </div>

        <div class="flex-1">
          <input
            ref="inputImagen"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            @change="onSelectImagen"
            class="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          <p v-if="uploadingImagen" class="text-xs text-blue-600 mt-1">Subiendo imagen...</p>
          <p v-if="errorImagen" class="text-xs text-red-600 mt-1">{{ errorImagen }}</p>
          <p class="text-xs text-gray-500 mt-1">JPG, PNG, WEBP o GIF. Recomendado 3:4 vertical.</p>

          <button
            v-if="form.imagen"
            type="button"
            @click="quitarImagen"
            class="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Quitar portada
          </button>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- ACCIONES                                     -->
    <!-- ============================================ -->
    <div class="flex justify-end gap-3">
      <NuxtLink
        to="/admin/marco-normativo"
        class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Cancelar
      </NuxtLink>
      <button
        type="submit"
        :disabled="saving || uploadingPDF || uploadingImagen"
        class="px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
      >
        {{ saving ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Crear documento') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useMarcoNormativo } from '~/composables/useMarcoNormativo'
import type { MarcoNormativoItem } from '~/composables/useMarcoNormativo'

const props = defineProps<{
  documento?: MarcoNormativoItem | null
  categoriasExistentes?: string[]
}>()

const emit = defineEmits<{
  (e: 'submit', payload: Partial<MarcoNormativoItem>): void
}>()

const { uploadPDF, uploadImagen } = useMarcoNormativo()

const esEdicion = computed(() => Boolean(props.documento?._id))

const form = reactive({
  nombre: props.documento?.nombre || '',
  codigo: props.documento?.codigo || '',
  descripcion: props.documento?.descripcion || '',
  gestion: props.documento?.gestion ?? null,
  categoria: props.documento?.categoria || '',
  destacado: props.documento?.destacado ?? false,
  orden: props.documento?.orden ?? 0,
  activo: props.documento?.activo ?? true,
  imagen: props.documento?.imagen || null as string | null,
  archivo: {
    url: props.documento?.archivo?.url || null,
    filename: props.documento?.archivo?.filename || '',
    originalName: props.documento?.archivo?.originalName || '',
    size: props.documento?.archivo?.size || 0
  }
})

const saving = ref(false)
const serverError = ref('')
const errores = reactive<Record<string, string>>({})

const inputPDF = ref<HTMLInputElement | null>(null)
const inputImagen = ref<HTMLInputElement | null>(null)

const uploadingPDF = ref(false)
const uploadingImagen = ref(false)
const errorPDF = ref('')
const errorImagen = ref('')

const formatearTamaño = (bytes: number) => {
  if (!bytes) return '0 KB'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(2) + ' MB'
}

// ============================================
// UPLOADS
// ============================================
const onSelectPDF = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.type !== 'application/pdf') {
    errorPDF.value = 'Solo se permiten archivos PDF.'
    return
  }

  uploadingPDF.value = true
  errorPDF.value = ''

  try {
    const result = await uploadPDF(file)
    form.archivo = {
      url: result.url,
      filename: result.filename,
      originalName: result.originalName,
      size: result.size
    }
  } catch (err: any) {
    errorPDF.value = err.message || 'Error al subir el PDF'
  } finally {
    uploadingPDF.value = false
    if (inputPDF.value) inputPDF.value.value = ''
  }
}

const onSelectImagen = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadingImagen.value = true
  errorImagen.value = ''

  try {
    const result = await uploadImagen(file)
    form.imagen = result.url
  } catch (err: any) {
    errorImagen.value = err.message || 'Error al subir la imagen'
  } finally {
    uploadingImagen.value = false
    if (inputImagen.value) inputImagen.value.value = ''
  }
}

const quitarPDF = () => {
  form.archivo = { url: null, filename: '', originalName: '', size: 0 }
}

const quitarImagen = () => {
  form.imagen = null
}

// ============================================
// VALIDACIÓN Y ENVÍO
// ============================================
const validar = (): boolean => {
  Object.keys(errores).forEach((k) => delete errores[k])

  if (!form.nombre.trim()) {
    errores.nombre = 'El nombre es obligatorio'
  }

  if (form.destacado && !form.imagen) {
    serverError.value = 'Para mostrar como destacado necesitás subir una imagen de portada'
    return false
  }

  return Object.keys(errores).length === 0
}

const enviar = () => {
  serverError.value = ''
  if (!validar()) return

  saving.value = true

  emit('submit', {
    nombre: form.nombre.trim(),
    codigo: form.codigo.trim(),
    descripcion: form.descripcion.trim(),
    gestion: form.gestion,
    categoria: form.categoria.trim() || null,
    destacado: form.destacado,
    orden: form.orden,
    activo: form.activo,
    imagen: form.imagen,
    archivo: form.archivo
  })

  // El padre llama a setSaving(false) cuando termine
}

defineExpose({ setSaving: (v: boolean) => (saving.value = v), setError: (m: string) => (serverError.value = m) })
</script>
