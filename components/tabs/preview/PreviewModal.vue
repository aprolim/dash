<!-- components/tabs/preview/PreviewModal.vue -->
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" @click.self="$emit('update:modelValue', false)">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <!-- Fondo oscuro -->
          <div class="fixed inset-0 transition-opacity" aria-hidden="true">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <!-- Contenedor del modal -->
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to-class="opacity-100 translate-y-0 sm:scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              v-if="modelValue"
              class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full"
            >
              <!-- Header -->
              <div class="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Vista Previa en Tiempo Real</h3>
                  <p class="text-sm text-gray-500">Así se verán los cambios en el portal</p>
                </div>
                <div class="flex items-center space-x-4">
                  <!-- Indicador de auto-actualización -->
                  <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-500">Auto-actualizar</span>
                    <button
                      @click="autoRefresh = !autoRefresh"
                      class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none"
                      :class="autoRefresh ? 'bg-primary-600' : 'bg-gray-200'"
                    >
                      <span
                        class="inline-block w-4 h-4 transform transition-transform bg-white rounded-full"
                        :class="autoRefresh ? 'translate-x-6' : 'translate-x-1'"
                      />
                    </button>
                  </div>
                  <button
                    @click="$emit('update:modelValue', false)"
                    class="text-gray-400 hover:text-gray-600"
                  >
                    <span class="text-2xl">&times;</span>
                  </button>
                </div>
              </div>

              <!-- Content - Vista previa -->
              <div class="bg-white p-6 max-h-[70vh] overflow-y-auto">
                <!-- Toolbar de dispositivos -->
                <div class="flex justify-center space-x-2 mb-6 pb-4 border-b">
                  <button
                    v-for="device in devices"
                    :key="device.id"
                    @click="selectedDevice = device.id"
                    class="px-4 py-2 rounded-md text-sm flex items-center space-x-2"
                    :class="selectedDevice === device.id 
                      ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  >
                    <span>{{ device.icon }}</span>
                    <span>{{ device.name }}</span>
                  </button>
                </div>

                <!-- Contenedor con tamaño simulado -->
                <div
                  class="mx-auto transition-all duration-300"
                  :style="containerStyle"
                >
                  <!-- Loading state -->
                  <div v-if="loading" class="text-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p class="mt-4 text-gray-600">Cargando vista previa...</p>
                  </div>

                  <!-- Error state -->
                  <div v-else-if="error" class="bg-red-50 p-4 rounded-md">
                    <p class="text-red-800">{{ error }}</p>
                  </div>

                  <!-- Vista previa real -->
                  <div v-else class="border rounded-lg overflow-hidden shadow-lg">
                    <!-- Header simulado del portal -->
                    <div class="bg-gray-900 text-white px-6 py-3 flex items-center">
                      <div class="flex space-x-2 mr-4">
                        <div class="w-3 h-3 rounded-full bg-red-500"></div>
                        <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div class="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div class="text-sm font-mono">portal.senado.bo</div>
                    </div>

                    <!-- Tabs simuladas -->
                    <div class="border-b border-gray-200 bg-white">
                      <nav class="flex px-6" aria-label="Tabs">
                        <button
                          v-for="tab in previewData?.tabs || []"
                          :key="tab.id"
                          @click="selectedTab = tab.id"
                          class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
                          :class="selectedTab === tab.id
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                        >
                          <div class="flex items-center space-x-2">
                            <div class="w-5 h-5" v-html="tab.icono"></div>
                            <span>{{ tab.label }}</span>
                          </div>
                        </button>
                      </nav>
                    </div>

                    <!-- Contenido de la pestaña seleccionada -->
                    <div class="p-6 bg-gray-50">
                      <div v-if="selectedTabData" class="space-y-6">
                        <!-- Título del área -->
                        <div>
                          <h2 class="text-xl font-semibold text-gray-900 mb-2">
                            {{ selectedTabData.titulo }}
                          </h2>
                          <p class="text-gray-600">{{ selectedTabData.descripcion }}</p>
                        </div>

                        <!-- Grid de links -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div
                            v-for="link in selectedTabLinks"
                            :key="link.id"
                            class="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <div class="flex items-start space-x-4">
                              <div class="flex-shrink-0">
                                <div class="w-10 h-10" v-html="link.icono"></div>
                              </div>
                              <div class="flex-1">
                                <h3 class="font-medium text-gray-900">{{ link.titulo }}</h3>
                                <p class="text-sm text-gray-600 mt-1">{{ link.descripcion }}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Mensaje si no hay datos -->
                      <div v-else class="text-center py-12 text-gray-500">
                        No hay contenido para mostrar en esta pestaña
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
                <div class="text-sm text-gray-500">
                  <span>🔄 Última actualización: {{ lastUpdate || 'Nunca' }}</span>
                </div>
                <div class="flex space-x-3">
                  <button
                    @click="refreshPreview"
                    class="px-4 py-2 border rounded-md hover:bg-gray-100 flex items-center space-x-2"
                    :disabled="refreshing"
                  >
                    <span :class="{ 'animate-spin': refreshing }">🔄</span>
                    <span>Actualizar ahora</span>
                  </button>
                  <button
                    @click="$emit('update:modelValue', false)"
                    class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTabsApi } from '~/composables/useTabsApi'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const tabsApi = useTabsApi()

// Estado
const previewData = ref<any>(null)
const loading = ref(false)
const refreshing = ref(false)
const error = ref<string | null>(null)
const selectedTab = ref('legislacion')
const lastUpdate = ref<string | null>(null)
const autoRefresh = ref(true)
let refreshInterval: NodeJS.Timeout | null = null

// Dispositivos para vista previa responsive
const devices = [
  { id: 'desktop', name: 'Escritorio', icon: '🖥️', width: '100%' },
  { id: 'tablet', name: 'Tablet', icon: '📱', width: '768px' },
  { id: 'mobile', name: 'Móvil', icon: '📱', width: '375px' }
]
const selectedDevice = ref('desktop')

const containerStyle = computed(() => ({
  maxWidth: devices.find(d => d.id === selectedDevice.value)?.width || '100%'
}))

// Datos de la pestaña seleccionada
const selectedTabData = computed(() => {
  if (!previewData.value?.areas) return null
  return previewData.value.areas[selectedTab.value]
})

const selectedTabLinks = computed(() => {
  if (!previewData.value?.links) return []
  return previewData.value.links[selectedTab.value] || []
})

// Cargar datos
const loadPreviewData = async (showLoading = true) => {
  if (showLoading) loading.value = true
  else refreshing.value = true
  
  error.value = null
  
  try {
    const data = await tabsApi.getTabsData()
    previewData.value = data
    lastUpdate.value = new Date().toLocaleTimeString()
    
    // Seleccionar primera pestaña si existe
    if (data?.tabs?.length > 0 && !data.tabs.find((t: any) => t.id === selectedTab.value)) {
      selectedTab.value = data.tabs[0].id
    }
    
    console.log('✅ Vista previa actualizada:', lastUpdate.value)
  } catch (err: any) {
    error.value = err.message
    console.error('Error cargando vista previa:', err)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// Refresh manual
const refreshPreview = () => {
  loadPreviewData(false)
}

// Auto-refresh
watch(autoRefresh, (newValue) => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
  
  if (newValue && props.modelValue) {
    refreshInterval = setInterval(() => {
      loadPreviewData(false)
    }, 5000) // Actualizar cada 5 segundos
  }
})

// Reset cuando se cierra el modal
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    loadPreviewData(true)
    
    if (autoRefresh.value) {
      refreshInterval = setInterval(() => {
        loadPreviewData(false)
      }, 5000)
    }
  } else {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }
})

// Limpiar al desmontar
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>