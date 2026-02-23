<!-- pages/dashboard/index.vue -->
<template>
  <div>
    <!-- Estadísticas principales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span class="text-blue-600 text-xl">📊</span>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Visitas Hoy</p>
            <p class="text-2xl font-semibold text-gray-900">1,248</p>
            <p class="text-sm text-green-600">+12.5%</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span class="text-green-600 text-xl">📝</span>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Contenido Activo</p>
            <p class="text-2xl font-semibold text-gray-900">342</p>
            <p class="text-sm text-green-600">+8.2%</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span class="text-purple-600 text-xl">👥</span>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Legisladores</p>
            <p class="text-2xl font-semibold text-gray-900">36</p>
            <p class="text-sm text-gray-500">Completo</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span class="text-orange-600 text-xl">👤</span>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Usuarios Activos</p>
            <p class="text-2xl font-semibold text-gray-900">24</p>
            <p class="text-sm text-green-600">+3.4%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bienvenida -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">¡Bienvenido al Panel de Administración!</h2>
      <p class="text-gray-600 mb-4">
        Sistema de gestión de contenido para el portal web del Senado de Bolivia.
      </p>
      
      <div class="mt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-3">Próximos pasos:</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="border border-gray-200 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-2">✅ Configuración completada</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Nuxt 4 instalado</li>
              <li>• Tailwind CSS funcionando</li>
              <li>• Sistema de autenticación básico</li>
              <li>• Layouts configurados</li>
            </ul>
          </div>
          
          <div class="border border-gray-200 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-2">🚀 Próximo: Paso 3</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Store de Pinia para estado</li>
              <li>• Servicios API para backend</li>
              <li>• Componentes reutilizables</li>
              <li>• CRUD de contenido</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Especificar layout
definePageMeta({
  layout: 'default'
})

const authStore = useAuthStore()

// Verificar autenticación
onMounted(() => {
  authStore.initialize()
  
  if (!authStore.isAuthenticated) {
    window.location.href = '/auth/login'
  }
})
</script>