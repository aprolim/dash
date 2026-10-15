<!-- pages/admin/legislativos/create.vue -->
<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink
        :to="`/admin/legislativos?tipo=${tipo}`"
        class="text-gray-400 hover:text-gray-600 text-2xl"
      >
        ←
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">
          Crear {{ config?.labelSingular || 'Documento' }}
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Completa los datos. El número se ingresa a mano y no se podrá modificar después.
        </p>
      </div>
    </div>

    <div v-if="!config" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">Tipo inválido: {{ tipo }}</p>
      <NuxtLink to="/admin/legislativos" class="text-red-700 underline mt-2 inline-block">
        Volver al listado
      </NuxtLink>
    </div>

    <div v-else class="bg-white rounded-lg shadow p-6">
      <DocumentoLegislativoForm
        :tipo="tipo"
        :documento="null"
        :saving="saving"
        :server-error="serverError"
        @submit="guardar"
      />
    </div>

    <!-- Toast -->
    <div
      v-if="toast.show"
      class="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50"
      :class="toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  useDocumentosLegislativos,
  type DocumentoLegislativo
} from '~/composables/useDocumentosLegislativos'
import { getConfigTipo, type TipoDocumento } from '~/utils/documentoTypes'
import DocumentoLegislativoForm from '~/components/admin/DocumentoLegislativoForm.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const { createDocumento } = useDocumentosLegislativos()

const tipo = computed<TipoDocumento>(() => {
  const t = route.query.tipo as string
  return (t || 'peticion-informe-escrito') as TipoDocumento
})

const config = computed(() => getConfigTipo(tipo.value))

const saving = ref(false)
const serverError = ref('')
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

const mostrarToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3500)
}

const guardar = async (payload: Partial<DocumentoLegislativo>) => {
  saving.value = true
  serverError.value = ''

  try {
    await createDocumento(tipo.value, payload)
    mostrarToast('Documento creado exitosamente')
    setTimeout(() => {
      router.push(`/admin/legislativos?tipo=${tipo.value}`)
    }, 800)
  } catch (err: any) {
    serverError.value = err.message || 'Error al crear el documento'
    mostrarToast(serverError.value, 'error')
  } finally {
    saving.value = false
  }
}
</script>