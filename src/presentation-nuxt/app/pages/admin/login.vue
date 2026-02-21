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
  AlertCircle,
  LayoutDashboard
} from 'lucide-vue-next';
import { useAuthStore } from '~/stores/auth-store';

useSeoMeta({
  title: 'Admin Login | Yndu',
  description: 'Sign in to access the Yndu admin dashboard.',
});

definePageMeta({
  layout: 'auth',
});

const authStore = useAuthStore();
const route = useRoute();

// Check if already logged in as admin - redirect to admin panel
const { loggedIn, user } = useUserSession();
if (loggedIn.value) {
  const userRole = user.value?.role;
  if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'B2B_PARTNER') {
    navigateTo('/admin');
  } else {
    // Non-admin users should not be on admin login page
    navigateTo('/');
  }
}

const email = ref('');
const password = ref('');
const showPassword = ref(false);

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

const handleLogin = async () => {
  if (!validateEmail() || !validatePassword()) return;
  
  const success = await authStore.login(email.value, password.value);
  if (success) {
    const { user } = useUserSession();
    const userRole = user.value?.role;
    
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'B2B_PARTNER') {
      navigateTo('/admin');
    } else {
      navigateTo('/');
    }
  }
};

const handleBackToStore = () => {
  navigateTo('/');
};
</script>

<template>
  <div class="min-h-dvh bg-neutral-900 flex items-center justify-center p-4">
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
          class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm mb-3 shadow-lg border border-white/20 p-2.5"
        >
          <img 
            src="/yndu.svg" 
            alt="Yndu Logo" 
            class="w-full h-full object-contain"
          />
        </motion.div>
        <div class="flex items-center justify-center gap-2 mb-1">
          <LayoutDashboard class="w-5 h-5 text-primary-deep" />
          <h1 class="text-xl font-bold text-white">Admin Portal</h1>
        </div>
        <p class="text-xs text-neutral-400">Sign in to manage your Yndu business</p>
      </div>

      <!-- Main Card -->
      <div class="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 border border-white/10 overflow-hidden">
        <div class="p-5">
          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="space-y-3">
            <!-- Email Input -->
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Email address</label>
              <div class="relative">
                <Mail 
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" 
                  :size="16" 
                />
                <input
                  v-model="email"
                  type="email"
                  placeholder="admin@yndu.local"
                  class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-white/20 bg-white/5 text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep outline-none transition-all"
                  :class="{ 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20': emailError }"
                  :disabled="authStore.isLoading"
                />
              </div>
              <p v-if="emailError" class="mt-1 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle :size="12" />
                {{ emailError }}
              </p>
            </div>

            <!-- Password Input -->
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">Password</label>
              <div class="relative">
                <Lock
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                  :size="16"
                />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  class="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-white/20 bg-white/5 text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep outline-none transition-all"
                  :class="{ 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20': passwordError }"
                  :disabled="authStore.isLoading"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  <Eye v-if="!showPassword" :size="16" />
                  <EyeOff v-else :size="16" />
                </button>
              </div>
              <p v-if="passwordError" class="mt-1 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle :size="12" />
                {{ passwordError }}
              </p>
            </div>

            <!-- Error Message -->
            <div v-if="authStore.error" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {{ authStore.error }}
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="authStore.isLoading"
              class="w-full bg-primary-deep text-white text-sm font-semibold py-2.5 rounded-lg shadow-lg shadow-primary-deep/20 hover:shadow-xl hover:shadow-primary-deep/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              <Loader2 v-if="authStore.isLoading" class="animate-spin" :size="16" />
              <span v-else>Sign In</span>
              <ArrowRight v-if="!authStore.isLoading" :size="16" />
            </button>
          </form>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="mt-6 space-y-3">
        <!-- Trust Badges -->
        <div class="flex items-center justify-center gap-4 text-[10px] text-neutral-500">
          <div class="flex items-center gap-1">
            <ShieldCheck :size="12" class="text-primary-deep" />
            <span>Secure Admin Access</span>
          </div>
        </div>

        <!-- Back to Store -->
        <p class="text-center text-xs text-neutral-500">
          <button @click="handleBackToStore" class="text-neutral-400 hover:text-white transition-colors">
            Back to store
          </button>
        </p>
      </div>
    </motion.div>
  </div>
</template>
