<!-- pages/admin/legislativos/edit/[id].vue -->
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
          Editar {{ config?.labelSingular || 'Documento' }}
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          El número no se puede modificar. Si está incorrecto, elimina este registro y crea uno nuevo.
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando documento...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
      <NuxtLink :to="`/admin/legislativos?tipo=${tipo}`" class="text-red-700 underline mt-2 inline-block">
        Volver al listado
      </NuxtLink>
    </div>

    <!-- Alerta si está eliminado -->
    <div v-else-if="documento?.eliminado" class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <p class="text-amber-800 font-medium">
        ⚠️ Este documento está eliminado. No se puede editar.
      </p>
      <p class="text-amber-700 text-sm mt-1">
        Si necesitas modificarlo, un Super Administrador debe restaurarlo primero.
      </p>
    </div>

    <!-- Formulario -->
    <div v-else-if="documento" class="bg-white rounded-lg shadow p-6">
      <DocumentoLegislativoForm
        ref="formRef"
        :tipo="tipo"
        :documento="documento"
        :saving="saving"
        :server-error="serverError"
        @submit="guardar"
        @cambiarEstado="handleCambiarEstado"
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  useDocumentosLegislativos,
  type DocumentoLegislativo
} from '~/composables/useDocumentosLegislativos'
import { getConfigTipo, type TipoDocumento, getTipoPorEstado } from '~/utils/documentoTypes'
import DocumentoLegislativoForm from '~/components/admin/DocumentoLegislativoForm.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const { getDocumentoById, updateDocumento } = useDocumentosLegislativos()

const tipo = computed<TipoDocumento>(() => {
  const t = route.query.tipo as string
  return (t || 'peticion-informe-escrito') as TipoDocumento
})

const config = computed(() => getConfigTipo(tipo.value))

const documento = ref<DocumentoLegislativo | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const serverError = ref('')
const formRef = ref<any>(null)
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

const mostrarToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3500)
}

// ============================================
// CARGAR DOCUMENTO
// ============================================
const cargarDocumento = async () => {
  loading.value = true
  error.value = ''

  try {
    const id = route.params.id as string
    documento.value = await getDocumentoById(tipo.value, id)
  } catch (err: any) {
    error.value = err.message || 'Error al cargar el documento'
  } finally {
    loading.value = false
  }
}

// ============================================
// GUARDAR (edición normal)
// ============================================
const guardar = async (payload: Partial<DocumentoLegislativo>) => {
  if (!documento.value) return

  saving.value = true
  serverError.value = ''

  try {
    await updateDocumento(tipo.value, documento.value._id, payload)
    mostrarToast('Documento actualizado exitosamente')
    setTimeout(() => {
      router.push(`/admin/legislativos?tipo=${tipo.value}`)
    }, 800)
  } catch (err: any) {
    serverError.value = err.message || 'Error al actualizar el documento'
    mostrarToast(serverError.value, 'error')
  } finally {
    saving.value = false
  }
}

// ============================================
// 🔥 CAMBIAR ESTADO (desde el modal)
// ============================================
const handleCambiarEstado = async (payload: { estadoLey: string; datos: any }) => {
  if (!documento.value) return

  saving.value = true
  serverError.value = ''

  // Notificar al form para que muestre el spinner en el modal
  formRef.value?.setSavingEstado?.(true)

  try {
    // El endpoint PUT recibe los datos y el backend deduce el nuevo `tipo`
    await updateDocumento(tipo.value, documento.value._id, payload.datos)

    // Detectar el nuevo tipo para redirigir al listado correspondiente
    const tipoNuevo = getTipoPorEstado(payload.estadoLey)
    const destino = tipoNuevo || tipo.value

    mostrarToast(
      `Documento migrado a "${payload.estadoLey}". Redirigiendo al listado...`,
      'success'
    )

    setTimeout(() => {
      router.push(`/admin/legislativos?tipo=${destino}`)
    }, 1200)
  } catch (err: any) {
    serverError.value = err.message || 'Error al cambiar el estado'
    mostrarToast(serverError.value, 'error')
    formRef.value?.setSavingEstado?.(false)
  } finally {
    saving.value = false
  }
}

// ============================================
// LIFECYCLE
// ============================================
onMounted(() => {
  cargarDocumento()
})
</script>