<!-- pages/admin/marco-normativo/create.vue -->
<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/admin/marco-normativo" class="text-sm text-primary-600 hover:underline">
        ← Volver al listado
      </NuxtLink>
      <h2 class="text-xl font-bold text-gray-900 mt-2">
        {{ tipoInicial === 'destacado' ? 'Nueva tarjeta destacada' : 'Nuevo documento del acordeón' }}
      </h2>
    </div>

    <MarcoNormativoForm
      ref="formRef"
      :tipo-inicial="tipoInicial"
      :categorias-existentes="categorias"
      :categoria-sugerida="CATEGORIA_SUGERIDA"
      @submit="guardar"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMarcoNormativo } from '~/composables/useMarcoNormativo'
import type { MarcoNormativoItem } from '~/composables/useMarcoNormativo'

definePageMeta({ layout: 'default' })

const CATEGORIA_SUGERIDA = 'Normativa Administrativa'

const route = useRoute()
const router = useRouter()
const { createDocumento, getCategorias } = useMarcoNormativo()

const formRef = ref<any>(null)
const categorias = ref<string[]>([])

// Permite entrar con ?tipo=destacado para precargar el formulario.
const tipoInicial: 'destacado' | 'acordeon' =
  route.query.tipo === 'destacado' ? 'destacado' : 'acordeon'

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
