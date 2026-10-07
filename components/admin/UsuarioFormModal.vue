<!-- components/admin/UsuarioFormModal.vue -->
<!-- Formulario de alta/edición de usuarios del panel. Es "tonto": no llama a la
     API, sólo valida y emite el payload para que lo guarde la página. -->
<template>
  <Modal
    :model-value="modelValue"
    :title="esEdicion ? 'Editar usuario' : 'Nuevo usuario'"
    size="xl"
    @update:model-value="cerrar"
  >
    <form @submit.prevent="enviar" class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Correo electrónico *</label>
          <input
            v-model.trim="form.email"
            type="email"
            :disabled="esEdicion"
            class="mt-1 block w-full px-3 py-2 border rounded-md text-sm disabled:bg-gray-100 disabled:text-gray-500"
            :class="errores.email ? 'border-red-400' : 'border-gray-300'"
            placeholder="usuario@senado.bo"
          />
          <p v-if="errores.email" class="mt-1 text-xs text-red-600">{{ errores.email }}</p>
          <p v-else-if="esEdicion" class="mt-1 text-xs text-gray-400">
            El email no se puede modificar.
          </p>
        </div>

        <!-- Contraseña (sólo al crear) -->
        <div v-if="!esEdicion">
          <label class="block text-sm font-medium text-gray-700">Contraseña *</label>
          <input
            v-model="form.password"
            type="text"
            autocomplete="new-password"
            class="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
            :class="errores.password ? 'border-red-400' : 'border-gray-300'"
            placeholder="Mínimo 8 caracteres"
          />
          <p v-if="errores.password" class="mt-1 text-xs text-red-600">{{ errores.password }}</p>
          <p v-else class="mt-1 text-xs text-gray-400">
            Al menos 8 caracteres, una mayúscula, una minúscula y un número.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Rol -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Rol *</label>
          <select
            v-model="form.role"
            :disabled="bloqueaRol"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option v-for="r in opcionesRol" :key="r.id" :value="r.id">
              {{ r.label }} ({{ r.id }})
            </option>
          </select>
          <p v-if="bloqueaRol" class="mt-1 text-xs text-amber-600">{{ motivoBloqueoRol }}</p>
          <p v-else class="mt-1 text-xs text-gray-400">
            {{ descripcionRolSeleccionado }}
          </p>
        </div>

        <!-- Estado -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Estado *</label>
          <select
            v-model="form.status"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option v-for="s in USER_STATUSES" :key="s.id" :value="s.id">
              {{ s.label }} ({{ s.id }})
            </option>
          </select>
          <p class="mt-1 text-xs text-gray-400">
            Sólo los usuarios <strong>Activo</strong> pueden iniciar sesión.
          </p>
        </div>
      </div>

      <div class="border-t border-gray-100 pt-4">
        <p class="text-sm font-medium text-gray-700 mb-3">Datos del perfil (opcional)</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-600">Nombres</label>
            <input
              v-model.trim="form.profile.firstName"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <p v-if="errores.firstName" class="mt-1 text-xs text-red-600">{{ errores.firstName }}</p>
          </div>
          <div>
            <label class="block text-sm text-gray-600">Apellidos</label>
            <input
              v-model.trim="form.profile.lastName"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <p v-if="errores.lastName" class="mt-1 text-xs text-red-600">{{ errores.lastName }}</p>
          </div>
          <div>
            <label class="block text-sm text-gray-600">Cédula de identidad</label>
            <input
              v-model.trim="form.profile.ci"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <p v-if="errores.ci" class="mt-1 text-xs text-red-600">{{ errores.ci }}</p>
          </div>
          <div>
            <label class="block text-sm text-gray-600">Cargo</label>
            <input
              v-model.trim="form.profile.position"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Ej: Responsable de Prensa"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600">Unidad / Departamento</label>
            <input
              v-model.trim="form.profile.department"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      <div v-if="serverError" class="rounded-md bg-red-50 border border-red-200 p-3">
        <p class="text-sm text-red-800">{{ serverError }}</p>
      </div>

      <div v-if="errorGeneral" class="rounded-md bg-amber-50 border border-amber-200 p-3">
        <p class="text-sm text-amber-800">{{ errorGeneral }}</p>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button
          type="button"
          @click="cerrar(false)"
          class="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="saving"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm"
        >
          {{ saving ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Crear usuario') }}
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import {
  USER_STATUSES,
  assignableRoles as assignableRolesFor,
  roleInfo,
} from '~/utils/roles'
import type { CreateUserPayload, UpdateUserPayload } from '~/composables/useUsers'
import type { Role, User, UserStatus } from '~/types/auth'

const props = defineProps<{
  modelValue: boolean
  /** null = crear */
  user: User | null
  actorRole: Role | null
  /** id del usuario logueado (para no cambiarse el rol a sí mismo) */
  currentUserId?: string
  saving?: boolean
  serverError?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', payload: CreateUserPayload | UpdateUserPayload): void
}>()

const esEdicion = computed(() => !!props.user)

const form = reactive({
  email: '',
  password: '',
  role: 'EDITOR' as Role,
  status: 'ACTIVE' as UserStatus,
  profile: {
    firstName: '',
    lastName: '',
    ci: '',
    position: '',
    department: '',
  },
})

/** Rol sugerido al crear: EDITOR si se puede, si no el menos privilegiado disponible. */
function rolPorDefecto(): Role {
  const permitidos = assignableRolesFor(props.actorRole)
  if (permitidos.includes('EDITOR')) return 'EDITOR'
  return permitidos[permitidos.length - 1] || 'VIEWER'
}

const errores = reactive<Record<string, string>>({})
const errorGeneral = ref('')

const opcionesRol = computed(() => {
  const permitidos = assignableRolesFor(props.actorRole)
  // Si el usuario editado tiene un rol que el actor no puede asignar, igual
  // mostramos la opción para no mentir con el valor actual.
  const actual = props.user?.role
  if (actual && !permitidos.includes(actual)) {
    return [actual, ...permitidos].map(id => roleInfo(id) || { id, label: id })
  }
  return permitidos.map(id => roleInfo(id) || { id, label: id })
})

const descripcionRolSeleccionado = computed(
  () => roleInfo(form.role)?.description || ''
)

const esUsuarioActual = computed(
  () => !!props.currentUserId && String(props.user?._id) === String(props.currentUserId)
)

const bloqueaRol = computed(() => {
  if (esUsuarioActual.value) return true
  const actual = props.user?.role
  if (actual && !assignableRolesFor(props.actorRole).includes(actual)) return true
  return false
})

const motivoBloqueoRol = computed(() => {
  if (esUsuarioActual.value) {
    return 'No podés cambiarte el rol a vos mismo: pedile a otro administrador.'
  }
  return 'Tu rol no puede modificar a un usuario con ese rol.'
})

// Sincronizar el formulario cada vez que se abre
watch(
  () => props.modelValue,
  (abierto) => {
    if (!abierto) return
    limpiarErrores()

    const u = props.user
    form.email = u?.email || ''
    form.password = ''
    form.role = (u?.role || rolPorDefecto()) as Role
    form.status = (u?.status || 'ACTIVE') as UserStatus
    form.profile.firstName = u?.profile?.firstName || ''
    form.profile.lastName = u?.profile?.lastName || ''
    form.profile.ci = u?.profile?.ci || ''
    form.profile.position = u?.profile?.position || ''
    form.profile.department = u?.profile?.department || ''
  },
  { immediate: true }
)

function limpiarErrores() {
  Object.keys(errores).forEach(k => delete errores[k])
  errorGeneral.value = ''
}

function validar(): boolean {
  limpiarErrores()

  if (!form.email) {
    errores.email = 'El email es obligatorio'
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errores.email = 'El email no es válido'
  }

  if (!esEdicion.value) {
    if (!form.password) {
      errores.password = 'La contraseña es obligatoria'
    } else if (form.password.length < 8) {
      errores.password = 'Debe tener al menos 8 caracteres'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      errores.password = 'Debe tener una mayúscula, una minúscula y un número'
    }
  }

  if (form.profile.firstName && form.profile.firstName.length < 2) {
    errores.firstName = 'Mínimo 2 caracteres'
  }
  if (form.profile.lastName && form.profile.lastName.length < 2) {
    errores.lastName = 'Mínimo 2 caracteres'
  }
  if (form.profile.ci && form.profile.ci.length < 5) {
    errores.ci = 'La cédula debe tener al menos 5 caracteres'
  }

  if (!assignableRolesFor(props.actorRole).includes(form.role) && !esEdicion.value) {
    errorGeneral.value = 'No tenés permiso para crear usuarios con ese rol.'
  }

  return Object.keys(errores).length === 0 && !errorGeneral.value
}

function cerrar(value = false) {
  emit('update:modelValue', value)
}

function enviar() {
  if (!validar()) return

  const profile = {
    firstName: form.profile.firstName || undefined,
    lastName: form.profile.lastName || undefined,
    ci: form.profile.ci || undefined,
    position: form.profile.position || undefined,
    department: form.profile.department || undefined,
  }

  if (esEdicion.value) {
    const payload: UpdateUserPayload = {
      status: form.status,
      profile,
    }
    if (!bloqueaRol.value) payload.role = form.role
    emit('submit', payload)
  } else {
    emit('submit', {
      email: form.email,
      password: form.password,
      role: form.role,
      status: form.status,
      profile,
    } as CreateUserPayload)
  }
}
</script>
