<script setup lang="ts">
import { onMounted } from 'vue';
import { useCartStore } from './stores/cart-store';

const cartStore = useCartStore();

onMounted(() => {
  cartStore.loadFromStorage();
});
</script>

<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <DeliveryPolicyDialog />
  </NuxtLayout>
</template>
