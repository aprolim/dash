// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  // Solo en cliente
  if (process.client) {
    // Verificar token manualmente
    const token = localStorage.getItem('auth_token')
    
    // Si no está autenticado y no va a login, redirigir
    if (!token && !to.path.startsWith('/auth/')) {
      return navigateTo('/auth/login')
    }
    
    // Si está autenticado y va a login, redirigir al dashboard
    if (token && to.path.startsWith('/auth/')) {
      return navigateTo('/dashboard')
    }
  }
})