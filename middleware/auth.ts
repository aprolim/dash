// middleware/auth.ts
// Control de acceso del panel:
//   1. sin sesión            → /auth/login
//   2. con sesión pero sin rol válido  → /acceso-denegado (hay que volver a entrar)
//   3. rol sin acceso al panel         → /acceso-denegado
//   4. rol sin acceso a esa sección    → /acceso-denegado?seccion=...
import {
  canView,
  hasPanelAccess,
  homeRouteFor,
  normalizeRole,
  sectionForPath,
} from '~/utils/roles'
import type { Role } from '~/types/auth'

export default defineNuxtRouteMiddleware((to) => {
  // Solo en cliente
  if (typeof window === 'undefined') return

  const token = localStorage.getItem('auth_token')
  const rawUser = localStorage.getItem('user')

  let role: Role | null = null
  if (rawUser) {
    try {
      role = normalizeRole(JSON.parse(rawUser)?.role)
    } catch {
      role = null
    }
  }

  const isAuthRoute = to.path.startsWith('/auth')
  const isAdminRoute = to.path.startsWith('/admin')

  console.log('🔐 [auth] Ruta:', to.path, '| Token:', !!token, '| Rol:', role || 'desconocido')

  // Ya autenticado y entra a /auth → a su inicio según rol
  if (token && rawUser && isAuthRoute) {
    console.log('✅ [auth] Ya autenticado, redirigiendo a', homeRouteFor(role))
    return navigateTo(homeRouteFor(role))
  }

  if (!isAdminRoute) return

  // Rutas del panel sin sesión → login
  if (!token || !rawUser) {
    console.log('❌ [auth] Ruta protegida sin autenticación, redirigiendo a login')
    return navigateTo('/auth/login')
  }

  // Sesión sin rol reconocido (sesión vieja) → explicar y volver a entrar
  if (!role) {
    console.log('❌ [auth] Sesión sin rol válido')
    return navigateTo('/acceso-denegado')
  }

  // Rol sin ninguna sección habilitada (MODERATOR, VIEWER, CITIZEN)
  if (!hasPanelAccess(role)) {
    console.log('❌ [auth] El rol', role, 'no tiene acceso al panel')
    return navigateTo('/acceso-denegado')
  }

  // Sección puntual no permitida para su rol
  const section = sectionForPath(to.path)
  if (section && !canView(role, section.id)) {
    console.log('❌ [auth] El rol', role, 'no puede entrar a', section.id)
    return navigateTo(`/acceso-denegado?seccion=${section.id}`)
  }
})
