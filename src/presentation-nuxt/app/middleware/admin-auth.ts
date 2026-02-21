// Admin auth middleware — protects Admin routes that require admin role
// Uses nuxt-auth-utils useUserSession() for session data

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'B2B_PARTNER'];

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession();

  // Public admin routes (no auth required)
  const publicAdminRoutes = ['/admin/login'];
  if (publicAdminRoutes.includes(to.path)) {
    // If already logged in as admin, redirect to admin dashboard
    if (loggedIn.value) {
      const userRole = user.value?.role;
      if (userRole && ADMIN_ROLES.includes(userRole)) {
        return navigateTo('/admin');
      }
    }
    return;
  }

  const isAdminRoute = to.path.startsWith('/admin');
  if (!isAdminRoute) return;

  // Require authentication for protected admin routes
  if (!loggedIn.value) {
    return navigateTo({
      path: '/admin/login',
      query: { redirect: to.fullPath },
    });
  }

  const userRole = user.value?.role;

  if (!userRole || !ADMIN_ROLES.includes(userRole)) {
    return navigateTo('/');
  }
});
