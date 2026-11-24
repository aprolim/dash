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

    <div v-if="cargandoContexto" class="text-center py-12 text-gray-500">
      Preparando el formulario...
    </div>

    <MarcoNormativoForm
      v-else
      ref="formRef"
      :tipo-inicial="tipoInicial"
      :categorias-existentes="categorias"
      :categoria-sugerida="CATEGORIA_SUGERIDA"
      :total-destacados="totalDestacados"
      :siguiente-orden="siguienteOrden"
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
const { createDocumento, getCategorias, getDocumentos } = useMarcoNormativo()

const formRef = ref<any>(null)
const categorias = ref<string[]>([])
const cargandoContexto = ref(true)

// Orden que se asignará al documento nuevo (max + 1 del grupo correspondiente).
const siguienteOrden = ref(0)
const totalDestacados = ref(0)

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
    // Load both categorías and documentos para calcular el orden inicial
    const [cats, result] = await Promise.all([
      getCategorias().catch(() => []),
      getDocumentos({ page: 1, limit: 200, incluirInactivos: true, incluirEliminados: false }).catch(() => ({
        documentos: [], total: 0, page: 1, limit: 20, pages: 1
      }))
    ])

    categorias.value = cats as string[]

    const docs = result.documentos || []

    // Cuántas destacadas hay (para el aviso del límite de 6)
    const destacadas = docs.filter((d) => d.destacado === true)
    totalDestacados.value = destacadas.length

    // Calcular max + 1 dentro del grupo en el que se va a crear
    const mismoGrupo = tipoInicial === 'destacado'
      ? destacadas
      : docs.filter((d) => !d.destacado && (d.categoria || '').trim() === CATEGORIA_SUGERIDA)

    const maxOrden = mismoGrupo.reduce((max, d) => Math.max(max, d.orden ?? 0), 0)
    siguienteOrden.value = maxOrden + 1
  } catch (err) {
    console.error('No se pudo preparar el contexto del formulario:', err)
    siguienteOrden.value = 0
  } finally {
    cargandoContexto.value = false
  }
})
</script>
