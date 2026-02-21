// Session type declarations for nuxt-auth-utils
declare module '#auth-utils' {
  interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    phone?: string;
    role?: string;
  }

  interface UserSession {
    loggedInAt: Date;
  }

  interface SecureSessionData {
    token: string; // Deno backend JWT access token
    refreshToken: string; // Deno backend JWT refresh token
  }
}

export {};
