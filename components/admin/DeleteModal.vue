<!-- components/admin/DeleteModal.vue -->
<template>
  <Modal
    :model-value="modelValue"
    title="Confirmar eliminación"
    size="lg"
    @update:model-value="cerrar"
  >
    <div class="space-y-4">
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p class="text-sm text-amber-800">
          <strong>⚠️ Esta acción es un "soft delete".</strong>
        </p>
        <p class="text-xs text-amber-700 mt-1">
          El documento dejará de mostrarse en el portal público y en el listado normal,
          pero <strong>NO se borra físicamente</strong>. Los datos quedan guardados
          para auditoría y solo un Super Administrador puede restaurarlos.
        </p>
      </div>

      <div v-if="documento" class="bg-gray-50 rounded-lg p-3">
        <p class="text-sm text-gray-700">
          <strong>Nº:</strong> {{ documento.numero }}
        </p>
        <p class="text-sm text-gray-700 truncate">
          <strong>Código:</strong> {{ documento.codigo }}
        </p>
        <p class="text-sm text-gray-700 line-clamp-2 mt-1">
          <strong>Asunto:</strong> {{ documento.asunto }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Motivo de la eliminación <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model.trim="motivo"
          rows="3"
          :disabled="loading"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 resize-none disabled:bg-gray-50"
          :class="error ? 'border-red-400' : 'border-gray-300'"
          placeholder="Ej: Se ingresó el número incorrecto. Se volverá a crear con el número correcto."
        ></textarea>
        <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
        <p v-else class="mt-1 text-xs text-gray-500">
          Mínimo 10 caracteres. Este motivo quedará guardado para auditoría.
        </p>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button
          type="button"
          @click="cerrar"
          :disabled="loading"
          class="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="confirmar"
          :disabled="loading || !motivoValido"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ loading ? 'Eliminando...' : 'Eliminar' }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import type { DocumentoLegislativo } from '~/composables/useDocumentosLegislativos'

const props = defineProps<{
  modelValue: boolean
  documento: DocumentoLegislativo | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', motivo: string): void
}>()

const motivo = ref('')
const error = ref('')

const motivoValido = computed(() => motivo.value.trim().length >= 10)

watch(() => props.modelValue, (abierto) => {
  if (abierto) {
    motivo.value = ''
    error.value = ''
  }
})

const cerrar = () => {
  if (props.loading) return
  emit('update:modelValue', false)
}

const confirmar = () => {
  const m = motivo.value.trim()
  if (m.length < 10) {
    error.value = 'El motivo debe tener al menos 10 caracteres.'
    return
  }
  error.value = ''
  emit('confirm', m)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>