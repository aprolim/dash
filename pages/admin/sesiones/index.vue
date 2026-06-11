<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin" class="text-gray-400 hover:text-gray-600 text-2xl">
        ←
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Gestión de Sesiones</h1>
        <p class="text-sm text-gray-500 mt-1">Administra los videos que aparecen en la sección "Sesiones" del centro de noticias</p>
      </div>
    </div>
    
    <SesionesEditor />
  </div>
</template>

<script setup lang="ts">
import SesionesEditor from '~/components/admin/SesionesEditor.vue'

definePageMeta({ 
  layout: 'default', 
  middleware: 'auth' 
})
</script>