<script setup lang="ts">
import { ref } from 'vue';
import { motion } from 'motion-v';
import { CheckCircle, Plus, Check } from 'lucide-vue-next';
import ProductCard from './ProductCard.vue';
import { useCartStore } from '../stores/cartStore';
const cart = useCartStore();

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  image: string;
  imageAlt: string;
  badge?: string;
  variant?: 'default' | 'popular';
  weight?: number;
  unit?: string;
}

interface Props {
  title: string;
  subtitle: string;
  products: Product[];
  viewAllLink: string;
  viewAllLabel?: string;
  layout?: 'grid' | 'highlighted';
}

withDefaults(defineProps<Props>(), {
  layout: 'grid',
  viewAllLabel: 'See all',
});

const showToast = ref(false);
const toastMessage = ref('');

const handleAddToCart = (product: Product) => {
  cart.addItem({
    productId: product.id,
    name: product.title,
    price: product.price,
    quantity: 1,
    weight: product.weight || 0.5,
    image: product.image,
    unit: product.unit || 'kg',
  });
  
  // Show toast notification
  toastMessage.value = `${product.title} added to cart!`;
  showToast.value = true;
  
  // Hide toast after 3 seconds
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

const handleQuickAdd = (product: Product) => {
  handleAddToCart(product);
};
</script>

<template>
  <section class="mb-16" :class="{ 'bg-[rgba(190,201,126,0.15)] backdrop-blur-lg border border-[rgba(190,201,126,0.3)] rounded-2xl p-6 sm:p-8 md:p-12 shadow-xl shadow-[rgba(190,201,126,0.1)]': layout === 'highlighted' }">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h3 class="text-2xl font-black text-flexoki">
          {{ title }}
        </h3>
        <p class="text-flexoki-muted">{{ subtitle }}</p>
      </div>
      <NuxtLink 
        :to="viewAllLink"
        class="text-flexoki-primary font-bold hover:underline"
      >
        {{ viewAllLabel }}
      </NuxtLink>
    </div>

    <!-- Grid Layout -->
    <div v-if="layout === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        v-bind="product"
        @add-to-cart="handleAddToCart(product)"
      />
    </div>

    <!-- Highlighted Layout (Mixed Boxes) -->
    <div v-else class="flex flex-col md:flex-row items-center gap-12">
      <div class="flex-1">
        <p class="text-flexoki-800/80 text-lg mb-8 max-w-md">
          Can't decide? Get a perfect balance of seasonal fruits and crisp vegetables in one curated box.
        </p>
        <div class="space-y-4">
          <component
            :is="motion.div"
            v-for="(product, idx) in products" 
            :key="product.id"
            class="flex items-center gap-4 p-4 rounded-xl bg-white/40 border border-[rgba(190,201,126,0.4)] hover:bg-white/60 transition-colors cursor-pointer shadow-sm"
            :initial="{ opacity: 0, x: -20 }"
            :while-in-view="{ opacity: 1, x: 0 }"
            :viewport="{ once: true }"
            :transition="{ delay: idx * 0.1 }"
            :while-hover="{ scale: 1.02 }"
            :while-press="{ scale: 0.98 }"
          >
            <CheckCircle :size="20" class="text-flexoki-primary" />
            <div class="flex-1">
              <p class="font-bold text-flexoki-900">{{ product.title }}</p>
              <p class="text-xs text-flexoki-700">KSh {{ product.price.toLocaleString() }} • {{ product.description }}</p>
            </div>
            <component
              :is="motion.button"
              @click="handleQuickAdd(product)"
              class="bg-flexoki-primary text-flexoki p-2 rounded-lg hover:shadow-lg transition-all"
              :while-hover="{ scale: 1.1 }"
              :while-press="{ scale: 0.9 }"
            >
              <Plus :size="18" class="text-flexoki-900" />
            </component>
          </component>
        </div>
      </div>
      <div class="flex-1 w-full max-w-md">
        <component
          :is="motion.img"
          :src="products[0]?.image || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800'"
          alt="Mixed produce box"
          class="rounded-xl shadow-2xl"
          :initial="{ opacity: 0, rotate: 0 }"
          :while-in-view="{ opacity: 1, rotate: 2 }"
          :viewport="{ once: true }"
          :while-hover="{ rotate: 0, scale: 1.02 }"
          :transition="{ duration: 0.5 }"
        />
      </div>
    </div>

    <!-- Toast Notification -->
    <Teleport to="body">
      <Transition
        enter-active-class="transform transition-all duration-300 ease-out"
        enter-from-class="translate-y-4 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transform transition-all duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-4 opacity-0"
      >
        <div 
          v-if="showToast"
          class="fixed bottom-6 right-6 z-50 bg-flexoki-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
        >
          <div class="bg-flexoki-primary rounded-full p-1">
            <Check :size="16" class="text-flexoki-900" />
          </div>
          <div>
            <p class="font-semibold">{{ toastMessage }}</p>
            <button 
              @click="cart.openCart()"
              class="text-sm text-flexoki-primary hover:underline"
            >
              View Cart →
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
