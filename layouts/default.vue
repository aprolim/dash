<!-- layouts/default.vue -->
<template>
  <div class="h-screen w-screen flex bg-gray-100 overflow-hidden">
    
    <!-- ========================================== -->
    <!-- SIDEBAR (MENÚ IZQUIERDO)                   -->
    <!-- ========================================== -->
    
    <!-- Fondo oscuro para móvil -->
    <div 
      v-if="sidebarOpen" 
      class="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 transition-opacity md:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Panel del Sidebar -->
    <aside 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out md:static shrink-0"
      :class="[
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        isCollapsed ? 'md:w-0 md:opacity-0 md:overflow-hidden md:border-none' : 'md:w-64 md:opacity-100'
      ]"
    >
      <!-- Contenido interno del sidebar (le ponemos un ancho fijo para que no se aplaste al colapsar) -->
      <div class="w-64 flex flex-col h-full">
        
        <!-- Logo -->
        <div class="flex items-center justify-between h-16 px-6 border-b border-gray-200 shrink-0">
          <div class="flex items-center">
            <div class="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">SB</span>
            </div>
            <span class="ml-3 text-lg font-bold text-gray-800 tracking-tight">
              Senado Bolivia
            </span>
          </div>
          <!-- Botón cerrar (solo móvil) -->
          <button @click="sidebarOpen = false" class="md:hidden text-gray-500 hover:text-gray-700">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Navegación -->
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p class="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Menú Principal</p>
          
          <NuxtLink
            v-for="item in authStore.sections"
            :key="item.id"
            :to="item.path"
            @click="sidebarOpen = false"
            class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors mb-1 whitespace-nowrap"
            :class="isActiveRoute(item.path) 
              ? 'bg-primary-50 text-primary-700' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'"
          >
            <span class="mr-3 text-lg opacity-80 group-hover:opacity-100">{{ item.icon }}</span>
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- Info del usuario en el sidebar -->
        <div class="border-t border-gray-200 p-4 shrink-0 bg-gray-50">
          <div class="flex items-center">
            <div class="h-9 w-9 shrink-0 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold mr-3">
              {{ authStore.avatarInitials }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ authStore.userName }}</p>
              <p class="text-xs text-gray-500 truncate">{{ authStore.roleLabel }}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- ========================================== -->
    <!-- CONTENIDO PRINCIPAL (DERECHA)              -->
    <!-- ========================================== -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      
      <!-- Header superior -->
      <header class="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-10">
        
        <div class="flex items-center">
          <!-- Botón Menú Móvil (Hamburguesa) -->
          <button
            @click="sidebarOpen = true"
            class="md:hidden p-2 -ml-2 mr-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- 🔥 BOTÓN PARA COLAPSAR EN ESCRITORIO 🔥 -->
          <button
            @click="toggleSidebarCollapse"
            class="hidden md:flex p-2 -ml-2 mr-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-colors"
            :title="isCollapsed ? 'Mostrar menú' : 'Ocultar menú'"
          >
            <!-- Ícono de hamburguesa o flecha según el estado -->
            <svg v-if="isCollapsed" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <!-- Perfil / Acciones -->
        <div class="flex items-center space-x-4">
          <button class="p-2 text-gray-600 hover:text-gray-900 relative">
            <span class="sr-only">Notificaciones</span>
            🔔
            <span class="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          
          <div class="relative">
            <button
              @click="toggleUserMenu"
              class="flex items-center space-x-2 text-sm focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <div class="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                {{ authStore.avatarInitials }}
              </div>
              <span class="hidden md:inline text-gray-700 font-medium pr-2">{{ authStore.userName }}</span>
              <span class="text-gray-400 text-xs pr-1">▼</span>
            </button>

            <!-- Dropdown Perfil -->
            <div
              v-if="userMenuOpen"
              class="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100"
            >
              <div class="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p class="text-sm font-medium text-gray-900 truncate">{{ authStore.userName }}</p>
                <p class="text-xs text-gray-500 truncate">{{ authStore.user?.email }}</p>
                <span
                  class="mt-1.5 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
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
                👤 Mi perfil
              </a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" @click.prevent="showComingSoon('Configuración')">
                ⚙️ Configuración
              </a>
              <div class="border-t border-gray-100 my-1"></div>
              <button
                @click="logout"
                class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
              >
                🚪 Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Contenido de la página -->
      <main class="flex-1 overflow-y-auto">
        <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          
          <nav class="flex mb-4" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
              <li>
                <div class="flex items-center">
                  <NuxtLink :to="authStore.homeRoute" class="text-gray-500 hover:text-gray-700 text-sm font-medium">
                    Inicio
                  </NuxtLink>
                </div>
              </li>
              <template v-if="currentRoute !== authStore.homeRoute">
                <li>
                  <div class="flex items-center">
                    <svg class="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
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

          <h1 class="text-2xl font-bold text-gray-900 mb-6">
            {{ pageTitle }}
          </h1>

          <div class="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <div class="p-4 sm:p-6">
              <slot />
            </div>
          </div>
          
        </div>
      </main>
      
      <footer class="bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-500 shrink-0">
        © {{ new Date().getFullYear() }} Senado de Bolivia · v1.0.0
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRoute } from 'vue-router'
import { roleInfo, sectionForPath } from '~/utils/roles'

const authStore = useAuthStore()
const route = useRoute()

const userMenuOpen = ref(false)
const sidebarOpen = ref(false) 

// 🔥 NUEVO: Estado para colapsar el menú en escritorio
const isCollapsed = ref(false)

const currentRoute = computed(() => route.path)
const currentSection = computed(() => sectionForPath(currentRoute.value))
const pageTitle = computed(() => currentSection.value?.title || 'Panel de Administración')
const roleBadgeClass = computed(
  () => roleInfo(authStore.role)?.badgeClass || 'bg-gray-100 text-gray-700'
)

const isActiveRoute = (path: string) => {
  return currentRoute.value.startsWith(path)
}

// 🔥 NUEVO: Función para alternar el colapso y guardarlo en localStorage
const toggleSidebarCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  if (typeof window !== 'undefined') {
    localStorage.setItem('sidebar_collapsed', String(isCollapsed.value))
  }
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

watch(currentRoute, () => {
  sidebarOpen.value = false
  userMenuOpen.value = false
})

onMounted(() => {
  authStore.initialize()
  document.addEventListener('click', handleClickOutside)
  
  // 🔥 Recuperar el estado del menú guardado
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sidebar_collapsed')
    if (saved === 'true') {
      isCollapsed.value = true
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>