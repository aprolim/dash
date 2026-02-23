<!-- components/tabs/TabsPreview.vue - Versión mejorada -->
<template>
  <div>
    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex space-x-8" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="group relative py-4 px-1 font-medium text-sm focus:outline-none"
          :class="activeTab === tab.id
            ? 'text-primary-600'
            : 'text-gray-500 hover:text-gray-700'"
        >
          <div class="flex items-center space-x-2">
            <div class="w-5 h-5" v-html="tab.icono"></div>
            <span>{{ tab.label }}</span>
          </div>
          <!-- Indicador de pestaña activa -->
          <span
            class="absolute bottom-0 left-0 right-0 h-0.5 transform transition-transform"
            :class="activeTab === tab.id ? 'bg-primary-600' : 'bg-transparent'"
          />
        </button>
      </nav>
    </div>

    <!-- Contenido de la pestaña activa -->
    <div v-if="currentTabData" class="space-y-6">
      <!-- Animación de entrada -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
        mode="out-in"
      >
        <div :key="activeTab">
          <!-- Encabezado del área -->
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-2 flex items-center">
              <span 
                class="inline-block w-1 h-6 rounded-full mr-3"
                :style="{ backgroundColor: currentTabData.color }"
              />
              {{ currentTabData.titulo }}
            </h2>
            <p class="text-gray-600">{{ currentTabData.descripcion }}</p>
          </div>

          <!-- Estadísticas rápidas -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-gray-50 rounded-lg p-3 text-center">
              <div class="text-2xl font-semibold text-primary-600">
                {{ currentTabLinks.length }}
              </div>
              <div class="text-xs text-gray-500">Links disponibles</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-3 text-center">
              <div class="text-2xl font-semibold text-green-600">
                {{ activeLinksCount }}
              </div>
              <div class="text-xs text-gray-500">Links activos</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-3 text-center">
              <div class="text-2xl font-semibold text-blue-600">
                {{ new Date().toLocaleDateString() }}
              </div>
              <div class="text-xs text-gray-500">Actualizado</div>
            </div>
          </div>

          <!-- Grid de links -->
          <div 
            class="grid gap-4"
            :class="gridColsClass"
          >
            <div
              v-for="link in currentTabLinks"
              :key="link.id"
              class="group bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-primary-300 cursor-pointer"
              :class="{ 'opacity-60': !isLinkActive(link) }"
              @click="previewLink(link)"
            >
              <div class="flex items-start space-x-4">
                <!-- Icono con efecto hover -->
                <div class="flex-shrink-0">
                  <div 
                    class="w-12 h-12 transition-transform group-hover:scale-110"
                    v-html="link.icono"
                  ></div>
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <h3 class="font-medium text-gray-900 truncate group-hover:text-primary-600">
                      {{ link.titulo }}
                    </h3>
                    <!-- Badge de estado -->
                    <span 
                      v-if="!isLinkActive(link)"
                      class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                    >
                      Inactivo
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                    {{ link.descripcion }}
                  </p>
                  <p class="text-xs text-gray-400 mt-2 font-mono">
                    {{ link.path }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Mensaje si no hay links -->
          <div v-if="currentTabLinks.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
            <div class="text-4xl mb-3">📭</div>
            <p class="text-gray-500">No hay links en esta categoría</p>
            <p class="text-sm text-gray-400 mt-1">Agrega links desde el panel de administración</p>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Mensaje si no hay datos -->
    <div v-else class="text-center py-12 text-gray-500">
      <div class="text-4xl mb-3">🔍</div>
      <p>No hay datos para mostrar</p>
      <p class="text-sm text-gray-400 mt-1">Configura las categorías para ver la vista previa</p>
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
import { ref, computed } from 'vue'
import Modal from '~/components/ui/Modal.vue'

const props = defineProps<{
  data: any
}>()

const activeTab = ref('legislacion')
const showLinkPreview = ref(false)
const selectedLink = ref<any>(null)

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

const activeLinksCount = computed(() => {
  return currentTabLinks.value.filter((link: any) => isLinkActive(link)).length
})

const gridColsClass = computed(() => {
  const count = currentTabLinks.value.length
  if (count === 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-1 md:grid-cols-2'
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
})

// Funciones helper
const isLinkActive = (link: any) => {
  // Por ahora todos los links están activos en la preview
  // Puedes modificar esto según tu lógica de negocio
  return true
}

const previewLink = (link: any) => {
  selectedLink.value = link
  showLinkPreview.value = true
}

// Watch for tab changes
watch(() => props.data, (newData) => {
  if (newData?.tabs?.length > 0 && !newData.tabs.find((t: any) => t.id === activeTab.value)) {
    activeTab.value = newData.tabs[0].id
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