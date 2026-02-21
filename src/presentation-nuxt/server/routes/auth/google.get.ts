// Google OAuth handler via nuxt-auth-utils
export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['openid', 'email', 'profile'],
  },
  async onSuccess(event, { user: googleUser }) {
    // Set the user session from Google profile
    await setUserSession(event, {
      user: {
        id: `google_${googleUser.sub}`,
        email: googleUser.email,
        name: googleUser.name || googleUser.given_name || 'User',
        avatar: googleUser.picture,
      },
      loggedInAt: new Date(),
    });

    return sendRedirect(event, '/');
  },
  onError(event, error) {
    console.error('Google OAuth error:', error);
    return sendRedirect(event, '/login?error=oauth_failed');
  },
});
