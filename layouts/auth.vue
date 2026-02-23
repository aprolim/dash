<!-- layouts/auth.vue -->
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <!-- Logo -->
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <div class="h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">SB</span>
        </div>
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Senado de Bolivia
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Panel de Administración
      </p>
    </div>

    <!-- Contenido de autenticación -->
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <slot />
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center">
      <p class="text-sm text-gray-500">
        © {{ new Date().getFullYear() }} Senado de Bolivia
      </p>
      <p class="text-xs text-gray-400 mt-1">
        Sistema de gestión de contenido
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Layout específico para páginas de autenticación
</script>