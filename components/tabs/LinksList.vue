<!-- components/tabs/LinksList.vue -->
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-lg font-medium text-gray-900">Links de {{ categoryName }}</h2>
        <p class="text-sm text-gray-500">Arrastra usando el ícono ⋮⋮ para reordenar</p>
      </div>
      <button
        @click="$emit('create')"
        class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        <span class="mr-2">+</span>
        Nuevo Link
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando links...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 p-4 rounded-md">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else-if="localLinks.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
      <p class="text-gray-500">No hay links en esta categoría</p>
    </div>

    <div v-else class="space-y-2">
      <transition-group name="list" tag="div" class="space-y-2">
        <div
          v-for="(link, index) in localLinks"
          :key="link.linkId"
          class="bg-white border rounded-lg p-4"
          :class="{ 
            'opacity-50': !link.isActive,
            'dragging border-2 border-primary-500 shadow-lg': dragIndex === index
          }"
          :draggable="true"
          @dragstart="handleDragStart($event, index, link)"
          @dragover.prevent="handleDragOver($event, index)"
          @dragend="handleDragEnd($event)"
          @dragenter.prevent
          @dragleave.prevent
          @drop.prevent="handleDrop($event, index)"
        >
          <div class="flex items-center space-x-4">
            <!-- Drag Handle -->
            <div class="drag-handle cursor-grab text-gray-400 hover:text-gray-600 select-none text-2xl">
              ⋮⋮
            </div>
            
            <!-- Icono -->
            <div class="w-10 h-10 flex items-center justify-center">
              <div class="w-8 h-8" v-html="link.icono"></div>
            </div>

            <!-- Contenido -->
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <h3 class="font-medium text-gray-900">{{ link.titulo }}</h3>
                <span class="text-xs text-gray-500">#{{ index + 1 }}</span>
              </div>
              <p class="text-sm text-gray-600">{{ link.descripcion }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ link.path }}</p>
            </div>

            <!-- Acciones -->
            <div class="flex space-x-2">
              <button
                @click="$emit('edit', link)"
                class="p-2 text-gray-400 hover:text-primary-600"
                title="Editar"
              >
                ✏️
              </button>
              <button
                @click="$emit('toggle', link)"
                class="p-2 text-gray-400 hover:text-primary-600"
                :title="link.isActive ? 'Desactivar' : 'Activar'"
              >
                {{ link.isActive ? '⏸️' : '▶️' }}
              </button>
            </div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TabLink } from '~/composables/useTabsApi'

const props = defineProps<{
  categoryId: string
  categoryName: string
  links: TabLink[]
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'create'): void
  (e: 'edit', link: TabLink): void
  (e: 'toggle', link: TabLink): void
  (e: 'reorder', order: { linkId: string; position: number }[]): void
}>()

// Estado para drag and drop
const localLinks = ref<TabLink[]>([])
const dragIndex = ref<number | null>(null)

// Sincronizar con props
watch(() => props.links, (newLinks) => {
  if (newLinks) {
    localLinks.value = [...newLinks].sort((a, b) => a.orden - b.orden)
  }
}, { immediate: true, deep: true })

// Funciones de drag and drop
const handleDragStart = (event: DragEvent, index: number, link: TabLink) => {
  dragIndex.value = index
  event.dataTransfer?.setData('text/plain', JSON.stringify({
    index,
    linkId: link.linkId
  }))
  event.dataTransfer!.effectAllowed = 'move'
}

const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  if (dragIndex.value === null || dragIndex.value === index) return
  event.dataTransfer!.dropEffect = 'move'
}

const handleDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault()
  
  if (dragIndex.value === null) return
  
  const data = event.dataTransfer?.getData('text/plain')
  if (!data) return
  
  try {
    const draggedData = JSON.parse(data)
    
    if (draggedData.index === dropIndex) {
      dragIndex.value = null
      return
    }
    
    // Reordenar array
    const newLinks = [...localLinks.value]
    const [draggedItem] = newLinks.splice(draggedData.index, 1)
    newLinks.splice(dropIndex, 0, draggedItem)
    localLinks.value = newLinks
    
  } catch (error) {
    console.error('Error parsing drag data:', error)
  }
}

const handleDragEnd = (event: DragEvent) => {
  const order = localLinks.value.map((link, index) => ({
    linkId: link.linkId,
    position: index
  }))
  
  emit('reorder', order)
  dragIndex.value = null
}
</script>

<style scoped>
.list-move {
  transition: transform 0.3s ease;
}

.dragging {
  opacity: 0.7;
  transform: scale(1.02);
  transition: all 0.2s ease;
}

[draggable=true] {
  user-select: none;
  -webkit-user-drag: element;
}

.drag-handle {
  user-select: none;
  font-size: 24px;
  line-height: 1;
}

.drag-handle * {
  pointer-events: none;
}
</style>