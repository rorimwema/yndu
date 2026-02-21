// Composable for automatic token refresh
export const useAuthRefresh = () => {
  const { loggedIn } = useUserSession();
  let refreshTimer: ReturnType<typeof setTimeout> | null = null;

  // Refresh token 1 minute before expiry
  const TOKEN_REFRESH_BUFFER = 60 * 1000; // 1 minute
  const TOKEN_LIFETIME = 10 * 60 * 1000; // 10 minutes

  const scheduleRefresh = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    if (!loggedIn.value) return;

    // Schedule refresh 1 minute before token expires
    const refreshDelay = TOKEN_LIFETIME - TOKEN_REFRESH_BUFFER;

    refreshTimer = setTimeout(async () => {
      await refreshToken();
    }, refreshDelay);
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      await $fetch('/api/auth/refresh', {
        method: 'POST',
      });

      // Reschedule next refresh
      scheduleRefresh();
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Redirect to login on refresh failure
      await navigateTo('/login');
      return false;
    }
  };

  const clearRefreshTimer = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
  };

  // Watch for login state changes
  watch(loggedIn, (isLoggedIn) => {
    if (isLoggedIn) {
      scheduleRefresh();
    } else {
      clearRefreshTimer();
    }
  });

  // Schedule on mount if already logged in
  onMounted(() => {
    if (loggedIn.value) {
      scheduleRefresh();
    }
  });

  // Cleanup on unmount
  onUnmounted(() => {
    clearRefreshTimer();
  });

  return {
    refreshToken,
    scheduleRefresh,
    clearRefreshTimer,
  };
};
