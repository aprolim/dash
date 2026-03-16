<!-- pages/tabs/index.vue -->
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Gestión de Tabs</h1>
        <p class="text-gray-600">Administra y reordena las pestañas del portal</p>
      </div>
      <!-- se deshabilito porque no deberian crearse mas secciones -->
      <!-- <button
        @click="openCategoryModal()"
        class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        <span class="mr-2">+</span>
        Nueva Categoría
      </button> -->
    </div>

    <!-- Instrucciones -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-700">
      <div class="flex items-center space-x-2">
        <span class="text-lg">🖱️</span>
        <span><strong>Arrastra</strong> las categorías usando el ícono ⋮⋮ para reordenarlas. El cambio se guarda automáticamente.</span>
      </div>
    </div>

    <!-- Lista de categorías -->
    <div v-if="categoriesLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando categorías...</p>
    </div>

    <div v-else-if="categoriesError" class="bg-red-50 p-4 rounded-md">
      <p class="text-red-800">{{ categoriesError }}</p>
    </div>

    <div v-else class="space-y-2">
      <transition-group name="list" tag="div" class="space-y-2">
        <div
          v-for="(category, index) in orderedCategories"
          :key="category.categoryId"
          class="bg-white border rounded-lg overflow-hidden"
          :class="{ 
            'opacity-50': !category.isActive,
            'dragging border-2 border-primary-500 shadow-lg': dragIndex === index
          }"
          :draggable="true"
          @dragstart="handleDragStart($event, index, category)"
          @dragover.prevent="handleDragOver($event, index)"
          @dragend="handleDragEnd($event)"
          @dragenter.prevent
          @dragleave.prevent
          @drop.prevent="handleDrop($event, index)"
        >
          <div class="p-6">
            <div class="flex items-start">
              <!-- Drag Handle -->
              <div class="drag-handle cursor-grab text-gray-400 hover:text-gray-600 mr-4 mt-1 select-none text-2xl">
                ⋮⋮
              </div>

              <!-- Contenido -->
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center ">
                    <div class="w-6 h-6" v-html="category.icon"></div>
                  </div>
                  <div>
                    <h3 class="text-lg font-medium text-gray-900 flex items-center">
                      {{ category.name }}
                      <span class="ml-3 text-xs text-gray-500">#{{ index + 1 }}</span>
                    </h3>
                    <p class="text-sm text-gray-500">ID: {{ category.categoryId }}</p>
                  </div>
                </div>
                
                <p class="mt-2 text-gray-600">{{ category.description }}</p>
                
                <div class="mt-4 flex items-center space-x-4 text-sm">
                  <span class="text-gray-500">Orden: {{ category.order }}</span>
                  <span class="text-gray-500">•</span>
                  <span class="text-gray-500">Links: {{ category.linksCount || 0 }}</span>
                  <span class="text-gray-500">•</span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    :class="category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  >
                    {{ category.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>

              <!-- Acciones -->
              <div class="flex space-x-2">
                <NuxtLink :to="`/tabs/categorias/${category.categoryId}/links`">
                  <button
                    class="p-2 text-gray-400 hover:text-primary-600"
                    title="Gestionar Links"
                  >
                    🔗
                  </button>
                </NuxtLink>
                <button
                  @click="openCategoryModal(category)"
                  class="p-2 text-gray-400 hover:text-primary-600"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  @click="toggleCategory(category)"
                  class="p-2 text-gray-400 hover:text-primary-600"
                  :title="category.isActive ? 'Desactivar' : 'Activar'"
                >
                  {{ category.isActive ? '⏸️' : '▶️' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Modal de Categoría -->
    <Modal v-model="showCategoryModal" :title="modalTitle" size="lg">
      <CategoryForm
        :category="selectedCategory"
        :loading="saving"
        @submit="saveCategory"
        @cancel="showCategoryModal = false"
      />
    </Modal>

    <!-- Toast de notificación -->
    <div v-if="toast.show" 
         class="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 z-50"
         :class="{
           'bg-green-500 text-white': toast.type === 'success',
           'bg-red-500 text-white': toast.type === 'error',
           'bg-blue-500 text-white': toast.type === 'info'
         }"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTabsApi, type TabCategory } from '~/composables/useTabsApi'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const tabsApi = useTabsApi()

// Estado para categorías
const categories = ref<TabCategory[]>([])
const orderedCategories = ref<TabCategory[]>([])
const categoriesLoading = ref(false)
const categoriesError = ref<string | null>(null)

// Estado para drag and drop
const dragIndex = ref<number | null>(null)
const isReordering = ref(false)

// Estado para modal
const showCategoryModal = ref(false)
const selectedCategory = ref<TabCategory | null>(null)
const saving = ref(false)

// Estado para toast
const toast = ref({
  show: false,
  message: '',
  type: 'info' as 'success' | 'error' | 'info'
})

const modalTitle = computed(() => 
  selectedCategory.value ? 'Editar Categoría' : 'Nueva Categoría'
)

// Mostrar toast
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// Cargar categorías
const loadCategories = async () => {
  try {
    categoriesLoading.value = true
    categoriesError.value = null
    const data = await tabsApi.getCategories(true)
    categories.value = data
    orderedCategories.value = [...data].sort((a, b) => a.order - b.order)
  } catch (error: any) {
    categoriesError.value = error.message
    showToast(error.message, 'error')
  } finally {
    categoriesLoading.value = false
  }
}

// Drag and drop
const handleDragStart = (event: DragEvent, index: number, category: TabCategory) => {
  dragIndex.value = index
  event.dataTransfer?.setData('text/plain', JSON.stringify({
    index,
    categoryId: category.categoryId
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
    
    const newOrder = [...orderedCategories.value]
    const [draggedItem] = newOrder.splice(draggedData.index, 1)
    newOrder.splice(dropIndex, 0, draggedItem)
    orderedCategories.value = newOrder
    
  } catch (error) {
    console.error('Error parsing drag data:', error)
  }
}

const handleDragEnd = async (event: DragEvent) => {
  if (dragIndex.value === null || isReordering.value) {
    dragIndex.value = null
    return
  }
  
  const orderToSend = orderedCategories.value.map((category, index) => ({
    categoryId: category.categoryId,
    order: (index + 1) * 10
  }))
  
  try {
    isReordering.value = true
    
    for (const item of orderToSend) {
      await tabsApi.updateCategory(item.categoryId, { order: item.order })
    }
    
    await loadCategories()
    showToast('Orden actualizado correctamente', 'success')
    
  } catch (error: any) {
    showToast('Error al actualizar el orden', 'error')
    await loadCategories()
  } finally {
    isReordering.value = false
    dragIndex.value = null
  }
}

// Acciones de categoría
const openCategoryModal = (category?: TabCategory) => {
  selectedCategory.value = category || null
  showCategoryModal.value = true
}

const saveCategory = async (formData: any) => {
  try {
    saving.value = true
    if (selectedCategory.value) {
      await tabsApi.updateCategory(selectedCategory.value.categoryId, formData)
      showToast('Categoría actualizada', 'success')
    } else {
      await tabsApi.createCategory(formData)
      showToast('Categoría creada', 'success')
    }
    showCategoryModal.value = false
    await loadCategories()
  } catch (error: any) {
    showToast(error.message, 'error')
  } finally {
    saving.value = false
  }
}

const toggleCategory = async (category: TabCategory) => {
  try {
    await tabsApi.updateCategory(category.categoryId, {
      isActive: !category.isActive
    })
    await loadCategories()
    showToast(
      category.isActive ? 'Categoría desactivada' : 'Categoría activada',
      'success'
    )
  } catch (error: any) {
    showToast(error.message, 'error')
  }
}

onMounted(() => {
  loadCategories()
})
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