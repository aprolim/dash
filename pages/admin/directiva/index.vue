<!-- pages/admin/directiva/index.vue -->
<template>
  <div>
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">👥 Directiva Camaral</h1>
        <p class="text-gray-600">
          Administra los cargos de la directiva de la Cámara de Senadores
        </p>
      </div>
    </div>

    <div
      v-if="!canEdit"
      class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-800"
    >
      Estás como <strong>{{ roleLabel }}</strong>: podés consultar la directiva,
      pero no modificarla.
    </div>

    <DirectivaEditor v-if="canEdit" />

    <div v-else class="bg-white rounded-lg shadow p-6 text-gray-500 text-center">
      No tenés permisos para editar la directiva.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePermissions } from '~/composables/usePermissions'
import DirectivaEditor from '~/components/admin/DirectivaEditor.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const { can, roleLabel } = usePermissions()
const canEdit = computed(() => can('legislativos', 'edit'))
</script>