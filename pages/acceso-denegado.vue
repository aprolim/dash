<!-- pages/acceso-denegado.vue -->
<template>
  <div>
    <div class="text-center">
      <div class="text-5xl mb-3">🚫</div>
      <h3 class="text-lg font-semibold text-gray-900">Acceso denegado</h3>
      <p class="mt-2 text-sm text-gray-600">
        {{ mensaje }}
      </p>
    </div>

    <div v-if="role" class="mt-6 rounded-md bg-gray-50 border border-gray-200 p-4 text-left">
      <p class="text-sm text-gray-700">
        Tu rol es
        <span class="ml-1 px-2 py-0.5 rounded-full text-xs font-medium" :class="roleBadge">
          {{ roleName }}
        </span>
      </p>
      <p class="mt-2 text-xs text-gray-500">{{ roleDescription }}</p>
    </div>

    <div v-if="seccionesPermitidas.length > 0" class="mt-6 text-left">
      <p class="text-sm font-medium text-gray-700 mb-2">Secciones que sí podés usar:</p>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          v-for="section in seccionesPermitidas"
          :key="section.id"
          :to="section.path"
          class="inline-flex items-center px-3 py-1.5 text-sm bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100"
        >
          <span class="mr-1">{{ section.icon }}</span>{{ section.label }}
        </NuxtLink>
      </div>
    </div>

    <div class="mt-8 flex flex-col gap-3">
      <button
        v-if="seccionesPermitidas.length > 0"
        @click="irAInicio"
        class="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
      >
        Ir a mi sección de inicio
      </button>
      <button
        @click="cerrarSesion"
        class="w-full py-2 px-4 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
      >
        Cerrar sesión
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { roleInfo, sectionById, type SectionId } from '~/utils/roles'

definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const authStore = useAuthStore()

const seccionBloqueada = computed(() => {
  const raw = route.query.seccion
  const id = Array.isArray(raw) ? raw[0] : raw
  return id ? sectionById(id as SectionId) : null
})

const role = computed(() => authStore.role)
const roleName = computed(() => authStore.roleLabel)
const roleBadge = computed(() => roleInfo(authStore.role)?.badgeClass || 'bg-gray-100 text-gray-700')
const roleDescription = computed(() => roleInfo(authStore.role)?.description || '')
const seccionesPermitidas = computed(() => authStore.sections)

const mensaje = computed(() => {
  if (authStore.needsRelogin) {
    return 'Tu sesión no tiene un rol válido asignado. Cerrá sesión y volvé a entrar para que se actualice.'
  }
  if (seccionBloqueada.value) {
    return `Tu rol no tiene permiso para entrar a "${seccionBloqueada.value.label}".`
  }
  return 'Tu rol no tiene ninguna sección habilitada en el panel de administración.'
})

const irAInicio = () => {
  authStore.goHome()
}

const cerrarSesion = () => {
  authStore.logout()
}

onMounted(() => {
  authStore.initialize()

  // Si no hay sesión, no tiene sentido mostrar esta pantalla
  const hasToken = !!localStorage.getItem('auth_token')
  if (!hasToken) {
    window.location.href = '/auth/login'
  }
})
</script>
