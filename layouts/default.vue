<!-- layouts/default.vue - CORREGIDO con detección de rutas -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <div class="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">SB</span>
              </div>
              <span class="ml-3 text-xl font-semibold text-gray-800">
                Senado Bolivia
              </span>
              <span class="ml-2 text-sm text-gray-500 hidden md:inline">
                | Panel de Administración
              </span>
            </div>
          </div>

          <!-- Navegación - AHORA USA EL ROUTER -->
          <nav class="hidden md:flex space-x-8">
            <NuxtLink 
              to="/dashboard" 
              class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
              :class="{ 'text-primary-600 border-b-2 border-primary-600': isActiveRoute('/dashboard') }"
            >
              Dashboard
            </NuxtLink>
            
            <NuxtLink 
              to="/tabs" 
              class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
              :class="{ 'text-primary-600 border-b-2 border-primary-600': isActiveRoute('/tabs') }"
            >
              Tabs
            </NuxtLink>

            <NuxtLink 
              to="/admin/noticias" 
              class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
              :class="{ 'text-primary-600 border-b-2 border-primary-600': isActiveRoute('/admin/noticias') }"
            >
              Noticias
            </NuxtLink>
            
            <button 
              @click.prevent="showComingSoon('Contenido')"
              class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
            >
              Contenido
            </button>
            <button 
              @click.prevent="showComingSoon('Legisladores')"
              class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
            >
              Legisladores
            </button>
            <button 
              @click.prevent="showComingSoon('Usuarios')"
              class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
            >
              Usuarios
            </button>
          </nav>

          <!-- Perfil de usuario -->
          <div class="flex items-center space-x-4">
            <button class="p-2 text-gray-600 hover:text-gray-900">
              <span class="sr-only">Notificaciones</span>
              🔔
            </button>
            <div class="relative">
              <button 
                @click="toggleUserMenu"
                class="flex items-center space-x-2 text-sm focus:outline-none"
              >
                <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span class="text-gray-600">{{ avatarInitials }}</span>
                </div>
                <span class="hidden md:inline text-gray-700">{{ userName }}</span>
                <span>▼</span>
              </button>
              
              <!-- Dropdown menu -->
              <div 
                v-if="userMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
              >
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" @click.prevent="showComingSoon('Perfil')">
                  Mi perfil
                </a>
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" @click.prevent="showComingSoon('Configuración')">
                  Configuración
                </a>
                <div class="border-t border-gray-100"></div>
                <button 
                  @click="logout"
                  class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <div class="flex">
      <main class="flex-1">
        <div class="py-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Breadcrumbs -->
            <nav class="flex mb-6" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-2">
                <li>
                  <div class="flex items-center">
                    <NuxtLink to="/dashboard" class="text-gray-400 hover:text-gray-500">
                      Dashboard
                    </NuxtLink>
                  </div>
                </li>
                <template v-if="currentRoute !== '/dashboard'">
                  <li>
                    <div class="flex items-center">
                      <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                      </svg>
                      <span class="ml-2 text-sm font-medium text-gray-500">
                        {{ currentPage }}
                      </span>
                    </div>
                  </li>
                </template>
              </ol>
            </nav>

            <!-- Título de página -->
            <h1 class="text-2xl font-semibold text-gray-900 mb-6">
              {{ pageTitle }}
            </h1>

            <!-- Slot para contenido -->
            <div class="bg-white shadow rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <slot />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-500">
            © {{ new Date().getFullYear() }} Senado de Bolivia. Todos los derechos reservados.
          </p>
          <p class="text-sm text-gray-500">
            v1.0.0
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
const userMenuOpen = ref(false)

// Usar el router de Vue para la ruta actual
const route = useRoute()
const currentRoute = computed(() => route.path)

// Función para verificar si una ruta está activa
const isActiveRoute = (path: string) => {
  if (path === '/dashboard') {
    return currentRoute.value === '/dashboard'
  }
  return currentRoute.value.startsWith(path)
}

const userName = computed(() => authStore.user?.name || 'Usuario')
const avatarInitials = computed(() => authStore.avatarInitials)

const pageTitle = computed(() => {
  const path = currentRoute.value
  if (path === '/dashboard') return 'Dashboard'
  if (path.startsWith('/tabs')) return 'Gestión de Tabs'
  if (path.includes('/content')) return 'Gestión de Contenido'
  if (path.includes('/legislators')) return 'Legisladores'
  if (path.includes('/users')) return 'Usuarios'
  return 'Panel de Administración'
})

const currentPage = computed(() => {
  const path = currentRoute.value.split('/').pop()
  return path ? path.charAt(0).toUpperCase() + path.slice(1) : ''
})

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const logout = () => {
  authStore.logout()
}

const showComingSoon = (feature: string) => {
  alert(`🚧 ${feature} - Próximamente\n\nEsta funcionalidad estará disponible en la siguiente versión.`)
  userMenuOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    userMenuOpen.value = false
  }
}

onMounted(() => {
  authStore.initialize()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Opcional: watch para debug
watch(currentRoute, (newPath) => {
  console.log('Ruta actual:', newPath)
})
</script>