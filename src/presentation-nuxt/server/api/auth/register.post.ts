// Register API route — proxies to Deno backend
export default defineEventHandler(async (event) => {
  const { denoApiUrl } = useRuntimeConfig();
  const body = await readBody(event);

  // Validate input
  if (!body?.email || !body?.password || !body?.name || !body?.phone) {
    throw createError({
      statusCode: 400,
      message: 'Email, password, name, and phone are required',
    });
  }

  try {
    // Call Deno backend auth endpoint
    const response = await $fetch<{
      user: { id: string; email: string; name: string; phone?: string; role?: string };
      token: string;
      refreshToken: string;
    }>(`${denoApiUrl}/api/auth/register`, {
      method: 'POST',
      body: {
        email: body.email,
        password: body.password,
        name: body.name,
        phone: body.phone,
      },
    });

    // Set the user session with sealed cookie
    await setUserSession(event, {
      user: {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        phone: response.user.phone,
        role: response.user.role,
      },
      loggedInAt: new Date(),
      secure: {
        token: response.token,
        refreshToken: response.refreshToken,
      },
    });

    return {
      user: response.user,
    };
  } catch (error: unknown) {
    const statusCode = error?.statusCode || error?.response?.status || 500;
    const message = error?.data?.message || error?.message || 'Registration failed';

    throw createError({
      statusCode,
      message,
    });
  }
});
