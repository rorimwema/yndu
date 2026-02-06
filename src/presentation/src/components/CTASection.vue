<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToCustom = () => router.push('/custom-box');
</script>

<template>
  <section class="text-center bg-flexoki-primary/10 border border-flexoki-primary/20 rounded-2xl py-12 px-6 mb-16">
    <div class="text-5xl mb-4">⚙️</div>
    <h3 class="text-3xl font-black mb-4 text-flexoki">Not seeing your perfect mix?</h3>
    <p class="text-lg text-flexoki-muted max-w-xl mx-auto mb-8">
      Customize every single item. Select exactly what you need and we'll pack it fresh from the Kibwezi fields for you.
    </p>
    <button 
      @click="navigateToCustom"
      class="bg-flexoki text-white font-bold py-4 px-10 rounded-xl text-lg hover:scale-105 transition-transform flex items-center gap-3 mx-auto"
    >
      Create Your Own Box
      <span>→</span>
    </button>
  </section>
</template>
