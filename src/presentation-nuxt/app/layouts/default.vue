<script setup lang="ts">
// Components are auto-imported in Nuxt
</script>

<template>
  <div class="min-h-screen bg-flexoki font-sans text-flexoki-900 selection:bg-flexoki-primary/30">
    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
