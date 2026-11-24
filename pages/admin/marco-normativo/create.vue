<!-- pages/admin/marco-normativo/create.vue -->
<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/admin/marco-normativo" class="text-sm text-primary-600 hover:underline">
        ← Volver al listado
      </NuxtLink>
      <h2 class="text-xl font-bold text-gray-900 mt-2">Nuevo documento de Marco Normativo</h2>
    </div>

    <MarcoNormativoForm
      ref="formRef"
      :categorias-existentes="categorias"
      @submit="guardar"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMarcoNormativo } from '~/composables/useMarcoNormativo'
import type { MarcoNormativoItem } from '~/composables/useMarcoNormativo'

definePageMeta({ layout: 'default' })

const router = useRouter()
const { createDocumento, getCategorias } = useMarcoNormativo()

const formRef = ref<any>(null)
const categorias = ref<string[]>([])

const guardar = async (payload: Partial<MarcoNormativoItem>) => {
  try {
    await createDocumento(payload)
    router.push('/admin/marco-normativo')
  } catch (err: any) {
    formRef.value?.setSaving(false)
    formRef.value?.setError(err.message || 'Error al crear el documento')
  }
}

onMounted(async () => {
  try {
    categorias.value = await getCategorias()
  } catch {
    categorias.value = []
  }
})
</script>
