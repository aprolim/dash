<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin" class="text-gray-400 hover:text-gray-600 text-2xl">
        ←
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Gestión de Sesiones</h1>
        <p class="text-sm text-gray-500 mt-1">Administra los videos y fechas de sesiones</p>
      </div>
    </div>
    
    <!-- Tabs para navegar entre secciones -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex space-x-8">
        <button 
          @click="tabActivo = 'videos'"
          class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
          :class="tabActivo === 'videos' ? 'border-[#E03636] text-[#E03636]' : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
          🎥 Videos de Sesiones
        </button>
        <button 
          @click="tabActivo = 'fechas'"
          class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
          :class="tabActivo === 'fechas' ? 'border-[#E03636] text-[#E03636]' : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
          📅 Calendario de Sesiones
        </button>
      </nav>
    </div>

    <!-- Contenido de pestañas -->
    <SesionesEditor v-if="tabActivo === 'videos'" />
    <SesionesFechasEditor v-else />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SesionesEditor from '~/components/admin/SesionesEditor.vue'
import SesionesFechasEditor from '~/components/admin/SesionesFechasEditor.vue'

definePageMeta({ 
  layout: 'default', 
  middleware: 'auth' 
})

const tabActivo = ref('videos')
</script>