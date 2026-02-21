<script setup lang="ts">
// Components are auto-imported in Nuxt
</script>

<template>
  <div class="min-h-screen bg-canvas font-sans text-foundation selection:bg-secondary-sage/25">
    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
