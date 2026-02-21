// Auth middleware — protects routes that require authentication
// Uses nuxt-auth-utils useUserSession() instead of Pinia store

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession();

  // Allow access to login and register pages
  const publicRoutes = ['/login', '/register'];

  if (!loggedIn.value && !publicRoutes.includes(to.path)) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  }
});
