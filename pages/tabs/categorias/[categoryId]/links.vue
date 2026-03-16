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

    <!-- Debug info (opcional) -->
    <div v-if="debug" class="mb-4 p-4 bg-gray-100 rounded-lg text-xs font-mono">
      <div>🔍 Debug:</div>
      <div>links count: {{ links.length }}</div>
      <div>loading: {{ loading }}</div>
      <div>saving: {{ saving }}</div>
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

// Debug flag
const debug = ref(false) // Cambiar a false en producción

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
  console.log('\n🔵 ===== loadData INICIANDO =====')
  console.log('categoryId:', categoryId)
  
  try {
    loading.value = true
    error.value = null

    // Cargar categoría
    const category = await tabsApi.getCategory(categoryId)
    categoryName.value = category.name

    // Cargar links
    const data = await tabsApi.getLinks({ 
      categoryId, 
      includeInactive: true 
    })
    
    links.value = data.links || []
    console.log('✅ Links cargados:', links.value.length)
    
  } catch (error: any) {
    console.error('❌ ERROR en loadData:', error)
    error.value = error.message
    showToast(error.message, 'error')
  } finally {
    loading.value = false
    console.log('🔵 ===== loadData COMPLETADO =====\n')
  }
}

// Abrir modal de link
const openLinkModal = (link?: TabLink) => {
  console.log('🚪 Abriendo modal con link:', link?.linkId)
  selectedLink.value = link || null
  showLinkModal.value = true
}

// Guardar link - VERSIÓN CORREGIDA (todos los campos se actualizan)
const saveLink = async (formData: any) => {
  console.log('💾 Guardando link:', formData)
  console.log('📦 Links antes de guardar:', links.value.map(l => ({ 
    id: l.linkId, 
    titulo: l.titulo,
    descripcion: l.descripcion,
    path: l.path,
    orden: l.orden,
    iconoPreview: l.icono ? l.icono.substring(0, 30) + '...' : 'VACÍO'
  })))
  
  try {
    saving.value = true
    
    if (selectedLink.value) {
      // Actualizar link existente
      console.log('📡 Actualizando link:', selectedLink.value.linkId)
      
      // Guardar el linkId antes de usarlo
      const linkIdToUpdate = selectedLink.value.linkId
      
      // Enviar al servidor
      const updatedLinkFromServer = await tabsApi.updateLink(
        linkIdToUpdate, 
        formData
      )
      console.log('✅ Respuesta del servidor:', updatedLinkFromServer)
      
      // ✅ ACTUALIZACIÓN CORREGIDA - Usar formData para TODOS los campos
      const index = links.value.findIndex(l => l.linkId === linkIdToUpdate)
      console.log('🔍 Índice encontrado:', index)
      
      if (index !== -1) {
        // Crear nuevo array
        const newLinks = [...links.value]
        
        // ✅ IMPORTANTE: Usar formData para todos los campos, no solo la respuesta
        newLinks[index] = {
          ...links.value[index],        // Mantener propiedades existentes (isActive, createdAt, etc.)
          ...formData,                  // ← USAR formData (título, descripción, icono, path, orden)
          linkId: links.value[index].linkId, // Asegurar que no se pierda el ID
          categoryId: links.value[index].categoryId, // Mantener categoryId
          isActive: links.value[index].isActive, // Mantener estado activo/inactivo
          updatedAt: new Date().toISOString()
        }
        
        // Asegurar que el icono esté presente
        if (formData.icono) {
          newLinks[index].icono = formData.icono
        }
        
        // Asignar el nuevo array
        links.value = newLinks
        
        console.log('✅ Link actualizado localmente con TODOS los campos:', {
          id: newLinks[index].linkId,
          titulo: newLinks[index].titulo,
          descripcion: newLinks[index].descripcion,
          path: newLinks[index].path,
          orden: newLinks[index].orden,
          iconoPreview: newLinks[index].icono ? newLinks[index].icono.substring(0, 30) + '...' : 'VACÍO'
        })
      }
      
      showToast('Link actualizado', 'success')
    } else {
      // Crear nuevo link
      console.log('📡 Creando nuevo link')
      const newLink = await tabsApi.createLink({
        ...formData,
        categoryId
      })
      console.log('✅ Link creado:', newLink)
      
      links.value = [...links.value, newLink].sort((a, b) => a.orden - b.orden)
      showToast('Link creado', 'success')
    }
    
    showLinkModal.value = false
    
    // Verificar después de guardar
    console.log('📦 Links después de guardar:', links.value.map(l => ({ 
      id: l.linkId, 
      titulo: l.titulo,
      descripcion: l.descripcion,
      path: l.path,
      orden: l.orden,
      iconoPreview: l.icono ? l.icono.substring(0, 30) + '...' : 'VACÍO'
    })))
    
  } catch (error: any) {
    console.error('❌ Error guardando link:', error)
    showToast(error.message, 'error')
    // Solo recargar si hay error
    await loadData()
  } finally {
    saving.value = false
  }
}

// Activar/Desactivar link
const toggleLink = async (link: TabLink) => {
  console.log('🔄 Toggle link:', link.linkId, 'estado actual:', link.isActive)
  
  try {
    await tabsApi.updateLink(link.linkId, {
      isActive: !link.isActive
    })
    
    // Actualizar localmente
    const index = links.value.findIndex(l => l.linkId === link.linkId)
    if (index !== -1) {
      const newLinks = [...links.value]
      newLinks[index] = {
        ...newLinks[index],
        isActive: !link.isActive
      }
      links.value = newLinks
    }
    
    showToast(link.isActive ? 'Link desactivado' : 'Link activado', 'success')
  } catch (error: any) {
    console.error('❌ Error toggling link:', error)
    showToast(error.message, 'error')
    await loadData() // Recargar si hay error
  }
}

// Reordenar links
const reorderLinks = async (order: { linkId: string; position: number }[]) => {
  console.log('📊 Reordenando links:', order)
  
  try {
    await tabsApi.reorderLinks(categoryId, order)
    await loadData() // Recargar para obtener el orden confirmado
    showToast('Orden actualizado', 'success')
  } catch (error: any) {
    console.error('❌ Error reordering links:', error)
    showToast(error.message, 'error')
  }
}

onMounted(() => {
  console.log('🚀 Página montada, cargando datos...')
  loadData()
})
</script>