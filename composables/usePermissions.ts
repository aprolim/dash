// composables/usePermissions.ts
// Azúcar para las páginas: expone la matriz de utils/roles.ts ya atada al
// usuario logueado.
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import {
  assignableRoles as assignableRolesFor,
  can as canPerform,
  canView as canViewSection,
  type ActionId,
  type SectionId,
} from '~/utils/roles'

export const usePermissions = () => {
  const auth = useAuthStore()

  const role = computed(() => auth.role)

  return {
    /** Rol efectivo del usuario logueado (null si no hay sesión válida) */
    role,
    roleLabel: computed(() => auth.roleLabel),
    isAdmin: computed(() => auth.isAdmin),
    isSuperAdmin: computed(() => auth.isSuperAdmin),
    hasPanelAccess: computed(() => auth.hasPanelAccess),
    /** Secciones visibles, en orden de menú */
    sections: computed(() => auth.sections),
    /** Roles que este usuario puede asignar a otros */
    assignableRoles: computed(() => assignableRolesFor(role.value)),

    canView: (section: SectionId) => canViewSection(role.value, section),
    can: (section: SectionId, action: ActionId = 'view') =>
      canPerform(role.value, section, action),
  }
}
