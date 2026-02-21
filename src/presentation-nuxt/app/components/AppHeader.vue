<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { ArrowRight, Building2, Calendar, Menu, Search, ShoppingBag, ShoppingCart, Sprout, Truck, User, X } from 'lucide-vue-next';
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from 'reka-ui';
import { motion } from 'motion-v';
import { useCartStore } from '../stores/cart-store';

// Auth via nuxt-auth-utils
const { loggedIn, user, clear: clearSession } = useUserSession();
const cart = useCartStore();
const route = useRoute();

const isMobileMenuOpen = ref(false);
const searchQuery = ref('');

// Derived display helpers
const userInitials = computed(() => {
  const name = user.value?.name || user.value?.email || '';
  return name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
});

const userFullName = computed(() => user.value?.name || 'User');

// Close mobile menu on route change
watch(() => route.fullPath, () => {
  isMobileMenuOpen.value = false;
});

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    return navigateTo({ path: '/shop', query: { search: searchQuery.value } });
  }
};

const handleLogout = async () => {
  isMobileMenuOpen.value = false;
  await clearSession();
  return navigateTo('/');
};

const handleMobileNav = (path: string) => {
  isMobileMenuOpen.value = false;
  return navigateTo(path);
};

// Nav items for mobile menu
const navItems = [
  { label: 'About', path: '/about', icon: null },
  { label: 'Seasonal', path: '/seasonal-calendar', icon: Calendar },
  { label: 'Subscription', path: '/subscription', icon: Sprout },
  { label: 'Shop', path: '/shop', icon: ShoppingBag },
  { label: 'Bulk Order', path: '/bulk-order', icon: Building2 },
];
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b border-primary-deep/10 bg-canvas/85 backdrop-blur-xl">
    <!-- Main Header -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-8">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-3">
            <img 
              src="/yndu.svg" 
              alt="Yndu Logo" 
              class="h-8 w-auto"
              width="100"
              height="32"
            />
          </NuxtLink>
          
          <nav class="hidden md:flex items-center gap-6">
            <NuxtLink to="/about" class="text-sm font-medium text-foundation hover:text-primary-deep transition-colors duration-200 ease-in-out">
              About
            </NuxtLink>
            <NuxtLink to="/seasonal-calendar" class="text-sm font-medium text-foundation hover:text-primary-deep transition-colors duration-200 ease-in-out">
              Seasonal
            </NuxtLink>
            <NuxtLink to="/subscription" class="text-sm font-medium text-foundation hover:text-primary-deep transition-colors duration-200 ease-in-out">
              Subscription
            </NuxtLink>
            <NuxtLink to="/shop" class="text-sm font-medium text-foundation hover:text-primary-deep transition-colors duration-200 ease-in-out">
              Shop
            </NuxtLink>
            <NuxtLink to="/bulk-order" class="text-sm font-medium text-foundation hover:text-primary-deep transition-colors duration-200 ease-in-out flex items-center gap-1">
              <Building2 :size="14" />
              Bulk Order
            </NuxtLink>
          </nav>
        </div>

        <!-- Search & Actions -->
        <div class="flex flex-1 justify-end items-center gap-4">
          <!-- Search -->
          <div class="hidden sm:flex flex-1 max-w-xs">
            <div class="relative w-full">
                <input
                v-model="searchQuery"
                @keyup.enter="handleSearch"
                type="text"
                placeholder="Search Kibwezi fresh..."
                aria-label="Search products"
                class="w-full bg-neutral-50 dark:bg-white/10 border-none rounded py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-deep outline-none transition-all duration-200 ease-in-out"
              />
              <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <!-- Guest: Login/Register -->
            <template v-if="!loggedIn">
              <NuxtLink to="/login" class="text-sm font-medium text-foundation hidden sm:block hover:text-primary-deep transition-colors duration-200 ease-in-out">
                Login
              </NuxtLink>
              <NuxtLink to="/register" class="btn-primary hidden sm:block py-2 px-4 text-sm rounded">
                Sign up
              </NuxtLink>
            </template>

            <!-- Authenticated: User Menu with Reka UI -->
            <template v-else>
              <DropdownMenuRoot>
                <DropdownMenuTrigger
                  class="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-100 transition-colors duration-200 ease-in-out outline-none focus:ring-2 focus:ring-primary-deep"
                  aria-label="User menu"
                >
                  <!-- Avatar -->
                  <div class="w-8 h-8 rounded-full bg-primary-deep text-white flex items-center justify-center text-sm font-medium">
                    {{ userInitials }}
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuPortal>
                  <DropdownMenuContent
                    class="min-w-[220px] bg-white rounded shadow-lg border border-neutral-200 p-1 z-50 animate-in fade-in zoom-in-95 duration-200"
                    :side-offset="5"
                    loop
                    align="end"
                  >
                    <div class="px-2 py-1.5 border-b border-neutral-100 mb-1">
                      <p class="text-sm font-medium text-foundation">{{ userFullName }}</p>
                      <p class="text-xs text-neutral-400 truncate">{{ user?.email }}</p>
                    </div>

                    <DropdownMenuItem as-child>
                      <NuxtLink to="/account/profile" class="flex items-center px-2 py-1.5 text-sm text-neutral-600 rounded hover:bg-neutral-50 cursor-pointer w-full">
                        <User :size="16" class="mr-2" />
                        Profile
                      </NuxtLink>
                    </DropdownMenuItem>

                    <DropdownMenuItem as-child>
                      <NuxtLink to="/account/addresses" class="flex items-center px-2 py-1.5 text-sm text-neutral-600 rounded hover:bg-neutral-50 cursor-pointer w-full">
                        <Truck :size="16" class="mr-2" />
                        My Addresses
                      </NuxtLink>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem as-child>
                      <NuxtLink to="/orders" class="flex items-center px-2 py-1.5 text-sm text-neutral-600 rounded hover:bg-neutral-50 cursor-pointer w-full">
                         <ShoppingBag :size="16" class="mr-2" />
                         My Orders
                      </NuxtLink>
                    </DropdownMenuItem>

                     <DropdownMenuItem as-child>
                      <NuxtLink to="/subscriptions" class="flex items-center px-2 py-1.5 text-sm text-neutral-600 rounded hover:bg-neutral-50 cursor-pointer w-full">
                        <Sprout :size="16" class="mr-2" />
                        Subscriptions
                      </NuxtLink>
                    </DropdownMenuItem>
                    
                     <DropdownMenuItem as-child>
                      <NuxtLink to="/account/settings" class="flex items-center px-2 py-1.5 text-sm text-neutral-600 rounded hover:bg-neutral-50 cursor-pointer w-full">
                        <User :size="16" class="mr-2" />
                        Settings
                      </NuxtLink>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator class="h-px bg-neutral-100 my-1" />

                    <DropdownMenuItem as-child @select="handleLogout">
                      <button type="button" class="outline-none flex items-center px-2 py-1.5 text-sm text-accent-clay rounded hover:bg-accent-clay/10 cursor-pointer w-full">
                        <ArrowRight :size="16" class="mr-2 rotate-180" />
                        Logout
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenuRoot>
            </template>

            <CartPopover>
              <template #trigger>
                <button 
                  class="relative bg-accent-clay hover:bg-primary-deep text-white font-medium py-2 px-5 rounded text-sm transition-all duration-200 ease-in-out flex items-center gap-2"
                >
                  <ShoppingCart :size="16" />
                  <span>Cart</span>
                  <span v-if="cart.itemCount > 0" class="absolute -top-2 -right-2 bg-foundation text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-canvas shadow-sm">
                    {{ cart.itemCount }}
                  </span>
                </button>
              </template>
            </CartPopover>
            
            <!-- Mobile Menu Button -->
            <button 
              @click="isMobileMenuOpen = true"
              class="md:hidden p-3 rounded hover:bg-neutral-100 transition-colors duration-200 ease-in-out flex items-center justify-center min-h-[44px] min-w-[44px]"
              aria-label="Open navigation menu"
            >
              <Menu :size="24" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Mobile Navigation Drawer (Reka UI Dialog) -->
  <DialogRoot v-model:open="isMobileMenuOpen">
    <DialogPortal>
      <!-- Backdrop overlay -->
      <DialogOverlay class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden mobile-overlay" />

      <!-- Drawer content — slides in from right -->
      <DialogContent
        class="fixed right-0 top-0 bottom-0 w-[300px] max-w-[85vw] z-[60] md:hidden outline-none mobile-drawer"
        :trap-focus="true"
      >
        <DialogTitle class="sr-only">Navigation Menu</DialogTitle>
        <DialogDescription class="sr-only">Site navigation and account links</DialogDescription>

        <div class="flex flex-col h-full bg-canvas">
          <!-- Drawer Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
            <NuxtLink to="/" class="flex items-center gap-2" @click="isMobileMenuOpen = false">
              <img src="/yndu.svg" alt="Yndu" class="h-7 w-auto" width="88" height="28" />
              <span class="font-serif text-foundation text-lg tracking-tight">Yndu</span>
            </NuxtLink>
            <button
              @click="isMobileMenuOpen = false"
              class="p-2 -mr-2 rounded text-neutral-400 hover:bg-neutral-100 hover:text-foundation transition-colors duration-200 ease-in-out"
              aria-label="Close navigation menu"
            >
              <X :size="20" />
            </button>
          </div>

          <!-- Search (mobile) -->
          <div class="px-5 py-3 border-b border-neutral-100">
            <div class="relative">
              <input
                v-model="searchQuery"
                @keyup.enter="handleSearch(); isMobileMenuOpen = false"
                type="text"
                placeholder="Search products..."
                aria-label="Search products"
                class="w-full bg-white border border-neutral-200 rounded py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep outline-none transition-all duration-200 ease-in-out"
              />
              <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            </div>
          </div>
          
          <!-- Navigation Links -->
          <nav class="flex-1 overflow-y-auto px-4 py-5">
            <div class="space-y-1">
              <motion.button
                v-for="(item, index) in navItems"
                :key="item.path"
                :initial="{ opacity: 0, x: 20 }"
                :animate="{ opacity: 1, x: 0 }"
                :transition="{ duration: 0.25, delay: index * 0.05 }"
                class="w-full flex items-center gap-3 px-4 py-3 rounded text-base font-medium transition-colors duration-200 ease-in-out"
                :class="route.path === item.path
                  ? 'bg-primary-deep/10 text-primary-deep'
                  : 'text-foundation hover:bg-white hover:shadow-sm'"
                @click="handleMobileNav(item.path)"
              >
                <component :is="item.icon" v-if="item.icon" :size="20" class="flex-shrink-0" />
                <span>{{ item.label }}</span>
              </motion.button>
            </div>

            <!-- Divider -->
            <div class="my-5 h-px bg-neutral-200" />

            <!-- Guest actions -->
            <template v-if="!loggedIn">
              <div class="space-y-3">
                <motion.div :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }" :transition="{ delay: 0.2 }">
                  <button
                    class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-base font-medium text-foundation bg-white border border-neutral-200 hover:border-primary-deep/30 transition-colors duration-200 ease-in-out"
                    @click="handleMobileNav('/login')"
                  >
                    <User :size="18" />
                    Login
                  </button>
                </motion.div>
                <motion.div :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }" :transition="{ delay: 0.25 }">
                  <button
                    class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-base font-medium text-white bg-accent-clay hover:bg-primary-deep transition-colors duration-200 ease-in-out shadow-sm"
                    @click="handleMobileNav('/register')"
                  >
                    Sign up
                  </button>
                </motion.div>
              </div>
            </template>

            <!-- Authenticated user section -->
            <template v-else>
              <motion.div :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }" :transition="{ delay: 0.2 }">
                <!-- User info -->
                <div class="flex items-center gap-3 px-3 mb-4">
                  <div class="w-10 h-10 rounded-full bg-primary-deep text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {{ userInitials }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-foundation text-sm truncate">{{ userFullName }}</p>
                    <p class="text-xs text-neutral-400 truncate">{{ user?.email }}</p>
                  </div>
                </div>

                <!-- Account links -->
                <div class="space-y-1">
                  <button
                    class="w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-medium text-neutral-600 hover:bg-white hover:shadow-sm transition-colors duration-200 ease-in-out"
                    @click="handleMobileNav('/account/profile')"
                  >
                    <User :size="18" class="text-neutral-400" />
                    Profile
                  </button>
                  <button
                    class="w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium text-neutral-600 hover:bg-white hover:shadow-sm transition-colors duration-200 ease-in-out"
                    @click="handleMobileNav('/orders')"
                  >
                    <ShoppingBag :size="18" class="text-neutral-400" />
                    My Orders
                  </button>
                  <button
                    class="w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium text-neutral-600 hover:bg-white hover:shadow-sm transition-colors duration-200 ease-in-out"
                    @click="handleMobileNav('/subscriptions')"
                  >
                    <Sprout :size="18" class="text-neutral-400" />
                    Subscriptions
                  </button>
                  <button
                    class="w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium text-neutral-600 hover:bg-white hover:shadow-sm transition-colors duration-200 ease-in-out"
                    @click="handleMobileNav('/account/addresses')"
                  >
                    <Truck :size="18" class="text-neutral-400" />
                    Addresses
                  </button>
                </div>
              </motion.div>
            </template>
          </nav>

          <!-- Drawer Footer -->
          <div class="px-5 py-4 border-t border-neutral-200">
            <template v-if="loggedIn">
              <button
                @click="handleLogout"
                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200 ease-in-out"
              >
                <ArrowRight :size="16" class="rotate-180" />
                Sign out
              </button>
            </template>
            <p class="text-xs text-neutral-400 text-center mt-2 italic font-serif">Farm-fresh produce, delivered.</p>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
/* Overlay animation */
.mobile-overlay {
  animation: overlayFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Drawer slide-in animation */
.mobile-drawer {
  animation: drawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes drawerSlideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
</style>
