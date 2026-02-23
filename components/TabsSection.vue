<!-- components/TabsSection.vue -->
<template>
  <div class="bg-white">
    <!-- Loading state -->
    <div v-if="loading" class="container mx-auto px-4 py-12">
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="container mx-auto px-4 py-12">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p class="text-red-600">{{ error }}</p>
      </div>
    </div>

    <!-- Tabs content -->
    <template v-else-if="tabsData.tabs.length > 0">
      <!-- Tabs navigation -->
      <div class="border-b border-gray-200">
        <div class="container mx-auto px-4">
          <nav class="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
              v-for="tab in tabsData.tabs"
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

      <!-- Active tab content -->
      <div class="container mx-auto px-4 py-12">
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
            <!-- Area title -->
            <div v-if="currentArea" class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">
                {{ currentArea.titulo }}
              </h2>
              <p class="text-gray-600">{{ currentArea.descripcion }}</p>
            </div>

            <!-- Links grid -->
            <div v-if="currentLinks.length > 0" 
                 class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <NuxtLink
                v-for="link in currentLinks"
                :key="link.id"
                :to="link.path"
                class="group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-primary-200 transition-all duration-200"
              >
                <div class="flex items-start space-x-4">
                  <!-- Icon -->
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 transform group-hover:scale-110 transition-transform duration-200"
                         v-html="link.icono">
                    </div>
                  </div>
                  
                  <!-- Content -->
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900 mb-1 group-hover:text-primary-700">
                      {{ link.titulo }}
                    </h3>
                    <p class="text-sm text-gray-600">
                      {{ link.descripcion }}
                    </p>
                  </div>
                </div>
              </NuxtLink>
            </div>

            <!-- No links message -->
            <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
              <div class="text-4xl mb-3 text-gray-400">📭</div>
              <p class="text-gray-500">No hay contenido disponible en esta sección</p>
            </div>
          </div>
        </Transition>
      </div>
    </template>

    <!-- No tabs message -->
    <div v-else class="container mx-auto px-4 py-12 text-center text-gray-500">
      <p>No hay contenido configurado</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTabs, type TabsData } from '~/composables/useTabs'

const props = defineProps<{
  initialTab?: string
}>()

const tabsApi = useTabs()
const loading = ref(true)
const error = ref<string | null>(null)
const tabsData = ref<TabsData>({
  tabs: [],
  areas: {},
  links: {}
})
const activeTab = ref(props.initialTab || '')

// Computed properties
const currentArea = computed(() => 
  activeTab.value ? tabsData.value.areas[activeTab.value] : null
)

const currentLinks = computed(() => 
  activeTab.value ? tabsData.value.links[activeTab.value] || [] : []
)

// Load tabs data
onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    tabsData.value = await tabsApi.getTabsData()
    
    // Set initial active tab
    if (tabsData.value.tabs.length > 0) {
      if (!activeTab.value || !tabsData.value.tabs.some(t => t.id === activeTab.value)) {
        activeTab.value = tabsData.value.tabs[0].id
      }
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>