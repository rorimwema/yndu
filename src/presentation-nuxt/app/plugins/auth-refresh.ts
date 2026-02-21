// Plugin to enable automatic token refresh across the app
export default defineNuxtPlugin(() => {
  const { loggedIn } = useUserSession();
  const { scheduleRefresh, clearRefreshTimer } = useAuthRefresh();

  // Initialize refresh scheduling
  if (loggedIn.value) {
    scheduleRefresh();
  }

  // Watch for login changes
  watch(loggedIn, (isLoggedIn) => {
    if (isLoggedIn) {
      scheduleRefresh();
    } else {
      clearRefreshTimer();
    }
  });
});
