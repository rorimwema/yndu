<script setup lang="ts">
import { useRouter } from 'vue-router';
import ProductCard from './ProductCard.vue';

const router = useRouter();

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  image: string;
  imageAlt: string;
  badge?: string;
  variant?: 'default' | 'popular';
}

interface Props {
  title: string;
  subtitle: string;
  products: Product[];
  viewAllLink: string;
  layout?: 'grid' | 'highlighted';
}

withDefaults(defineProps<Props>(), {
  layout: 'grid',
});

const handleAddToCart = (productId: string) => {
  console.log('Added to cart:', productId);
  // TODO: Implement cart store
};
</script>

<template>
  <section class="mb-16" :class="{ 'bg-flexoki-900 rounded-2xl p-8 md:p-12 text-white': layout === 'highlighted' }">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h3 class="text-2xl font-black" :class="layout === 'highlighted' ? 'text-white' : 'text-flexoki'">
          {{ title }}
        </h3>
        <p class="text-flexoki-muted" :class="layout === 'highlighted' ? 'text-gray-400' : ''">{{ subtitle }}</p>
      </div>
      <button 
        @click="router.push(viewAllLink)"
        class="text-flexoki-primary font-bold hover:underline"
      >
        See all →
      </button>
    </div>

    <!-- Grid Layout -->
    <div v-if="layout === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        v-bind="product"
        @add-to-cart="handleAddToCart(product.id)"
      />
    </div>

    <!-- Highlighted Layout (Mixed Boxes) -->
    <div v-else class="flex flex-col md:flex-row items-center gap-12">
      <div class="flex-1">
        <p class="text-gray-400 text-lg mb-8 max-w-md">
          Can't decide? Get a perfect balance of seasonal fruits and crisp vegetables in one curated box.
        </p>
        <div class="space-y-4">
          <div 
            v-for="product in products" 
            :key="product.id"
            class="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <span class="text-flexoki-primary text-xl">✓</span>
            <div class="flex-1">
              <p class="font-bold text-white">{{ product.title }}</p>
              <p class="text-xs text-gray-400">KSh {{ product.price.toLocaleString() }} • {{ product.description }}</p>
            </div>
            <button class="bg-flexoki-primary text-flexoki p-2 rounded-lg hover:shadow-lg transition-all">
              <span>+</span>
            </button>
          </div>
        </div>
      </div>
      <div class="flex-1 w-full max-w-md">
        <img 
          :src="products[0]?.image || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800'"
          alt="Mixed produce box"
          class="rounded-xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500"
        />
      </div>
    </div>
  </section>
</template>
