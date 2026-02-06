<script setup lang="ts">
import { useColorMode } from '@vueuse/core';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';

const colorMode = useColorMode({
  attribute: 'class',
  modes: {
    light: 'light',
    dark: 'dark',
  },
});
</script>

<template>
  <div class="min-h-screen bg-flexoki flex flex-col">
    <AppHeader />
    
    <main class="flex-1">
      <router-view />
    </main>
    
    <AppFooter />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
