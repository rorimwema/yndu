<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ArrowRight, Menu, Search, ShoppingBag, ShoppingCart, Sprout, Truck, User, X } from 'lucide-vue-next';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();

const isMobileMenuOpen = ref(false);
const searchQuery = ref('');

// Initialize auth
onMounted(() => {
  authStore.initAuth();
});

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    return navigateTo({ path: '/shop', query: { search: searchQuery.value } });
  }
};

const handleLogout = async () => {
  await authStore.logout();
  return navigateTo('/');
};

// Toggle mobile menu
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b border-flexoki bg-flexoki backdrop-blur-md">
    <!-- Delivery Banner -->
    <div class="py-2 px-4 border-b border-flexoki-primary/10">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-sm">
        <span class="text-flexoki-primary font-semibold flex items-center gap-1">
          <Truck :size="16" />
          Delivery Policy:
        </span>
        <span class="text-flexoki">
          Same day delivery if you order before 10 AM, otherwise next day delivery.
        </span>
        <a href="#delivery-areas" class="text-flexoki-primary font-bold hover:underline flex items-center gap-1 text-xs">
          View areas <ArrowRight :size="12" />
        </a>
      </div>
    </div>

    <!-- Main Header -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-8">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-3">
            <img 
              src="~/assets/images/yndu.svg" 
              alt="Yndu Logo" 
              class="h-8 w-auto"
            />
            <h1 class="text-lg font-bold text-flexoki">Yndu Marketplace</h1>
          </NuxtLink>
          
          <nav class="hidden md:flex items-center gap-6">
            <NuxtLink to="/subscription" class="text-sm font-medium text-flexoki hover:text-flexoki-primary transition-colors">
              Subscription
            </NuxtLink>
            <NuxtLink to="/shop" class="text-sm font-medium text-flexoki hover:text-flexoki-primary transition-colors">
              Shop
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
                class="w-full bg-flexoki-50 dark:bg-white/10 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-flexoki-primary outline-none"
              />
              <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-flexoki-muted" />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <!-- Guest: Login/Register -->
            <template v-if="!authStore.isAuthenticated">
              <NuxtLink to="/login" class="text-sm font-medium text-flexoki hidden sm:block hover:text-flexoki-primary">
                Login
              </NuxtLink>
              <NuxtLink to="/register" class="btn-primary hidden sm:block py-2 px-4 text-sm rounded-lg bg-flexoki-primary text-white hover:bg-flexoki-primary/90 font-bold transition-colors">
                Sign up
              </NuxtLink>
            </template>

            <!-- Authenticated: User Menu with Reka UI -->
            <template v-else>
              <DropdownMenuRoot>
                <DropdownMenuTrigger
                  class="flex items-center gap-2 p-1 rounded-full hover:bg-flexoki-100 transition-colors outline-none focus:ring-2 focus:ring-flexoki-primary"
                >
                  <!-- Avatar -->
                  <div class="w-8 h-8 rounded-full bg-flexoki-primary text-white flex items-center justify-center text-sm font-medium">
                    {{ authStore.userInitials }}
                  </div>
                  <span class="hidden sm:block text-sm font-medium text-flexoki-700">
                    {{ authStore.userFullName }}
                  </span>
                </DropdownMenuTrigger>

                <DropdownMenuPortal>
                  <DropdownMenuContent
                    class="min-w-[220px] bg-white rounded-lg shadow-lg border border-flexoki-200 p-1 z-50 animate-in fade-in zoom-in-95 duration-200"
                    :side-offset="5"
                    align="end"
                  >
                    <div class="px-2 py-1.5 border-b border-flexoki-100 mb-1">
                      <p class="text-sm font-medium text-flexoki-900">{{ authStore.userFullName }}</p>
                      <p class="text-xs text-flexoki-500 truncate">{{ authStore.user?.email }}</p>
                    </div>

                    <DropdownMenuItem as-child>
                      <NuxtLink to="/account/profile" class="flex items-center px-2 py-1.5 text-sm text-flexoki-700 rounded hover:bg-flexoki-50 cursor-pointer w-full">
                        <User :size="16" class="mr-2" />
                        Profile
                      </NuxtLink>
                    </DropdownMenuItem>

                    <DropdownMenuItem as-child>
                      <NuxtLink to="/account/addresses" class="flex items-center px-2 py-1.5 text-sm text-flexoki-700 rounded hover:bg-flexoki-50 cursor-pointer w-full">
                        <Truck :size="16" class="mr-2" />
                        My Addresses
                      </NuxtLink>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem as-child>
                      <NuxtLink to="/orders" class="flex items-center px-2 py-1.5 text-sm text-flexoki-700 rounded hover:bg-flexoki-50 cursor-pointer w-full">
                         <ShoppingBag :size="16" class="mr-2" />
                         My Orders
                      </NuxtLink>
                    </DropdownMenuItem>

                     <DropdownMenuItem as-child>
                      <NuxtLink to="/subscriptions" class="flex items-center px-2 py-1.5 text-sm text-flexoki-700 rounded hover:bg-flexoki-50 cursor-pointer w-full">
                        <Sprout :size="16" class="mr-2" />
                        Subscriptions
                      </NuxtLink>
                    </DropdownMenuItem>
                    
                     <DropdownMenuItem as-child>
                      <NuxtLink to="/account/settings" class="flex items-center px-2 py-1.5 text-sm text-flexoki-700 rounded hover:bg-flexoki-50 cursor-pointer w-full">
                        <User :size="16" class="mr-2" />
                        Settings
                      </NuxtLink>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator class="h-px bg-flexoki-100 my-1" />

                    <DropdownMenuItem as-child @select="handleLogout">
                      <button type="button" class="outline-none flex items-center px-2 py-1.5 text-sm text-flexoki-warning rounded hover:bg-flexoki-warning/10 cursor-pointer w-full">
                        <ArrowRight :size="16" class="mr-2 rotate-180" />
                        Logout
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenuRoot>
            </template>

            <button class="bg-flexoki-primary hover:bg-flexoki-primary/90 text-white font-bold py-2 px-5 rounded-lg text-sm transition-all flex items-center gap-2">
              <ShoppingCart :size="16" />
              Cart
            </button>
            
            <!-- Mobile Menu Button -->
            <button 
              @click="toggleMobileMenu"
              class="md:hidden p-3 rounded-xl hover:bg-flexoki-100 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
              aria-label="Toggle mobile menu"
            >
              <Menu v-if="!isMobileMenuOpen" :size="24" />
              <X v-else :size="24" />
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu with Reka Dialog/Collapsible or just conditional -->
      <!-- Keeping simple conditional for now similar to original but could enhance with Slide over -->
      <div v-if="isMobileMenuOpen" class="md:hidden mt-4 pb-6 border-t border-flexoki pt-6 animate-in slide-in-from-top-2 duration-200">
        <nav class="flex flex-col gap-5 px-2">
          <NuxtLink to="/subscription" class="text-base font-semibold text-flexoki py-2 hover:text-flexoki-primary transition-colors">Subscription</NuxtLink>
          <NuxtLink to="/shop" class="text-base font-semibold text-flexoki py-2 hover:text-flexoki-primary transition-colors">Shop</NuxtLink>
          
          <template v-if="!authStore.isAuthenticated">
            <NuxtLink to="/login" class="text-base font-semibold text-flexoki py-2 hover:text-flexoki-primary transition-colors">Login</NuxtLink>
            <NuxtLink to="/register" class="text-base font-bold text-flexoki-primary py-2">Sign up</NuxtLink>
          </template>
          
          <template v-else>
            <div class="border-t border-flexoki-100 pt-6 mt-2 border-l-4 border-flexoki-primary/20 pl-4">
              <p class="text-xs font-black text-flexoki-500 uppercase tracking-widest mb-4">Account</p>
              <NuxtLink to="/account/profile" class="block text-base font-semibold text-flexoki py-2">Profile</NuxtLink>
              <NuxtLink to="/orders" class="block text-base font-semibold text-flexoki py-2">My Orders</NuxtLink>
              <button @click="handleLogout" class="block w-full text-left text-base font-bold text-flexoki-warning py-2 mt-2">Logout</button>
            </div>
          </template>
        </nav>
      </div>
    </div>
  </header>
</template>
