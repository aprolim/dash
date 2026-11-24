<!-- pages/admin/marco-normativo/edit/[id].vue -->
<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/admin/marco-normativo" class="text-sm text-primary-600 hover:underline">
        ← Volver al listado
      </NuxtLink>
      <h2 class="text-xl font-bold text-gray-900 mt-2">Editar documento</h2>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-500">Cargando documento...</div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
      {{ error }}
    </div>

    <MarcoNormativoForm
      v-else-if="documento"
      ref="formRef"
      :documento="documento"
      :categorias-existentes="categorias"
      @submit="guardar"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMarcoNormativo } from '~/composables/useMarcoNormativo'
import type { MarcoNormativoItem } from '~/composables/useMarcoNormativo'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const { getDocumentoById, updateDocumento, getCategorias } = useMarcoNormativo()

const formRef = ref<any>(null)
const documento = ref<MarcoNormativoItem | null>(null)
const categorias = ref<string[]>([])
const loading = ref(true)
const error = ref('')

const guardar = async (payload: Partial<MarcoNormativoItem>) => {
  if (!documento.value) return

  try {
    await updateDocumento(documento.value._id, payload)
    router.push('/admin/marco-normativo')
  } catch (err: any) {
    formRef.value?.setSaving(false)
    formRef.value?.setError(err.message || 'Error al actualizar el documento')
  }
}

onMounted(async () => {
  try {
    const id = route.params.id as string
    documento.value = await getDocumentoById(id)
  } catch (err: any) {
    error.value = err.message || 'No se pudo cargar el documento'
  } finally {
    loading.value = false
  }

  try {
    categorias.value = await getCategorias()
  } catch {
    categorias.value = []
  }
})
</script>
