<!-- components/tabs/LinkForm.vue -->
<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <!-- ID del Link -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        ID del Link <span class="text-red-500">*</span>
      </label>
      <input
        v-model="form.linkId"
        type="text"
        required
        :disabled="!!link"
        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg disabled:bg-gray-100"
        placeholder="ej: leyes-tratamiento"
      />
    </div>

    <!-- Título -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Título <span class="text-red-500">*</span>
      </label>
      <input
        v-model="form.titulo"
        type="text"
        required
        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
        placeholder="Ej: Proyectos de Ley en Tratamiento"
      />
    </div>

    <!-- Descripción -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Descripción <span class="text-red-500">*</span>
      </label>
      <textarea
        v-model="form.descripcion"
        rows="2"
        required
        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg resize-none"
        placeholder="Descripción del link"
      ></textarea>
    </div>

    <!-- Ruta -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Ruta (path) <span class="text-red-500">*</span>
      </label>
      <input
        v-model="form.path"
        type="text"
        required
        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
        placeholder="/legislacion/proyectos-en-tratamiento"
      />
    </div>

    <!-- Orden -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Orden
      </label>
      <input
        v-model.number="form.orden"
        type="number"
        min="0"
        step="10"
        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
      />
    </div>

    <!-- Icono -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Icono <span class="text-red-500">*</span>
      </label>
      <button
        type="button"
        @click="showIconSelector = true"
        class="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
      >
        <div v-if="form.icono" class="flex items-center justify-center space-x-4">
          <div class="w-10 h-10" v-html="form.icono"></div>
          <span class="text-gray-600">Cambiar icono</span>
        </div>
        <div v-else class="text-gray-500">
          <span class="block text-lg mb-1">🖼️</span>
          <span>Seleccionar icono</span>
        </div>
      </button>
    </div>

    <!-- Modal de selector de iconos -->
    <Modal v-model="showIconSelector" title="Seleccionar Icono" size="2xl">
      <IconSelector
        :selected-icon="form.icono"
        @select="handleIconSelect"
      />
    </Modal>

    <!-- Botones -->
    <div class="flex justify-end space-x-3 pt-5 border-t border-gray-200">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
      >
        <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
        {{ loading ? 'Guardando...' : 'Guardar' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TabLink } from '~/composables/useTabsApi'

const props = defineProps<{
  link?: TabLink | null
  categoryId: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', data: any): void
  (e: 'cancel'): void
}>()

const showIconSelector = ref(false)

const form = ref({
  linkId: '',
  titulo: '',
  descripcion: '',
  path: '',
  orden: 0,
  icono: ''
})

// Cargar datos del link cuando se edita
watch(() => props.link, (link) => {
  if (link) {
    form.value = {
      linkId: link.linkId,
      titulo: link.titulo,
      descripcion: link.descripcion,
      path: link.path,
      orden: link.orden || 0,
      icono: link.icono || ''
    }
  } else {
    form.value = {
      linkId: '',
      titulo: '',
      descripcion: '',
      path: '',
      orden: 0,
      icono: ''
    }
  }
}, { immediate: true })

// ✅ ESTA ES LA FUNCIÓN QUE PREGUNTAS - SOLO ESTO
const handleIconSelect = (svg: string) => {
  console.log('📝 Icono recibido en LinkForm')
  form.value.icono = svg
  showIconSelector.value = false
}

const handleSubmit = () => {
  if (!props.link) {
    // Crear nuevo link
    emit('submit', form.value)
  } else {
    // Actualizar link existente (sin el linkId)
    const { linkId, ...dataToSend } = form.value
    emit('submit', dataToSend)
  }
}
</script>