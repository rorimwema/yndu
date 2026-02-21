import { joinURL } from 'ufo';

export default defineEventHandler(async (event) => {
  const { denoApiUrl } = useRuntimeConfig();

  // The param "_" captures the wildcard part after /api/
  const path = event.context.params?._ || '';

  // Avoid proxying auth routes since they are handled locally by Nuxt Auth Utils
  if (path.startsWith('auth/')) {
    return;
  }

  // Construct the target URL on the Deno backend
  const target = joinURL(denoApiUrl, '/api', path);

  try {
    return await proxyRequest(event, target);
  } catch (error: unknown) {
    // If we get 401, token might be expired
    if (error?.statusCode === 401 || error?.response?.status === 401) {
      // Try to refresh token
      try {
        const session = await getUserSession(event);
        if (session.secure?.refreshToken) {
          // Call refresh endpoint
          const refreshResponse = await $fetch<{
            token: string;
            refreshToken: string;
          }>(`${denoApiUrl}/api/auth/refresh`, {
            method: 'POST',
            body: {
              refreshToken: session.secure.refreshToken,
            },
          });

          // Update session
          await setUserSession(event, {
            ...session,
            secure: {
              token: refreshResponse.token,
              refreshToken: refreshResponse.refreshToken,
            },
          });

          // Retry original request
          return await proxyRequest(event, target);
        }
      } catch (_refreshError) {
        // Refresh failed, clear session
        await clearUserSession(event);
      }
    }

    throw error;
  }
});
