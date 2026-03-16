<!-- components/tabs/IconSelector.vue -->
<template>
  <div>
    <!-- Búsqueda -->
    <div class="mb-4">
      <input
        v-model="search"
        type="text"
        placeholder="🔍 Buscar iconos..."
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
    </div>

    <!-- Carga -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-sm text-gray-500">Cargando iconos...</p>
    </div>

    <!-- Grid de iconos maestros -->
    <div v-else class="grid grid-cols-4 md:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-1">
      <button
        v-for="icon in filteredIcons"
        :key="icon.id"
        @click="$emit('select', icon.svg)"
        class="p-3 border rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all transform hover:scale-105"
        :class="{ 'border-primary-500 bg-primary-50 ring-2 ring-primary-200': selectedIcon === icon.svg }"
      >
        <div class="w-10 h-10 mx-auto mb-2" v-html="icon.svg"></div>
        <p class="text-xs text-gray-600 text-center truncate">{{ icon.nombre }}</p>
        <p class="text-xs text-gray-400 text-center">{{ icon.categoria }}</p>
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
import { useTabsApi, type MasterIcon } from '~/composables/useTabsApi'

const props = defineProps<{
  selectedIcon?: string
}>()

const emit = defineEmits<{
  (e: 'select', iconSvg: string): void
}>()

const tabsApi = useTabsApi()
const loading = ref(false)
const masterIcons = ref<MasterIcon[]>([])
const search = ref('')

const filteredIcons = computed(() => {
  if (!search.value) return masterIcons.value
  const term = search.value.toLowerCase()
  return masterIcons.value.filter(icon => 
    icon.nombre.toLowerCase().includes(term) ||
    icon.categoria.toLowerCase().includes(term)
  )
})

const selectIcon = (svg: string) => {
  console.log('🎨 Icono seleccionado:', svg ? svg.substring(0, 50) + '...' : 'VACÍO')
  emit('select', svg)
}

onMounted(async () => {
  try {
    loading.value = true
    masterIcons.value = await tabsApi.getMasterIcons()
    console.log('📦 Iconos maestros cargados:', masterIcons.value.length)
  } catch (error) {
    console.error('Error cargando iconos:', error)
  } finally {
    loading.value = false
  }
})
</script>