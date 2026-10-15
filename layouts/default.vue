<!-- layouts/default.vue -->
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
              <span class="ml-2 text-sm text-gray-500 hidden lg:inline">
                | Panel de Administración
              </span>
            </div>
          </div>

          <!-- Navegación -->
          <nav class="hidden md:flex space-x-4 lg:space-x-6">
            <NuxtLink
              v-for="item in authStore.sections"
              :key="item.id"
              :to="item.path"
              class="text-gray-700 hover:text-primary-600 px-2 py-2 text-sm font-medium transition-colors whitespace-nowrap"
              :class="{ 'text-primary-600 border-b-2 border-primary-600': isActiveRoute(item.path) }"
            >
              <span class="mr-1">{{ item.icon }}</span>{{ item.label }}
            </NuxtLink>
          </nav>

          <!-- Perfil -->
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
                  <span class="text-gray-600">{{ authStore.avatarInitials }}</span>
                </div>
                <span class="hidden md:inline text-gray-700">{{ authStore.userName }}</span>
                <span>▼</span>
              </button>

              <div
                v-if="userMenuOpen"
                class="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg py-1 z-10"
              >
                <div class="px-4 py-2 border-b border-gray-100">
                  <p class="text-sm text-gray-900 truncate">{{ authStore.userName }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ authStore.user?.email }}</p>
                  <span
                    class="mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="roleBadgeClass"
                  >
                    {{ authStore.roleLabel }}
                  </span>
                </div>

                <NuxtLink
                  v-if="authStore.canView('usuarios')"
                  to="/admin/usuarios"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="userMenuOpen = false"
                >
                  👥 Usuarios y roles
                </NuxtLink>
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

    <!-- Contenido -->
    <div class="flex">
      <main class="flex-1">
        <div class="py-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav class="flex mb-6" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-2">
                <li>
                  <div class="flex items-center">
                    <NuxtLink :to="authStore.homeRoute" class="text-gray-400 hover:text-gray-500">
                      Inicio
                    </NuxtLink>
                  </div>
                </li>
                <template v-if="currentRoute !== authStore.homeRoute">
                  <li>
                    <div class="flex items-center">
                      <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                      </svg>
                      <span class="ml-2 text-sm font-medium text-gray-500">
                        {{ currentSection?.label || 'Panel' }}
                      </span>
                    </div>
                  </li>
                </template>
              </ol>
            </nav>

            <h1 class="text-2xl font-semibold text-gray-900 mb-6">
              {{ pageTitle }}
            </h1>

            <div class="bg-white shadow rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <slot />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

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
import { roleInfo, sectionForPath } from '~/utils/roles'

const authStore = useAuthStore()
const userMenuOpen = ref(false)

const route = useRoute()
const currentRoute = computed(() => route.path)

const currentSection = computed(() => sectionForPath(currentRoute.value))
const pageTitle = computed(() => currentSection.value?.title || 'Panel de Administración')
const roleBadgeClass = computed(
  () => roleInfo(authStore.role)?.badgeClass || 'bg-gray-100 text-gray-700'
)

const isActiveRoute = (path: string) => {
  return currentRoute.value.startsWith(path)
}

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

watch(currentRoute, (newPath) => {
  console.log('Ruta actual:', newPath, '| Sección:', currentSection.value?.id || 'ninguna')
})
</script>