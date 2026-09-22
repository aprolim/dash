<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin/auditoria/poa-uai" class="text-gray-400 hover:text-gray-600 text-2xl">
        ←
      </NuxtLink>
      <h1 class="text-2xl font-semibold text-gray-900">Editar POA</h1>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando POA...</p>
    </div>

    <div v-else-if="error" class="text-center py-12 text-red-600">{{ error }}</div>

    <form v-else @submit.prevent="savePOA" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Año <span class="text-red-500">*</span>
        </label>
        <input
          v-model.number="form.anio"
          type="number"
          required
          min="2000"
          max="2100"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
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
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
        <input
          v-model="form.fecha"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
        <label class="flex items-center gap-3">
          <input v-model="form.activo" type="checkbox" class="w-5 h-5" />
          <span class="text-sm text-gray-700">Marcar como POA vigente</span>
        </label>
      </div>

      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">📄 PDF del POA</h3>

        <div class="mb-4">
          <div class="flex gap-3 items-center flex-wrap">
            <label
              class="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <span>{{ form.pdfUrl ? 'Cambiar PDF' : 'Subir PDF' }}</span>
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
        </div>

        <div v-if="form.pdfUrl" class="p-4 bg-gray-100 rounded-lg flex items-center gap-3">
          <span class="text-3xl">📄</span>
          <div class="flex-1">
            <p class="font-medium text-sm">PDF cargado</p>
            <a :href="form.pdfUrl" target="_blank" class="text-xs text-primary-600 hover:underline break-all">
              Ver PDF actual
            </a>
          </div>
          <button
            type="button"
            @click="form.pdfUrl = null"
            class="text-red-500 hover:text-red-700 text-xl flex-shrink-0"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="flex justify-end space-x-3 pt-4 border-t">
        <NuxtLink
          to="/admin/auditoria/poa-uai"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </NuxtLink>
        <button
          type="submit"
          :disabled="saving"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
        >
          <span
            v-if="saving"
            class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></span>
          {{ saving ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuditoria, type EstadoAuditoria } from '~/composables/useAuditoria'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const { getPOAById, updatePOA, uploadPDF } = useAuditoria()

const loading = ref(true)
const saving = ref(false)
const uploadingPDF = ref(false)
const uploadProgress = ref('')
const error = ref<string | null>(null)
const pdfInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  anio: new Date().getFullYear(),
  titulo: '',
  fecha: '',
  estado: 'Publicado' as EstadoAuditoria,
  activo: false,
  pdfUrl: null as string | null,
})

const loadPOA = async () => {
  try {
    const id = route.params.id as string
    const poa = await getPOAById(id)
    form.anio = poa.anio
    form.titulo = poa.titulo
    form.fecha = poa.fecha
    form.estado = poa.estado
    form.activo = poa.activo
    form.pdfUrl = poa.pdfUrl
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
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
    const result = await uploadPDF(file, 'poa-uai')
    form.pdfUrl = result.url
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

const savePOA = async () => {
  saving.value = true
  try {
    const id = route.params.id as string
    await updatePOA(id, {
      anio: form.anio,
      titulo: form.titulo,
      fecha: form.fecha,
      estado: form.estado,
      activo: form.activo,
      pdfUrl: form.pdfUrl || undefined,
    })
    router.push('/admin/auditoria/poa-uai')
  } catch (err: any) {
    alert(err.message || 'Error al guardar')
  } finally {
    saving.value = false
  }
}

onMounted(loadPOA)
</script>