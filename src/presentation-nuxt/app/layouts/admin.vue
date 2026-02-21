<script setup lang="ts">
// Admin layout - independent with no header/footer
// Uses drawer-based navigation
definePageMeta({
  middleware: 'admin-auth',
});
</script>

<template>
  <div class="min-h-screen bg-background font-sans text-foreground">
    <slot />
  </div>
</template>
