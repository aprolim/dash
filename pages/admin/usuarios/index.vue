<!-- pages/admin/usuarios/index.vue -->
<template>
  <div>
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">👥 Usuarios y Roles</h1>
        <p class="text-gray-600">
          Quién puede entrar al panel y qué puede hacer cada rol
        </p>
      </div>
      <button
        v-if="canCreate"
        @click="abrirCrear"
        class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        <span class="mr-2">+</span>
        Nuevo Usuario
      </button>
    </div>

    <!-- Aviso de solo lectura -->
    <div
      v-if="!canEdit"
      class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800"
    >
      Estás como <strong>{{ roleLabel }}</strong>: podés consultar la lista de usuarios,
      pero no crearlos ni modificarlos.
    </div>

    <!-- Referencia de la matriz de roles -->
    <details class="bg-gray-50 border border-gray-200 rounded-lg mb-6">
      <summary class="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700">
        📋 Ver qué puede hacer cada rol
      </summary>
      <div class="px-4 pb-4 overflow-x-auto">
        <table class="min-w-full text-xs">
          <thead>
            <tr>
              <th class="text-left py-2 pr-4 font-medium text-gray-500 uppercase">Rol</th>
              <th
                v-for="section in SECTIONS"
                :key="section.id"
                class="text-left py-2 px-3 font-medium text-gray-500 uppercase whitespace-nowrap"
              >
                {{ section.icon }} {{ section.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="r in ROLES" :key="r.id">
              <td class="py-2 pr-4 whitespace-nowrap">
                <span class="px-2 py-0.5 rounded-full font-medium" :class="r.badgeClass">
                  {{ r.label }}
                </span>
              </td>
              <td
                v-for="section in SECTIONS"
                :key="section.id"
                class="py-2 px-3 whitespace-nowrap"
                :class="puedeVer(r.id, section.id) ? 'text-green-700' : 'text-gray-300'"
              >
                {{ nivelPermiso(r.id, section.id) }}
              </td>
            </tr>
          </tbody>
        </table>
        <p class="mt-3 text-xs text-gray-500">
          La matriz es la misma que valida el servidor: <em>Total</em> = crear, editar y eliminar ·
          <em>Editar</em> = crear y editar · <em>Ver</em> = sólo consultar · <em>—</em> = sin acceso.
        </p>
      </div>
    </details>

    <!-- Filtros -->
    <div class="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap gap-3">
      <select v-model="filters.role" @change="onFilterChange" class="px-3 py-2 border rounded-lg text-sm">
        <option value="todos">Todos los roles</option>
        <option v-for="r in ROLES" :key="r.id" :value="r.id">{{ r.label }}</option>
      </select>

      <select v-model="filters.status" @change="onFilterChange" class="px-3 py-2 border rounded-lg text-sm">
        <option value="todos">Todos los estados</option>
        <option v-for="s in USER_STATUSES" :key="s.id" :value="s.id">{{ s.label }}</option>
      </select>

      <div class="flex-1 min-w-[200px]">
        <input
          v-model="filters.search"
          @input="onSearchInput"
          type="text"
          placeholder="Buscar por email o nombre..."
          class="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>

      <button @click="resetFilters" class="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm">
        Limpiar
      </button>
    </div>

    <!-- Lista -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando usuarios...</p>
      </div>

      <div v-else-if="error" class="p-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800 text-sm">{{ error }}</p>
          <button @click="loadUsers" class="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm">
            Reintentar
          </button>
        </div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Último acceso</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="u in users" :key="userIdOf(u)" class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">
                  {{ nombreCompleto(u) }}
                  <span
                    v-if="esUsuarioActual(u)"
                    class="ml-1 px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 text-xs"
                  >
                    vos
                  </span>
                </div>
                <div class="text-xs text-gray-500">{{ u.email }}</div>
                <div v-if="u.profile?.position" class="text-xs text-gray-400">
                  {{ u.profile.position }}
                </div>
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="roleInfo(u.role)?.badgeClass || 'bg-gray-100 text-gray-700'"
                >
                  {{ roleInfo(u.role)?.label || u.role }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="statusInfo(u.status).badgeClass"
                >
                  {{ statusInfo(u.status).label }}
                </span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-500">
                {{ u.lastLogin ? formatearFecha(u.lastLogin) : 'Nunca' }}
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    v-if="puedeEditarUsuario(u)"
                    @click="abrirEditar(u)"
                    class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
                  >
                    ✏ Editar
                  </button>
                  <button
                    v-if="puedeEliminarUsuario(u)"
                    @click="confirmDelete(u)"
                    class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
                  >
                    🗑
                  </button>
                  <span
                    v-if="!puedeEditarUsuario(u) && !puedeEliminarUsuario(u)"
                    class="text-xs text-gray-400"
                    :title="motivoSinAcciones(u)"
                  >
                    🔒 {{ motivoSinAcciones(u) }}
                  </span>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="5" class="px-4 py-12 text-center text-gray-500">
                No hay usuarios con los filtros seleccionados
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="px-4 py-3 border-t flex justify-between items-center">
        <button
          @click="prevPage"
          :disabled="page === 1"
          class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
        >
          Anterior
        </button>
        <span class="text-sm text-gray-600">
          Página {{ page }} de {{ totalPages }} · {{ total }} usuario{{ total !== 1 ? 's' : '' }}
        </span>
        <button
          @click="nextPage"
          :disabled="page === totalPages"
          class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
        >
          Siguiente
        </button>
      </div>
    </div>

    <!-- Alta / edición -->
    <UsuarioFormModal
      v-model="showForm"
      :user="editingUser"
      :actor-role="role"
      :current-user-id="currentUserId"
      :saving="savingForm"
      :server-error="formError"
      @submit="guardar"
    />

    <!-- Confirmación de borrado -->
    <Modal v-model="showDeleteModal" title="Confirmar eliminación">
      <div class="p-2">
        <p class="text-gray-700">
          ¿Eliminar al usuario
          <strong>{{ userToDelete?.email }}</strong>?
        </p>
        <p class="text-red-600 text-sm mt-2">
          Esta acción no se puede deshacer. Si sólo querés quitarle el acceso,
          editá el usuario y dejalo en estado <strong>Inactivo</strong>.
        </p>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showDeleteModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button
            @click="borrarUsuario"
            :disabled="deleting"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </Modal>

    <!-- Toast -->
    <div
      v-if="toast.show"
      class="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50"
      :class="toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import UsuarioFormModal from '~/components/admin/UsuarioFormModal.vue'
import { useAuthStore } from '~/stores/auth'
import { usePermissions } from '~/composables/usePermissions'
import {
  useUsers,
  userIdOf,
  type CreateUserPayload,
  type UpdateUserPayload,
} from '~/composables/useUsers'
import {
  ROLES,
  SECTIONS,
  USER_STATUSES,
  can as canPerform,
  canView,
  roleInfo,
  statusInfo,
  type ActionId,
  type SectionId,
} from '~/utils/roles'
import type { Role, User } from '~/types/auth'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const authStore = useAuthStore()
const { role, roleLabel, can } = usePermissions()
const { getUsers, createUser, updateUser, deleteUser } = useUsers()

const canCreate = computed(() => can('usuarios', 'create'))
const canEdit = computed(() => can('usuarios', 'edit'))
const canDelete = computed(() => can('usuarios', 'delete'))

const users = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)

const filters = ref({
  role: 'todos' as Role | 'todos',
  status: 'todos',
  search: '',
})

let searchTimeout: ReturnType<typeof setTimeout> | undefined

const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

const showForm = ref(false)
const editingUser = ref<User | null>(null)
const savingForm = ref(false)
const formError = ref('')

const showDeleteModal = ref(false)
const userToDelete = ref<User | null>(null)
const deleting = ref(false)

const currentUserId = computed(() => userIdOf(authStore.user))

// ============================================
// Helpers de presentación
// ============================================

const nombreCompleto = (u: User): string => {
  const full = [u.profile?.firstName, u.profile?.lastName].filter(Boolean).join(' ').trim()
  return full || u.name || 'Sin nombre'
}

const formatearFecha = (fecha: string): string => {
  if (!fecha) return 'Nunca'
  const date = new Date(fecha)
  if (isNaN(date.getTime())) return 'Fecha inválida'
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const esUsuarioActual = (u: User): boolean => !!currentUserId.value && userIdOf(u) === currentUserId.value

/** Puede editar a este usuario: necesita permiso y no puede tocar a un SUPER_ADMIN si no lo es. */
const puedeEditarUsuario = (u: User): boolean => {
  if (!canEdit.value) return false
  if (role.value !== 'SUPER_ADMIN' && u.role === 'SUPER_ADMIN') return false
  return true
}

const puedeEliminarUsuario = (u: User): boolean => {
  if (!canDelete.value) return false
  if (esUsuarioActual(u)) return false
  return true
}

const motivoSinAcciones = (u: User): string => {
  if (esUsuarioActual(u) && !canEdit.value) return 'tu cuenta'
  if (!canEdit.value) return 'sin permiso'
  if (role.value !== 'SUPER_ADMIN' && u.role === 'SUPER_ADMIN') return 'rol superior'
  return 'sin acciones'
}

const puedeVer = (r: Role, s: SectionId) => canView(r, s)

/** Etiqueta corta de la matriz para la leyenda de roles. */
const nivelPermiso = (r: Role, s: SectionId): string => {
  if (!canView(r, s)) return '—'
  const acciones: ActionId[] = ['delete', 'edit', 'create']
  for (const a of acciones) {
    if (canPerform(r, s, a)) {
      return a === 'delete' ? 'Total' : 'Editar'
    }
  }
  return 'Ver'
}

const mostrarToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3500)
}

// ============================================
// Carga de datos
// ============================================

const loadUsers = async () => {
  loading.value = true
  error.value = null

  try {
    const result = await getUsers({
      page: page.value,
      limit: 10,
      role: filters.value.role,
      status: filters.value.status as any,
      search: filters.value.search || undefined,
    })

    users.value = result.users || []
    total.value = result.total || 0
    totalPages.value = result.pages || 1
  } catch (err: any) {
    error.value = err.message || 'No se pudo cargar la lista de usuarios'
    users.value = []
    total.value = 0
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

const onFilterChange = () => {
  page.value = 1
  loadUsers()
}

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadUsers()
  }, 500)
}

const resetFilters = () => {
  filters.value = { role: 'todos', status: 'todos', search: '' }
  page.value = 1
  loadUsers()
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    loadUsers()
  }
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++
    loadUsers()
  }
}

// ============================================
// Alta / edición
// ============================================

const abrirCrear = () => {
  editingUser.value = null
  formError.value = ''
  showForm.value = true
}

const abrirEditar = (u: User) => {
  editingUser.value = u
  formError.value = ''
  showForm.value = true
}

const guardar = async (payload: CreateUserPayload | UpdateUserPayload) => {
  savingForm.value = true
  formError.value = ''

  try {
    if (editingUser.value) {
      await updateUser(userIdOf(editingUser.value), payload as UpdateUserPayload)
      mostrarToast('Usuario actualizado')
    } else {
      await createUser(payload as CreateUserPayload)
      mostrarToast('Usuario creado. Debe estar Activo para poder iniciar sesión.')
    }

    showForm.value = false
    editingUser.value = null
    await loadUsers()
  } catch (err: any) {
    formError.value = err.message || 'No se pudo guardar el usuario'
  } finally {
    savingForm.value = false
  }
}

// ============================================
// Eliminación
// ============================================

const confirmDelete = (u: User) => {
  userToDelete.value = u
  showDeleteModal.value = true
}

const borrarUsuario = async () => {
  if (!userToDelete.value) return

  deleting.value = true
  try {
    await deleteUser(userIdOf(userToDelete.value))
    showDeleteModal.value = false
    mostrarToast('Usuario eliminado')
    await loadUsers()
  } catch (err: any) {
    mostrarToast(err.message || 'No se pudo eliminar el usuario', 'error')
  } finally {
    deleting.value = false
    userToDelete.value = null
  }
}

onMounted(() => {
  loadUsers()
})
</script>
