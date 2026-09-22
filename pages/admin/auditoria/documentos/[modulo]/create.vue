<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink
        :to="`/admin/auditoria/documentos/${modulo}`"
        class="text-gray-400 hover:text-gray-600 text-2xl"
      >
        ←
      </NuxtLink>
      <h1 class="text-2xl font-semibold text-gray-900">Crear Nuevo Documento</h1>
    </div>

    <form @submit.prevent="saveDocumento" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Categoría <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.categoria"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">-- Selecciona una categoría --</option>
          <option v-for="cat in categorias" :key="cat.key" :value="cat.key">
            {{ cat.nombre }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Título <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.titulo"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Ej: INF-UAI-VC-N° 001-2024"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          v-model="form.descripcion"
          rows="3"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
          placeholder="Descripción del documento (aparece en el frontend)"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Gestión (año) <span class="text-red-500">*</span>
        </label>
        <input
          v-model.number="form.gestion"
          type="number"
          required
          min="2000"
          max="2100"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="2024"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select v-model="form.estado" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          <option value="Publicado">✅ Publicado</option>
          <option value="En Revisión">⏳ En Revisión</option>
          <option value="Borrador">📝 Borrador</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Orden</label>
        <input
          v-model.number="form.orden"
          type="number"
          min="0"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <p class="text-xs text-gray-500 mt-1">Menor número = aparece primero en su categoría</p>
      </div>

      <div>
        <label class="flex items-center gap-3">
          <input v-model="form.activo" type="checkbox" class="w-5 h-5" />
          <span class="text-sm text-gray-700">Activo (visible en el frontend)</span>
        </label>
      </div>

      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">📄 Archivo PDF</h3>

        <div class="mb-4">
          <div class="flex gap-3 items-center flex-wrap">
            <label
              class="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <span>{{ form.url ? 'Cambiar PDF' : 'Subir PDF' }}</span>
              <input
                ref="pdfInput"
                type="file"
                accept="application/pdf"
                class="hidden"
                @change="handlePdfSelect"
              />
            </label>
            <span v-if="uploadingPDF" class="text-sm text-gray-500 flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              Subiendo...
            </span>
            <span v-if="uploadProgress" class="text-sm text-green-600">{{ uploadProgress }}</span>
          </div>
          <p class="text-xs text-gray-500 mt-2">Solo PDF. Máx 50MB</p>
        </div>

        <div v-if="form.url" class="p-4 bg-gray-100 rounded-lg flex items-center gap-3">
          <span class="text-3xl">📄</span>
          <div class="flex-1">
            <p class="font-medium text-sm">PDF cargado</p>
            <a :href="form.url" target="_blank" class="text-xs text-primary-600 hover:underline break-all">
              {{ form.url }}
            </a>
          </div>
          <button
            type="button"
            @click="form.url = null"
            class="text-red-500 hover:text-red-700 text-xl flex-shrink-0"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="flex justify-end space-x-3 pt-4 border-t">
        <NuxtLink
          :to="`/admin/auditoria/documentos/${modulo}`"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </NuxtLink>
        <button
          type="submit"
          :disabled="saving || !categorias.length"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
        >
          <span
            v-if="saving"
            class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></span>
          {{ saving ? 'Guardando...' : 'Crear Documento' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  useAuditoria,
  type AuditoriaCategoria,
  type EstadoAuditoria,
  type ModuloAuditoria,
} from '~/composables/useAuditoria'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const modulo = route.params.modulo as ModuloAuditoria

const { createDocumento, uploadPDF, getCategorias } = useAuditoria()

const categorias = ref<AuditoriaCategoria[]>([])
const saving = ref(false)
const uploadingPDF = ref(false)
const uploadProgress = ref('')
const pdfInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  categoria: '',
  titulo: '',
  descripcion: '',
  gestion: new Date().getFullYear(),
  estado: 'Publicado' as EstadoAuditoria,
  activo: true,
  orden: 0,
  url: null as string | null,
})

const loadCategorias = async () => {
  try {
    categorias.value = await getCategorias(modulo, false)
  } catch (err) {
    console.error(err)
  }
}

const handlePdfSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.type !== 'application/pdf') {
    alert('Solo se permiten archivos PDF')
    return
  }

  uploadingPDF.value = true
  uploadProgress.value = 'Subiendo PDF...'

  try {
    const result = await uploadPDF(file, modulo)
    form.url = result.url
    uploadProgress.value = '¡PDF subido con éxito!'
    setTimeout(() => (uploadProgress.value = ''), 3000)
  } catch (err: any) {
    alert(err.message || 'Error al subir el PDF')
    uploadProgress.value = ''
  } finally {
    uploadingPDF.value = false
    if (pdfInput.value) pdfInput.value.value = ''
  }
}

const saveDocumento = async () => {
  if (!form.categoria) {
    alert('Selecciona una categoría')
    return
  }
  if (!form.titulo.trim()) {
    alert('El título es requerido')
    return
  }
  if (!form.gestion) {
    alert('La gestión es requerida')
    return
  }

  saving.value = true
  try {
    await createDocumento(modulo, {
      modulo,
      categoria: form.categoria,
      titulo: form.titulo,
      descripcion: form.descripcion,
      gestion: form.gestion,
      estado: form.estado,
      activo: form.activo,
      orden: form.orden,
      url: form.url,
    })
    router.push(`/admin/auditoria/documentos/${modulo}`)
  } catch (err: any) {
    alert(err.message || 'Error al crear el documento')
  } finally {
    saving.value = false
  }
}

onMounted(loadCategorias)
</script>