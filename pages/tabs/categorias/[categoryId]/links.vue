<!-- pages/tabs/categorias/[categoryId]/links.vue -->
<template>
  <div>
    <div class="mb-6 flex items-center space-x-2">
      <NuxtLink to="/tabs" class="text-gray-400 hover:text-gray-600 text-xl">
        ←
      </NuxtLink>
      <h1 class="text-2xl font-semibold text-gray-900">Links: {{ categoryName }}</h1>
    </div>

    <!-- Instrucciones -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-700">
      <div class="flex items-center space-x-2">
        <span class="text-lg">🖱️</span>
        <span><strong>Arrastra</strong> los links usando el ícono ⋮⋮ para reordenarlos. El cambio se guarda automáticamente.</span>
      </div>
    </div>

    <LinksList
      :category-id="categoryId"
      :category-name="categoryName"
      :links="links"
      :loading="loading"
      :error="error"
      @create="openLinkModal()"
      @edit="openLinkModal($event)"
      @toggle="toggleLink"
      @reorder="reorderLinks"
    />

    <!-- Modal de Link -->
    <Modal v-model="showLinkModal" :title="modalTitle" size="lg">
      <LinkForm
        :link="selectedLink"
        :category-id="categoryId"
        :loading="saving"
        @submit="saveLink"
        @cancel="showLinkModal = false"
      />
    </Modal>

    <!-- Toast -->
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
import { useTabsApi, type TabLink } from '~/composables/useTabsApi'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const tabsApi = useTabsApi()
const categoryId = route.params.categoryId as string

// Estado
const categoryName = ref('')
const links = ref<TabLink[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Modal
const showLinkModal = ref(false)
const selectedLink = ref<TabLink | null>(null)
const saving = ref(false)

// Toast
const toast = ref({
  show: false,
  message: '',
  type: 'info' as 'success' | 'error' | 'info'
})

const modalTitle = computed(() => 
  selectedLink.value ? 'Editar Link' : 'Nuevo Link'
)

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// Cargar datos
const loadData = async () => {
  try {
    loading.value = true
    error.value = null

    // Cargar categoría
    const category = await tabsApi.getCategory(categoryId)
    categoryName.value = category.name

    // Cargar links
    const response = await tabsApi.getLinks({ 
      categoryId, 
      includeInactive: true 
    })
    links.value = response.links || []
  } catch (error: any) {
    error.value = error.message
    showToast(error.message, 'error')
  } finally {
    loading.value = false
  }
}

// Abrir modal de link
const openLinkModal = (link?: TabLink) => {
  selectedLink.value = link || null
  showLinkModal.value = true
}

// Guardar link
const saveLink = async (formData: any) => {
  try {
    saving.value = true
    if (selectedLink.value) {
      await tabsApi.updateLink(selectedLink.value.linkId, formData)
      showToast('Link actualizado', 'success')
    } else {
      await tabsApi.createLink({
        ...formData,
        categoryId
      })
      showToast('Link creado', 'success')
    }
    showLinkModal.value = false
    await loadData()
  } catch (error: any) {
    showToast(error.message, 'error')
  } finally {
    saving.value = false
  }
}

// Activar/Desactivar link
const toggleLink = async (link: TabLink) => {
  try {
    await tabsApi.updateLink(link.linkId, {
      isActive: !link.isActive
    })
    await loadData()
    showToast(
      link.isActive ? 'Link desactivado' : 'Link activado',
      'success'
    )
  } catch (error: any) {
    showToast(error.message, 'error')
  }
}

// Reordenar links
const reorderLinks = async (order: { linkId: string; position: number }[]) => {
  try {
    await tabsApi.reorderLinks(categoryId, order)
    await loadData()
    showToast('Orden actualizado', 'success')
  } catch (error: any) {
    showToast(error.message, 'error')
  }
}

onMounted(() => {
  loadData()
})
</script>