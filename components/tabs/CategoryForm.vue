<!-- components/tabs/CategoryForm.vue -->
<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <!-- ID de Categoría -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        ID de Categoría <span class="text-red-500">*</span>
      </label>
      <input
        v-model="form.categoryId"
        type="text"
        required
        :disabled="!!category"
        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        :class="{ 'bg-gray-50': !!category }"
        placeholder="ej: legislacion"
      />
      <p class="text-xs text-gray-500 mt-1.5">
        Solo letras minúsculas, números y guiones (ej: nueva-categoria)
      </p>
    </div>

    <!-- Nombre -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Nombre <span class="text-red-500">*</span>
      </label>
      <input
        v-model="form.name"
        type="text"
        required
        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        placeholder="Ej: Legislación"
      />
    </div>

    <!-- Descripción -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Descripción
      </label>
      <textarea
        v-model="form.description"
        rows="3"
        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
        placeholder="Descripción de la categoría"
      ></textarea>
    </div>

    <!-- Orden -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Orden
      </label>
      <input
        v-model.number="form.order"
        type="number"
        min="0"
        step="10"
        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
      />
      <p class="text-xs text-gray-500 mt-1.5">
        Determina la posición (menor número = más arriba)
      </p>
    </div>

    <!-- Icono -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Icono de Categoría
      </label>
      <button
        type="button"
        @click="showIconSelector = true"
        class="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
      >
        <div v-if="form.icon" class="flex items-center justify-center space-x-4">
          <div class="w-10 h-10" v-html="form.icon"></div>
          <span class="text-gray-600">Cambiar icono</span>
        </div>
        <div v-else class="text-gray-500">
          <span class="block text-lg mb-1">🖼️</span>
          <span>Seleccionar icono</span>
        </div>
      </button>
    </div>

    <!-- Botones -->
    <div class="flex justify-end space-x-3 pt-5 border-t border-gray-200">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
      >
        <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>{{ loading ? 'Guardando...' : 'Guardar' }}</span>
      </button>
    </div>

    <!-- Modal de selector de iconos -->
    <Modal v-model="showIconSelector" title="Seleccionar Icono" size="2xl">
      <IconSelector
        :selected-icon="form.icon"
        @select="(svg) => { form.icon = svg; showIconSelector = false }"
      />
    </Modal>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TabCategory } from '~/composables/useTabsApi'

const props = defineProps<{
  category?: TabCategory | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', data: any): void
  (e: 'cancel'): void
}>()

const showIconSelector = ref(false)

const form = ref({
  categoryId: '',
  name: '',
  description: '',
  order: 0,
  icon: ''
})

watch(() => props.category, (category) => {
  if (category) {
    form.value = {
      categoryId: category.categoryId,
      name: category.name,
      description: category.description || '',
      order: category.order || 0,
      icon: category.icon || ''
    }
  } else {
    form.value = {
      categoryId: '',
      name: '',
      description: '',
      order: 0,
      icon: ''
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  if (!props.category) {
    emit('submit', form.value)
  } else {
    const { categoryId, ...dataToSend } = form.value
    emit('submit', dataToSend)
  }
}
</script>