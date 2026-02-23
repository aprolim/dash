<!-- components/tabs/IconSelector.vue -->
<template>
  <div>
    <!-- Búsqueda -->
    <div class="mb-4">
      <input
        type="text"
        v-model="search"
        placeholder="🔍 Buscar iconos por nombre o categoría..."
        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
    </div>

    <!-- Carga -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-sm text-gray-500">Cargando iconos...</p>
    </div>

    <!-- Grid de iconos -->
    <div v-else class="grid grid-cols-4 md:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-1">
      <button
        v-for="icon in filteredIcons"
        :key="icon.id"
        @click="$emit('select', icon.icono)"
        class="p-3 border rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all transform hover:scale-105"
        :class="{ 'border-primary-500 bg-primary-50 ring-2 ring-primary-200': selectedIcon === icon.icono }"
      >
        <div class="w-10 h-10 mx-auto mb-2" v-html="icon.icono"></div>
        <p class="text-xs text-gray-600 text-center truncate" :title="icon.ejemplo">
          {{ icon.ejemplo }}
        </p>
        <p class="text-xs text-gray-400 text-center">{{ icon.categoryName }}</p>
      </button>
    </div>

    <!-- Sin resultados -->
    <div v-if="!loading && filteredIcons.length === 0" class="text-center py-8 text-gray-500">
      <span class="text-4xl block mb-2">🔍</span>
      No se encontraron iconos para "{{ search }}"
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTabsApi, type IconGalleryItem } from '~/composables/useTabsApi'

const props = defineProps<{
  selectedIcon?: string
}>()

const emit = defineEmits<{
  (e: 'select', iconSvg: string): void
}>()

const tabsApi = useTabsApi()
const loading = ref(false)
const icons = ref<IconGalleryItem[]>([])
const search = ref('')

const filteredIcons = computed(() => {
  if (!search.value) return icons.value
  const term = search.value.toLowerCase()
  return icons.value.filter(icon => 
    icon.ejemplo.toLowerCase().includes(term) ||
    icon.categoryName.toLowerCase().includes(term)
  )
})

onMounted(async () => {
  try {
    loading.value = true
    const response = await tabsApi.getIconsGallery()
    icons.value = response.all || []
  } catch (error) {
    console.error('Error cargando iconos:', error)
  } finally {
    loading.value = false
  }
})
</script>