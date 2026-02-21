<script setup lang="ts">
import { ref } from 'vue';
import { motion } from 'motion-v';
import { 
  Mail, 
  Lock,
  ArrowRight, 
  Loader2, 
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-vue-next';
import { useAuthStore } from '~/stores/auth-store';

// SEO
useSeoMeta({
  title: 'Login | Yndu',
  description: 'Sign in to your Yndu account to manage your fresh produce deliveries.',
});

definePageMeta({
  layout: 'auth',
});

const authStore = useAuthStore();
const route = useRoute();

// Check if already logged in and redirect
const { loggedIn, user } = useUserSession();
if (loggedIn.value) {
  const userRole = user.value?.role;
  // Admins go to admin panel, customers go to home
  if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'B2B_PARTNER') {
    navigateTo('/admin');
  } else {
    navigateTo('/');
  }
}

// Form state
const email = ref('');
const password = ref('');
const showPassword = ref(false);

// Validation
const emailError = ref('');
const passwordError = ref('');

const validateEmail = (): boolean => {
  emailError.value = '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email.value) {
    emailError.value = 'Email is required';
    return false;
  }
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email address';
    return false;
  }
  return true;
};

const validatePassword = (): boolean => {
  passwordError.value = '';
  if (!password.value) {
    passwordError.value = 'Password is required';
    return false;
  }
  return true;
};

// Actions
const handleLogin = async () => {
  if (!validateEmail() || !validatePassword()) return;
  
  const success = await authStore.login(email.value, password.value);
  if (success) {
    const { user } = useUserSession();
    const userRole = user.value?.role;
    
    // Redirect admins to admin panel
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'B2B_PARTNER') {
      navigateTo('/admin');
    } else {
      const redirect = route.query.redirect as string;
      navigateTo(redirect || '/');
    }
  }
};

const handleGoogleLogin = () => {
  // Redirect to Google OAuth route (handled by nuxt-auth-utils)
  navigateTo('/auth/google', { external: true });
};
</script>

<template>
  <div class="min-h-dvh bg-[var(--bg-canvas)] flex items-center justify-center p-4">
    <motion.div
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5, ease: 'easeOut' }"
      class="w-full max-w-md"
    >
      <!-- Logo & Header -->
      <div class="text-center mb-6">
        <motion.div
          :initial="{ scale: 0.8 }"
          :animate="{ scale: 1 }"
          :transition="{ delay: 0.2, type: 'spring', stiffness: 200 }"
          class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white dark:bg-zinc-900 mb-3 shadow-lg shadow-primary-deep/10 border border-neutral-100 dark:border-zinc-800 p-2.5"
        >
          <img 
            src="/yndu.svg" 
            alt="Yndu Logo" 
            class="w-full h-full object-contain"
          />
        </motion.div>
        <h1 class="text-xl font-bold text-foundation text-balance mb-1">Welcome to Yndu</h1>
        <p class="text-xs text-neutral-500">Sign in to continue to your account</p>
      </div>

      <!-- Main Card -->
      <div class="bg-white dark:bg-zinc-900 rounded-xl shadow-lg shadow-primary-deep/5 border border-neutral-100 dark:border-zinc-800 overflow-hidden">
        <div class="p-5">
          <!-- Google Login Button -->
          <button
            @click="handleGoogleLogin"
            :disabled="authStore.isLoading"
            class="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-zinc-700 text-neutral-600 dark:text-neutral-300 text-sm font-medium hover:border-primary-deep hover:text-primary-deep transition-colors disabled:opacity-50"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <!-- Divider -->
          <div class="relative my-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-neutral-200 dark:border-zinc-700" />
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="px-3 bg-white dark:bg-zinc-900 text-neutral-400">or sign in with email</span>
            </div>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="space-y-3">
            <!-- Email Input -->
            <div>
              <label class="block text-xs font-medium text-neutral-600 mb-1">Email address</label>
              <div class="relative">
                <Mail 
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" 
                  :size="16" 
                />
                <input
                  v-model="email"
                  type="email"
                  placeholder="you@example.com"
                  class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-foundation focus:ring-2 focus:ring-primary-deep/20 focus:border-primary-deep outline-none transition-all"
                  :class="{ 'border-accent-clay focus:border-accent-clay focus:ring-accent-clay/20': emailError }"
                  :disabled="authStore.isLoading"
                />
              </div>
              <p v-if="emailError" class="mt-1 text-xs text-accent-clay flex items-center gap-1">
                <AlertCircle :size="12" />
                {{ emailError }}
              </p>
            </div>

            <!-- Password Input -->
            <div>
              <label class="block text-xs font-medium text-neutral-600 mb-1">Password</label>
              <div class="relative">
                <Lock
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  :size="16"
                />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  class="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-foundation focus:ring-2 focus:ring-primary-deep/20 focus:border-primary-deep outline-none transition-all"
                  :class="{ 'border-accent-clay focus:border-accent-clay focus:ring-accent-clay/20': passwordError }"
                  :disabled="authStore.isLoading"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <Eye v-if="!showPassword" :size="16" />
                  <EyeOff v-else :size="16" />
                </button>
              </div>
              <p v-if="passwordError" class="mt-1 text-xs text-accent-clay flex items-center gap-1">
                <AlertCircle :size="12" />
                {{ passwordError }}
              </p>
            </div>

            <!-- Error Message -->
            <div v-if="authStore.error" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {{ authStore.error }}
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="authStore.isLoading"
              class="w-full bg-primary-deep text-white text-sm font-semibold py-2.5 rounded-lg shadow-md shadow-primary-deep/20 hover:shadow-lg hover:shadow-primary-deep/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              <Loader2 v-if="authStore.isLoading" class="animate-spin" :size="16" />
              <span v-else>Sign In</span>
              <ArrowRight v-if="!authStore.isLoading" :size="16" />
            </button>
          </form>

          <!-- Register Link -->
          <p class="text-center text-xs text-neutral-500 mt-4">
            Don't have an account?
            <NuxtLink to="/register" class="text-primary-deep font-medium hover:underline">
              Create one
            </NuxtLink>
          </p>

          <!-- Admin Link -->
          <p class="text-center text-xs text-neutral-400 mt-2">
            <NuxtLink to="/admin/login" class="hover:text-primary-deep transition-colors">
              Admin Login
            </NuxtLink>
          </p>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="mt-6 space-y-3">
        <!-- Trust Badges -->
        <div class="flex items-center justify-center gap-4 text-[10px] text-neutral-400">
          <div class="flex items-center gap-1">
            <ShieldCheck :size="12" class="text-primary-deep" />
            <span>Secure Login</span>
          </div>
        </div>

        <!-- Terms -->
        <p class="text-center text-[10px] text-neutral-400">
          By signing in, you agree to our 
          <NuxtLink to="/terms" class="text-primary-deep hover:underline">Terms</NuxtLink>
          &
          <NuxtLink to="/privacy" class="text-primary-deep hover:underline">Privacy</NuxtLink>
        </p>
      </div>
    </motion.div>
  </div>
</template>
