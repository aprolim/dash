// utils/roles.ts
// ÚNICA FUENTE DE VERDAD de la matriz de roles y permisos del panel.
//
// Importante: esta matriz refleja lo que el backend YA valida en
// backend/src/middleware/auth.js con authorize(...). Si el backend cambia,
// cambia también aquí: la UI nunca debe ofrecer algo que la API vaya a rechazar.

import type { Role, UserStatus } from '~/types/auth'

export type SectionId = 'noticias' | 'comunicados' | 'sesiones' | 'auditoria' | 'usuarios'
export type ActionId = 'view' | 'create' | 'edit' | 'delete'

export interface RoleInfo {
  id: Role
  label: string
  description: string
  badgeClass: string
}

export interface SectionInfo {
  id: SectionId
  label: string
  icon: string
  path: string
  title: string
  description: string
}

export interface SectionPermissions {
  view: Role[]
  create?: Role[]
  edit?: Role[]
  delete?: Role[]
}

export interface StatusInfo {
  id: UserStatus
  label: string
  badgeClass: string
}

// Roles que pueden escribir contenido (noticias, comunicados, sesiones, auditoría)
const CONTENT_ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'EDITOR']
// Roles con poder administrativo sobre usuarios
const ADMIN_ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN']
// Rol dueño de cada sección: sólo esa sección, con control total dentro de ella
const NOTICIAS_ROLES: Role[] = [...CONTENT_ROLES, 'EDITOR_NOTICIAS']
const SESIONES_ROLES: Role[] = [...CONTENT_ROLES, 'EDITOR_SESIONES']
const COMUNICADOS_ROLES: Role[] = [...CONTENT_ROLES, 'EDITOR_COMUNICADOS']
const AUDITORIA_ROLES: Role[] = [...CONTENT_ROLES, 'EDITOR_AUDITORIA']

export const ROLE_IDS: Role[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'EDITOR',
  'EDITOR_NOTICIAS',
  'EDITOR_SESIONES',
  'EDITOR_COMUNICADOS',
  'EDITOR_AUDITORIA',
  'MODERATOR',
  'VIEWER',
  'CITIZEN',
]

export const ROLES: RoleInfo[] = [
  {
    id: 'SUPER_ADMIN',
    label: 'Super administrador',
    description:
      'Acceso total: todas las secciones, gestión de usuarios y roles, y puede eliminar usuarios.',
    badgeClass: 'bg-red-100 text-red-800',
  },
  {
    id: 'ADMIN',
    label: 'Administrador',
    description:
      'Acceso a todas las secciones, crea y edita usuarios. No puede eliminar usuarios ni crear otros super administradores.',
    badgeClass: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'EDITOR',
    label: 'Editor',
    description:
      'Crea y edita noticias, comunicados, sesiones y auditoría. No puede eliminar noticias ni tocar usuarios.',
    badgeClass: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'EDITOR_NOTICIAS',
    label: 'Editor de Noticias',
    description:
      'Sólo la sección de Noticias: crea, edita y elimina noticias. No ve las demás secciones.',
    badgeClass: 'bg-sky-100 text-sky-800',
  },
  {
    id: 'EDITOR_SESIONES',
    label: 'Editor de Sesiones',
    description:
      'Sólo la sección de Sesiones: administra los videos y el calendario de sesiones.',
    badgeClass: 'bg-teal-100 text-teal-800',
  },
  {
    id: 'EDITOR_COMUNICADOS',
    label: 'Editor de Comunicados',
    description:
      'Sólo la sección de Comunicados: crea, edita, activa y elimina comunicados.',
    badgeClass: 'bg-indigo-100 text-indigo-800',
  },
  {
    id: 'EDITOR_AUDITORIA',
    label: 'Editor de Auditoría',
    description:
      'Sólo la sección de Auditoría: administra los documentos de auditoría.',
    badgeClass: 'bg-amber-100 text-amber-800',
  },
  {
    id: 'MODERATOR',
    label: 'Moderador',
    description:
      'Sin acceso al panel: el backend todavía no le habilita ninguna sección.',
    badgeClass: 'bg-yellow-100 text-yellow-800',
  },
  {
    id: 'VIEWER',
    label: 'Solo lectura',
    description: 'Sin acceso al panel de administración.',
    badgeClass: 'bg-gray-100 text-gray-700',
  },
  {
    id: 'CITIZEN',
    label: 'Ciudadano',
    description: 'Solo portal público.',
    badgeClass: 'bg-green-100 text-green-800',
  },
]

export const USER_STATUSES: StatusInfo[] = [
  { id: 'ACTIVE', label: 'Activo', badgeClass: 'bg-green-100 text-green-800' },
  { id: 'PENDING', label: 'Pendiente', badgeClass: 'bg-yellow-100 text-yellow-800' },
  { id: 'INACTIVE', label: 'Inactivo', badgeClass: 'bg-gray-100 text-gray-700' },
  { id: 'SUSPENDED', label: 'Suspendido', badgeClass: 'bg-orange-100 text-orange-800' },
  { id: 'LOCKED', label: 'Bloqueado', badgeClass: 'bg-red-100 text-red-800' },
]

export const SECTIONS: SectionInfo[] = [
  {
    id: 'noticias',
    label: 'Noticias',
    icon: '📰',
    path: '/admin/noticias',
    title: 'Gestión de Noticias',
    description: 'Crea, edita y administra todas las noticias del portal',
  },
  {
    id: 'sesiones',
    label: 'Sesiones',
    icon: '🎥',
    path: '/admin/sesiones',
    title: 'Gestión de Sesiones',
    description: 'Administra los videos y fechas de sesiones',
  },
  {
    id: 'comunicados',
    label: 'Comunicados',
    icon: '📢',
    path: '/admin/comunicados',
    title: '📢 Gestión de Comunicados',
    description: 'Comunicados que aparecen como modal en la página principal',
  },
  {
    id: 'auditoria',
    label: 'Auditoría',
    icon: '🔍',
    path: '/admin/auditoria',
    title: '📋 Auditorías Ejecutadas',
    description: 'Documentos de auditoría organizados por categorías',
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: '👥',
    path: '/admin/usuarios',
    title: '👥 Usuarios y Roles',
    description: 'Quién puede entrar al panel y con qué rol',
  },
]

// Matriz de permisos. Ojo: EDITOR (general) puede eliminar comunicados,
// sesiones y auditoría (el backend lo permite) pero NO noticias; el rol dueño
// de cada sección sí puede eliminar dentro de la suya.
export const PERMISSIONS: Record<SectionId, SectionPermissions> = {
  noticias: {
    view: [...NOTICIAS_ROLES],
    create: [...NOTICIAS_ROLES],
    edit: [...NOTICIAS_ROLES],
    delete: [...ADMIN_ROLES, 'EDITOR_NOTICIAS'],
  },
  comunicados: {
    view: [...COMUNICADOS_ROLES],
    create: [...COMUNICADOS_ROLES],
    edit: [...COMUNICADOS_ROLES],
    delete: [...COMUNICADOS_ROLES],
  },
  sesiones: {
    view: [...SESIONES_ROLES],
    create: [...SESIONES_ROLES],
    edit: [...SESIONES_ROLES],
    delete: [...SESIONES_ROLES],
  },
  auditoria: {
    view: [...AUDITORIA_ROLES],
    create: [...AUDITORIA_ROLES],
    edit: [...AUDITORIA_ROLES],
    delete: [...AUDITORIA_ROLES],
  },
  usuarios: {
    // GET /api/users está autorizado para EDITOR: puede consultar, no modificar
    view: [...CONTENT_ROLES],
    create: [...ADMIN_ROLES],
    edit: [...ADMIN_ROLES],
    delete: ['SUPER_ADMIN'],
  },
}

/** Normaliza un rol que viene del backend o de localStorage. */
export function normalizeRole(value: unknown): Role | null {
  if (typeof value !== 'string') return null
  const clean = value.trim().toUpperCase().replace(/[\s-]+/g, '_')
  return (ROLE_IDS as string[]).includes(clean) ? (clean as Role) : null
}

export function roleInfo(role: Role | null | undefined): RoleInfo | null {
  if (!role) return null
  return ROLES.find(r => r.id === role) || null
}

export function roleLabel(role: Role | null | undefined): string {
  return roleInfo(role)?.label || 'Sin rol'
}

export function statusInfo(status: UserStatus | string | null | undefined): StatusInfo {
  const found = USER_STATUSES.find(s => s.id === status)
  return found || { id: 'INACTIVE', label: String(status || 'Sin estado'), badgeClass: 'bg-gray-100 text-gray-700' }
}

export function sectionById(id: SectionId): SectionInfo | undefined {
  return SECTIONS.find(s => s.id === id)
}

/** Devuelve la sección a la que pertenece una ruta del panel. */
export function sectionForPath(path: string): SectionInfo | null {
  const clean = (path || '').split('?')[0].split('#')[0]
  return (
    SECTIONS.find(s => clean === s.path || clean.startsWith(s.path + '/')) || null
  )
}

export function canView(role: Role | null | undefined, section: SectionId): boolean {
  if (!role) return false
  return PERMISSIONS[section].view.includes(role)
}

export function can(
  role: Role | null | undefined,
  section: SectionId,
  action: ActionId = 'view'
): boolean {
  if (!role) return false
  if (action === 'view') return canView(role, section)
  const allowed = PERMISSIONS[section][action]
  return Array.isArray(allowed) && allowed.includes(role)
}

/** Secciones visibles para un rol, en el orden del menú. */
export function sectionsForRole(role: Role | null | undefined): SectionInfo[] {
  if (!role) return []
  return SECTIONS.filter(s => canView(role, s.id))
}

/** ¿Puede entrar al panel de administración en alguna sección? */
export function hasPanelAccess(role: Role | null | undefined): boolean {
  return sectionsForRole(role).length > 0
}

/** Primera ruta permitida para el rol; si no tiene ninguna, la pantalla de acceso denegado. */
export function homeRouteFor(role: Role | null | undefined): string {
  const first = sectionsForRole(role)[0]
  return first ? first.path : '/acceso-denegado'
}

/** Roles que el actor puede asignar a otros usuarios. */
export function assignableRoles(actorRole: Role | null | undefined): Role[] {
  if (actorRole === 'SUPER_ADMIN') return [...ROLE_IDS]
  if (actorRole === 'ADMIN') return ROLE_IDS.filter(r => r !== 'SUPER_ADMIN')
  return []
}

/** Estado sugerido al crear un usuario: tiene que ser ACTIVE para poder iniciar sesión. */
export function defaultStatusFor(): UserStatus {
  return 'ACTIVE'
}
