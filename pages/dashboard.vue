<!-- pages/dashboard.vue - Corregido -->
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

    <!-- Gráficos y contenido reciente -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Actividad reciente -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-5 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Actividad Reciente</h3>
        </div>
        <div class="px-6 py-4">
          <div class="space-y-4">
            <div v-for="activity in recentActivities" :key="activity.id" class="flex items-start">
              <div class="flex-shrink-0 mt-1">
                <div class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <span :class="activity.iconColor">{{ activity.icon }}</span>
                </div>
              </div>
              <div class="ml-3 flex-1">
                <p class="text-sm font-medium text-gray-900">{{ activity.user }}</p>
                <p class="text-sm text-gray-600">{{ activity.action }}</p>
                <p class="text-xs text-gray-500">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido pendiente -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-5 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Contenido Pendiente</h3>
        </div>
        <div class="px-6 py-4">
          <div class="space-y-4">
            <div v-for="item in pendingContent" :key="item.id" class="flex justify-between items-center">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ item.title }}</p>
                <p class="text-xs text-gray-500">{{ item.type }} • {{ item.author }}</p>
              </div>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="item.statusClass">
                {{ item.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Acciones rápidas -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-5 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Acciones Rápidas</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            v-for="action in quickActions" 
            :key="action.id"
            @click="handleQuickAction(action)"
            class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span class="text-2xl mb-2">{{ action.icon }}</span>
            <span class="text-sm font-medium text-gray-700">{{ action.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const recentActivities = ref([
  {
    id: 1,
    user: 'María González',
    action: 'Actualizó la página "Historia del Senado"',
    time: 'Hace 15 minutos',
    icon: '📝',
    iconColor: 'text-blue-500'
  },
  {
    id: 2,
    user: 'Carlos Rodríguez',
    action: 'Creó nueva noticia: "Sesión Plenaria"',
    time: 'Hace 2 horas',
    icon: '📰',
    iconColor: 'text-green-500'
  },
  {
    id: 3,
    user: 'Ana Martínez',
    action: 'Agregó nuevo legislador: Juan Pérez',
    time: 'Hace 3 horas',
    icon: '👥',
    iconColor: 'text-purple-500'
  },
  {
    id: 4,
    user: 'Admin',
    action: 'Actualizó configuración del sistema',
    time: 'Ayer',
    icon: '⚙️',
    iconColor: 'text-orange-500'
  }
])

const pendingContent = ref([
  {
    id: 1,
    title: 'Reforma a la Ley de Transparencia',
    type: 'Proyecto de Ley',
    author: 'Comisión de Justicia',
    status: 'Revisión',
    statusClass: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 2,
    title: 'Informe Anual de Gestión',
    type: 'Documento',
    author: 'Presidencia',
    status: 'Aprobación',
    statusClass: 'bg-blue-100 text-blue-800'
  },
  {
    id: 3,
    title: 'Convocatoria a Sesión Extraordinaria',
    type: 'Comunicado',
    author: 'Secretaría General',
    status: 'Publicar',
    statusClass: 'bg-green-100 text-green-800'
  }
])

const quickActions = ref([
  { id: 1, label: 'Nueva Noticia', icon: '📰', route: '/content/news/create' },
  { id: 2, label: 'Agregar Legislador', icon: '👥', route: '/legislators/create' },
  { id: 3, label: 'Crear Usuario', icon: '👤', route: '/users/create' },
  { id: 4, label: 'Generar Reporte', icon: '📊', route: '/reports' }
])

const handleQuickAction = (action: any) => {
  // TODO: Navegar a la ruta correspondiente
  console.log('Acción rápida:', action.label)
  // navigateTo(action.route)
}
</script>