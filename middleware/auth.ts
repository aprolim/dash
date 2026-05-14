// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  // Solo en cliente
  if (process.client) {
    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('user')
    
    console.log('🔐 [auth] Verificando ruta:', to.path)
    console.log('   Token:', token ? 'presente' : 'ausente')
    console.log('   User:', user ? 'presente' : 'ausente')
    
    // Rutas protegidas (requieren autenticación)
    const protectedRoutes = ['/dashboard', '/tabs', '/admin', '/admin/noticias']
    const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route))
    
    // Si la ruta es protegida y no hay token → redirigir a login
    if (isProtectedRoute && (!token || !user)) {
      console.log('❌ Ruta protegida sin autenticación, redirigiendo a login')
      return navigateTo('/auth/login')
    }
    
    // Si hay token pero la ruta es de login → redirigir a dashboard
    if (token && user && to.path.startsWith('/auth')) {
      console.log('✅ Ya autenticado, redirigiendo a dashboard')
      return navigateTo('/dashboard')
    }
  }
})