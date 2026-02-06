<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isMenuOpen = ref(false);
const searchQuery = ref('');

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/shop', query: { search: searchQuery.value } });
  }
};
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b border-flexoki bg-flexoki-paper/90 backdrop-blur-md">
    <!-- Delivery Banner -->
    <div class="bg-flexoki-primary/10 py-2 px-4 border-b border-flexoki-primary/20">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-sm">
        <span class="text-flexoki-primary font-semibold flex items-center gap-1">
          🚚 Delivery Policy:
        </span>
        <span class="text-flexoki">
          Same day delivery if you order before 10 AM, otherwise next day delivery.
        </span>
        <a href="#delivery-areas" class="text-flexoki-primary font-bold hover:underline flex items-center gap-1 text-xs">
          View areas →
        </a>
      </div>
    </div>

    <!-- Main Header -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div class="flex items-center justify-between gap-4">
        <!-- Logo & Nav -->
        <div class="flex items-center gap-8">
          <router-link to="/" class="flex items-center gap-3">
            <img 
              src="@/assets/images/yndu.webp" 
              alt="Yndu Logo" 
              class="h-8 w-auto"
            />
            <span class="text-xl font-bold text-flexoki hidden sm:block">Yndu Marketplace</span>
          </router-link>
          
          <nav class="hidden md:flex items-center gap-6">
            <router-link to="/subscription" class="text-sm font-medium text-flexoki hover:text-flexoki-primary transition-colors">
              Subscription
            </router-link>
            <router-link to="/shop" class="text-sm font-medium text-flexoki hover:text-flexoki-primary transition-colors">
              Shop
            </router-link>
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
                class="input-flexoki w-full pl-10"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-flexoki-muted">🔍</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <router-link to="/login" class="text-sm font-medium text-flexoki hidden sm:block hover:text-flexoki-primary">
              Login
            </router-link>
            <button class="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
              🛒 Cart
            </button>
            
            <!-- Mobile Menu Toggle -->
            <button 
              @click="isMenuOpen = !isMenuOpen"
              class="md:hidden p-2 text-flexoki"
            >
              {{ isMenuOpen ? '✕' : '☰' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="isMenuOpen" class="md:hidden mt-4 pb-4 border-t border-flexoki pt-4">
        <nav class="flex flex-col gap-4">
          <router-link to="/subscription" class="text-sm font-medium text-flexoki">Subscription</router-link>
          <router-link to="/shop" class="text-sm font-medium text-flexoki">Shop</router-link>
          <router-link to="/login" class="text-sm font-medium text-flexoki">Login</router-link>
        </nav>
      </div>
    </div>
  </header>
</template>
