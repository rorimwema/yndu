// Auth store — thin wrapper around nuxt-auth-utils useUserSession()
// All actual session management is handled by sealed cookies via nuxt-auth-utils
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // Loading / error state
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Login with email and password.
   * Calls the Nuxt server route which proxies to Deno backend.
   */
  async function login(email: string, password: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      // Refresh the session composable state
      const { fetch: refreshSession } = useUserSession();
      await refreshSession();

      // Schedule token refresh after successful login
      const { scheduleRefresh } = useAuthRefresh();
      scheduleRefresh();

      return true;
    } catch (err: unknown) {
      error.value = err?.data?.message || err?.message || 'Login failed';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Register a new account.
   * Calls the Nuxt server route which proxies to Deno backend.
   */
  async function register(data: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: data,
      });

      // Refresh the session composable state
      const { fetch: refreshSession } = useUserSession();
      await refreshSession();

      // Schedule token refresh after successful registration
      const { scheduleRefresh } = useAuthRefresh();
      scheduleRefresh();

      return true;
    } catch (err: unknown) {
      error.value = err?.data?.message || err?.message || 'Registration failed';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Logout — clears the session cookie and invalidates refresh token on backend
   */
  async function logout(): Promise<void> {
    try {
      // Clear refresh timer first
      const { clearRefreshTimer } = useAuthRefresh();
      clearRefreshTimer();

      // Call backend to invalidate refresh token
      await $fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // Continue with logout even if backend call fails
      console.error('Backend logout error:', err);
    } finally {
      // Always clear local session
      const { clear } = useUserSession();
      await clear();
    }
  }

  /**
   * Refresh the session token manually
   */
  async function refreshSession(): Promise<boolean> {
    try {
      await $fetch('/api/auth/refresh', {
        method: 'POST',
      });

      // Refresh the session state
      const { fetch: refreshUserSession } = useUserSession();
      await refreshUserSession();

      // Reschedule automatic refresh
      const { scheduleRefresh } = useAuthRefresh();
      scheduleRefresh();

      return true;
    } catch (_err) {
      error.value = 'Session expired. Please log in again.';
      return false;
    }
  }

  /**
   * Clear any error message
   */
  function clearError(): void {
    error.value = null;
  }

  return {
    isLoading,
    error,
    login,
    register,
    logout,
    refreshSession,
    clearError,
  };
});
