<!-- pages/auth/login.vue -->
<template>
  <div>
    <form @submit.prevent="handleLogin" class="space-y-6">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <div class="mt-1">
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="admin@senado.bo"
          />
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <div class="mt-1">
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isSubmitting" class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Iniciando sesión...
          </span>
          <span v-else>
            Iniciar sesión
          </span>
        </button>
      </div>

      <div v-if="error" class="rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <span class="text-red-400">⚠️</span>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Error de autenticación
            </h3>
            <div class="mt-2 text-sm text-red-700">
              {{ error }}
            </div>
          </div>
        </div>
      </div>
    </form>

    <div class="mt-6">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300" />
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">
            Credenciales de prueba
          </span>
        </div>
      </div>
      <div class="mt-4 text-sm text-center text-gray-600 space-y-1">
        <p>Email: <span class="font-mono">admin@senado.bo</span></p>
        <p>Contraseña: <span class="font-mono">Admin123!</span></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Usando ruta relativa para evitar problemas de path
import { useAuthStore } from '@/stores/auth'
import { ref, reactive, onMounted } from 'vue'

// Para definePageMeta, podemos usar un enfoque diferente
// En lugar de definePageMeta, podemos usar un middleware simple
// o configurar el layout en el componente

const authStore = useAuthStore()
const isSubmitting = ref(false)
const error = ref('')

const form = reactive({
  email: 'admin@senado.bo',
  password: 'Admin123!',
  remember: false
})

const handleLogin = async () => {
  isSubmitting.value = true
  error.value = ''

  try {
    await authStore.login(form.email, form.password)
  } catch (err: any) {
    error.value = err.message || 'Error de autenticación'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    window.location.href = '/dashboard'
  }
})
</script>