<!-- pages/index.vue -->
<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Redirigiendo al sistema...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initialize()

  if (authStore.isAuthenticated) {
    // Cada rol va a su primera sección permitida
    window.location.href = authStore.homeRoute
  } else {
    window.location.href = '/auth/login'
  }
})
</script>