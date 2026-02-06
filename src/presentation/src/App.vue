<script setup lang="ts">
// Main App Component with Flexoki Theme
import { useColorMode } from '@vueuse/core';

const colorMode = useColorMode({
  attribute: 'class',
  modes: {
    light: 'light',
    dark: 'dark',
  },
});
</script>

<template>
  <div class="min-h-screen bg-flexoki">
    <header class="bg-flexoki-paper border-b border-flexoki sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-flexoki-primary">Yndu</h1>
            <span class="ml-2 text-sm text-flexoki-muted">Fresh Produce Delivery</span>
          </div>
          <nav class="flex items-center space-x-4">
            <router-link to="/" class="text-flexoki hover:text-flexoki-primary transition-colors">
              Home
            </router-link>
            <router-link to="/orders" class="text-flexoki hover:text-flexoki-primary transition-colors">
              Orders
            </router-link>
            <button 
              @click="colorMode = colorMode === 'dark' ? 'light' : 'dark'"
              class="p-2 rounded-lg bg-flexoki-100 hover:bg-flexoki-200 transition-colors"
              :title="colorMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              {{ colorMode === 'dark' ? '☀️' : '🌙' }}
            </button>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>

    <footer class="bg-flexoki-paper border-t border-flexoki mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p class="text-center text-flexoki-muted text-sm">
          © 2025 Yndu. Fresh produce delivered with care.
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
/* Ensure full height layout */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
