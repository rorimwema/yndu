<script setup lang="ts">
// Auth layout - minimal layout for login/register pages
</script>

<template>
  <div class="min-h-screen bg-canvas">
    <!-- Simple Header -->
    <header class="absolute top-0 left-0 right-0 p-4 sm:p-6">
      <div class="max-w-7xl mx-auto">
        <NuxtLink to="/" class="inline-flex items-center gap-3 text-foundation hover:text-primary-deep transition-colors duration-200 ease-in-out">
          <div class="w-10 h-10 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 p-1.5 shadow-sm">
            <img 
              src="/yndu.svg" 
              alt="Yndu" 
              class="w-auto h-8 mx-auto"
              width="100"
              height="32"
            />
          </div>
          <span class="font-bold text-xl">Yndu</span>
        </NuxtLink>
      </div>
    </header>

    <!-- Page Content -->
    <slot />
  </div>
</template>
