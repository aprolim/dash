<!-- components/tabs/preview/TabsPublicPreview.vue -->
<template>
  <div class="bg-white rounded-lg shadow-sm overflow-hidden">
    <!-- Header simulado del portal -->
    <div class="bg-primary-900 text-white px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <!-- Escudo simulado -->
          <div class="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center">
            <span class="text-xl">⚖️</span>
          </div>
          <div>
            <div class="text-xs text-primary-200">ESTADO PLURINACIONAL DE</div>
            <div class="text-xl font-bold">BOLIVIA</div>
          </div>
        </div>
        <div class="text-sm text-primary-200">{{ currentDate }}</div>
      </div>
    </div>

    <!-- Tabs principales -->
    <div class="border-b border-gray-200 bg-white">
      <div class="px-6">
        <nav class="flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="py-4 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap"
            :class="activeTab === tab.id
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            <div class="flex items-center space-x-2">
              <div class="w-5 h-5" v-html="tab.icono"></div>
              <span>{{ tab.label }}</span>
            </div>
          </button>
        </nav>
      </div>
    </div>

    <!-- Contenido de la pestaña activa -->
    <div class="p-6">
      <!-- Loading state -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-2 text-sm text-gray-500">Cargando vista previa...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 p-4 rounded-md">
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>

      <!-- Vista previa real -->
      <template v-else-if="currentTabData">
        <!-- Título del área -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            {{ currentTabData.titulo }}
          </h2>
          <p class="text-gray-600">
            {{ currentTabData.descripcion }}
          </p>
        </div>

        <!-- Grid de links -->
        <div v-if="currentTabLinks.length > 0" 
             class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="link in currentTabLinks"
            :key="link.id"
            class="group border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-primary-200 transition-all duration-200 cursor-pointer"
            @click="previewLink(link)"
          >
            <div class="flex items-start space-x-4">
              <!-- Icono -->
              <div class="flex-shrink-0">
                <div class="w-12 h-12 transform group-hover:scale-110 transition-transform duration-200"
                     v-html="link.icono">
                </div>
              </div>
              
              <!-- Contenido -->
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 mb-1 group-hover:text-primary-700">
                  {{ link.titulo }}
                </h3>
                <p class="text-sm text-gray-600 line-clamp-2">
                  {{ link.descripcion }}
                </p>
                <!-- Badge de estado (solo en CMS) -->
                <div v-if="!isLinkActive(link)" class="mt-2">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    ⏸️ Inactivo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje sin links -->
        <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
          <div class="text-4xl mb-3 text-gray-400">📭</div>
          <p class="text-gray-500">No hay links en esta categoría</p>
          <p class="text-sm text-gray-400 mt-1">
            Agrega links desde el panel de administración
          </p>
        </div>
      </template>

      <!-- Sin datos -->
      <div v-else class="text-center py-12 text-gray-500">
        <div class="text-4xl mb-3">🔍</div>
        <p>No hay datos para mostrar</p>
      </div>
    </div>

    <!-- Mini modal de preview de link -->
    <Modal v-model="showLinkPreview" :title="selectedLink?.titulo || 'Vista previa del link'">
      <div class="p-4">
        <div class="flex items-center space-x-4 mb-4">
          <div class="w-16 h-16" v-html="selectedLink?.icono"></div>
          <div>
            <h3 class="font-medium text-gray-900">{{ selectedLink?.titulo }}</h3>
            <p class="text-sm text-gray-600">{{ selectedLink?.descripcion }}</p>
          </div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-700">
            <span class="font-medium">Ruta:</span> 
            <span class="font-mono text-primary-600">{{ selectedLink?.path }}</span>
          </p>
          <p class="text-sm text-gray-700 mt-2">
            <span class="font-medium">ID:</span> 
            <span class="font-mono">{{ selectedLink?.id }}</span>
          </p>
        </div>

        <div class="mt-4 flex justify-end">
          <button
            @click="showLinkPreview = false"
            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from '~/components/ui/Modal.vue'

const props = defineProps<{
  data: any
  loading?: boolean
  error?: string | null
}>()

const activeTab = ref('legislacion')
const showLinkPreview = ref(false)
const selectedLink = ref<any>(null)

// Fecha actual formateada
const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
})

// Computed properties
const tabs = computed(() => props.data?.tabs || [])

const currentTabData = computed(() => {
  if (!props.data?.areas) return null
  return props.data.areas[activeTab.value]
})

const currentTabLinks = computed(() => {
  if (!props.data?.links) return []
  return props.data.links[activeTab.value] || []
})

// Función para determinar si un link está activo (para mostrar badge)
const isLinkActive = (link: any) => {
  // En el frontend público todos los links se muestran
  // Este badge es solo informativo para el CMS
  return true // O puedes poner tu lógica: link.isActive !== false
}

// Preview de link individual
const previewLink = (link: any) => {
  selectedLink.value = link
  showLinkPreview.value = true
}

// Watch para cambiar pestaña si la actual no existe
watch(() => props.data, (newData) => {
  if (newData?.tabs?.length > 0) {
    const tabExists = newData.tabs.some((t: any) => t.id === activeTab.value)
    if (!tabExists) {
      activeTab.value = newData.tabs[0].id
    }
  }
}, { deep: true })
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>