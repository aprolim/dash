<!-- components/tabs/CategoriesList.vue -->
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-medium text-gray-900">Categorías de Tabs</h2>
      <button
        @click="$emit('create')"
        class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        <span class="mr-2">+</span>
        Nueva Categoría
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando categorías...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 p-4 rounded-md">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="category in categories"
        :key="category.categoryId"
        class="bg-white border rounded-lg overflow-hidden"
        :class="{ 'opacity-50': !category.isActive }"
      >
        <div class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <div 
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  :style="{ backgroundColor: category.color + '20' }"
                >
                  <div class="w-6 h-6" v-html="category.icon"></div>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900">{{ category.name }}</h3>
                  <p class="text-sm text-gray-500">ID: {{ category.categoryId }}</p>
                </div>
              </div>
              <p class="mt-2 text-gray-600">{{ category.description }}</p>
              <div class="mt-4 flex items-center space-x-4 text-sm">
                <span class="text-gray-500">Orden: {{ category.order }}</span>
                <span class="text-gray-500">•</span>
                <span class="text-gray-500">Links: {{ category.linksCount || 0 }}</span>
                <span class="text-gray-500">•</span>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  :class="category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ category.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>
            <div class="flex space-x-2">
              <button
                @click="$emit('manage-links', category)"
                class="p-2 text-gray-400 hover:text-primary-600"
                title="Gestionar Links"
              >
                🔗
              </button>
              <button
                @click="$emit('edit', category)"
                class="p-2 text-gray-400 hover:text-primary-600"
                title="Editar"
              >
                ✏️
              </button>
              <button
                @click="$emit('toggle', category)"
                class="p-2 text-gray-400 hover:text-primary-600"
                :title="category.isActive ? 'Desactivar' : 'Activar'"
              >
                {{ category.isActive ? '⏸️' : '▶️' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TabCategory } from '~/composables/useTabsApi'

defineProps<{
  categories: TabCategory[]
  loading?: boolean
  error?: string | null
}>()

defineEmits<{
  (e: 'create'): void
  (e: 'edit', category: TabCategory): void
  (e: 'toggle', category: TabCategory): void
  (e: 'manage-links', category: TabCategory): void
}>()
</script>