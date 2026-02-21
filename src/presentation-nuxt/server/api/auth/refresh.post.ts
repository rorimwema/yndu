// Token refresh endpoint
export default defineEventHandler(async (event) => {
  const { denoApiUrl } = useRuntimeConfig();

  // Get current session
  const session = await getUserSession(event);

  if (!session.secure?.refreshToken) {
    throw createError({
      statusCode: 401,
      message: 'No refresh token available',
    });
  }

  try {
    // Call Deno backend to refresh tokens
    const response = await $fetch<{
      token: string;
      refreshToken: string;
    }>(`${denoApiUrl}/api/auth/refresh`, {
      method: 'POST',
      body: {
        refreshToken: session.secure.refreshToken,
      },
    });

    // Update session with new tokens
    await setUserSession(event, {
      ...session,
      secure: {
        token: response.token,
        refreshToken: response.refreshToken,
      },
    });

    return { success: true };
  } catch (_error: unknown) {
    // Clear session on refresh failure
    await clearUserSession(event);

    throw createError({
      statusCode: 401,
      message: 'Session expired. Please log in again.',
    });
  }
});
