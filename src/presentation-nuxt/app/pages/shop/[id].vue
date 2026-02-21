<script setup lang="ts">
import { ref, computed } from 'vue';
import { motion } from 'motion-v';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Leaf,
  Plus,
  Minus,
  Check,
  Star,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-vue-next';
import { useCartStore } from '~/stores/cart-store';

const route = useRoute();
const cart = useCartStore();

// Fetch product dynamically
const { data: rawProduct } = await useAsyncData(`product-${route.params.id}`, () => 
  $fetch<any>(`/api/inventory/${route.params.id}`)
);

const product = computed(() => {
  if (!rawProduct.value) return null;
  const p = rawProduct.value;
  const cat = (p.category || 'vegetables').toLowerCase().replace('_', ' ');

  return {
    id: p.id,
    name: p.name,
    nameEn: p.name, // The backend doesn't have nameEn yet
    category: ['vegetables', 'fruits', 'herbs', 'grains'].includes(cat) ? cat : 'vegetables',
    price: p.unitPrice?.amount || 0,
    unit: p.availableQuantity?.unit || 'Item',
    image: p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=800&fit=crop',
    images: p.imageUrl ? [p.imageUrl] : ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=800&fit=crop'],
    farmLocation: 'Kibwezi Farm',
    farmDescription: 'Our flagship farm in Makueni County.',
    harvestInfo: 'Harvested this morning',
    description: p.description || 'Fresh produce from Yndu farms.',
    longDescription: p.description || 'Fresh produce from Yndu farms.',
    nutrition: [],
    cookingTips: [],
    inSeason: true,
    rating: 4.8,
    reviews: 124,
    relatedIds: [], 
  };
});

// Related products
const { data: rawRelated } = await useAsyncData(`related-${route.params.id}`, () => 
  // We'll just fetch a few items for related products
  $fetch<{items: any[]}>('/api/inventory?limit=5')
);

const relatedProducts = computed(() => {
  if (!rawRelated.value?.items) return [];
  return rawRelated.value.items
    .filter(p => p.id !== route.params.id)
    .slice(0, 4)
    .map(p => ({
      id: p.id,
      name: p.name,
      nameEn: p.name,
      price: p.unitPrice?.amount || 0,
      unit: p.availableQuantity?.unit || 'Item',
      image: p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=800&fit=crop'
    }));
});

// Quantity
const quantity = ref(1);

// Just added animation
const justAdded = ref(false);

// Add to cart
const addToCart = () => {
  if (!product.value) return;
  cart.addItem({
    productId: product.value.id,
    name: product.value.name,
    price: product.value.price,
    quantity: quantity.value,
    weight: quantity.value,
    image: product.value.image,
    unit: product.value.unit,
  });
  justAdded.value = true;
  setTimeout(() => justAdded.value = false, 2000);
};

// SEO
useSeoMeta({
  title: () => product.value ? `${product.value.name} (${product.value.nameEn}) | Yndu Farm Market` : 'Product | Yndu',
  description: () => product.value?.description || '',
});

// Format price
const formatPrice = (price: number) => `KSh ${price.toLocaleString()}`;
</script>

<template>
  <div class="min-h-dvh" style="background: var(--bg-canvas);">
    <!-- Back Navigation -->
    <div class="bg-white border-b sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <button 
          class="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          @click="navigateTo('/shop')"
        >
          <ArrowLeft class="size-4" />
          Back to Market
        </button>
      </div>
    </div>

    <!-- Product Not Found -->
    <div v-if="!product" class="max-w-7xl mx-auto px-4 py-16 text-center">
      <h1 class="text-2xl font-bold mb-4">Product Not Found</h1>
      <p class="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
      <button 
        class="px-6 py-3 rounded-xl font-medium text-white"
        style="background: var(--yndu-green);"
        @click="navigateTo('/shop')"
      >
        Browse Market
      </button>
    </div>

    <!-- Product Content -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- Image Gallery -->
        <motion.div
          :initial="{ opacity: 0, x: -20 }"
          :animate="{ opacity: 1, x: 0 }"
          :transition="{ duration: 0.5 }"
        >
          <div class="aspect-square rounded-2xl overflow-hidden bg-gray-100">
            <NuxtImg 
              :src="product.image" 
              :alt="product.name"
              class="w-full h-full object-cover"
              loading="eager"
              format="webp"
              sizes="sm:100vw md:50vw lg:600px"
            />
          </div>
          
          <!-- Thumbnail gallery (if multiple images) -->
          <div v-if="product.images && product.images.length > 1" class="flex gap-3 mt-4">
            <div
              v-for="(img, idx) in product.images"
              :key="idx"
              class="w-20 h-20 rounded-lg overflow-hidden cursor-pointer ring-2 ring-transparent hover:ring-[var(--yndu-green)] transition-all"
            >
              <NuxtImg :src="img" :alt="product.name" class="w-full h-full object-cover" format="webp" sizes="100px" loading="lazy" />
            </div>
          </div>
        </motion.div>

        <!-- Product Info -->
        <motion.div
          :initial="{ opacity: 0, x: 20 }"
          :animate="{ opacity: 1, x: 0 }"
          :transition="{ duration: 0.5, delay: 0.1 }"
          class="space-y-6"
        >
          <!-- Header -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span v-if="product.inSeason" class="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                IN SEASON
              </span>
              <span v-if="product.featured" class="px-2 py-1 text-xs font-bold rounded-full" style="background: rgba(244, 153, 26, 0.15); color: var(--yndu-gold);">
                FEATURED
              </span>
            </div>
            
            <h1 class="text-3xl sm:text-4xl font-bold mb-1">{{ product.name }}</h1>
            <p class="text-lg text-muted-foreground">{{ product.nameEn }}</p>
            
            <!-- Rating -->
            <div class="flex items-center gap-3 mt-3">
              <div class="flex items-center gap-1">
                <Star class="size-5 fill-yellow-400 text-yellow-400" />
                <span class="font-semibold">{{ product.rating }}</span>
              </div>
              <span class="text-muted-foreground">({{ product.reviews }} reviews)</span>
            </div>
          </div>

          <!-- Farm Info -->
          <div class="flex items-start gap-3 p-4 rounded-xl" style="background: rgba(90, 120, 99, 0.05);">
            <MapPin class="size-5 mt-0.5" style="color: var(--yndu-green);" />
            <div>
              <p class="font-medium">{{ product.farmLocation }}</p>
              <p class="text-sm text-muted-foreground">{{ product.farmDescription }}</p>
              <div class="flex items-center gap-1 mt-2 text-sm" style="color: var(--yndu-green);">
                <Clock class="size-4" />
                {{ product.harvestInfo }}
              </div>
            </div>
          </div>

          <!-- Price & Add to Cart -->
          <div class="border-y py-6" style="border-color: rgba(0,0,0,0.1);">
            <div class="flex items-baseline gap-2 mb-4">
              <span class="text-3xl font-bold" style="color: var(--yndu-green);">{{ formatPrice(product.price) }}</span>
              <span class="text-lg text-muted-foreground">/ {{ product.unit }}</span>
            </div>
            
            <div class="flex items-center gap-4">
              <!-- Quantity -->
              <div class="flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-100">
                <button 
                  class="p-1 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  :disabled="quantity <= 1"
                  @click="quantity--"
                >
                  <Minus class="size-5" />
                </button>
                <span class="w-8 text-center font-semibold">{{ quantity }}</span>
                <button 
                  class="p-1 rounded-lg hover:bg-gray-200 transition-colors"
                  @click="quantity++"
                >
                  <Plus class="size-5" />
                </button>
              </div>
              
              <!-- Add Button -->
              <button
                class="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white transition-all"
                :style="{ background: justAdded ? '#27ae60' : 'var(--yndu-green)' }"
                @click="addToCart"
              >
                <component :is="justAdded ? Check : Plus" class="size-5" />
                {{ justAdded ? 'Added to Cart!' : 'Add to Cart' }}
              </button>
              
              <!-- Wishlist -->
              <button class="p-3 rounded-xl border hover:bg-gray-50 transition-colors" style="border-color: rgba(0,0,0,0.1);">
                <Heart class="size-5" />
              </button>
            </div>
          </div>

          <!-- Description -->
          <div>
            <h3 class="font-semibold mb-2">About this product</h3>
            <p class="text-muted-foreground leading-relaxed">{{ product.longDescription || product.description }}</p>
          </div>

          <!-- Guarantees -->
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <Truck class="size-5" style="color: var(--yndu-green);" />
              <span class="text-sm font-medium">Same-day Delivery</span>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <ShieldCheck class="size-5" style="color: var(--yndu-green);" />
              <span class="text-sm font-medium">Freshness Guaranteed</span>
            </div>
          </div>
        </motion.div>
      </div>

      <!-- Additional Info Sections -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <!-- Nutrition -->
        <motion.div
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.3 }"
          class="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 class="font-semibold text-lg mb-4 flex items-center gap-2">
            <Leaf class="size-5" style="color: var(--yndu-green);" />
            Nutrition Highlights
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="nutrient in product.nutrition"
              :key="nutrient.label"
              class="p-3 rounded-xl"
              style="background: rgba(90, 120, 99, 0.05);"
            >
              <p class="font-medium" style="color: var(--yndu-green);">{{ nutrient.value }}</p>
              <p class="text-sm text-muted-foreground">{{ nutrient.label }}</p>
            </div>
          </div>
        </motion.div>

        <!-- Cooking Tips -->
        <motion.div
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.4 }"
          class="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 class="font-semibold text-lg mb-4 flex items-center gap-2">
            <Info class="size-5" style="color: var(--yndu-gold);" />
            How to Use
          </h3>
          <ul class="space-y-3">
            <li
              v-for="(tip, idx) in product.cookingTips"
              :key="idx"
              class="flex items-start gap-3 text-muted-foreground"
            >
              <ChevronRight class="size-4 mt-1 flex-shrink-0" style="color: var(--yndu-green);" />
              {{ tip }}
            </li>
          </ul>
        </motion.div>
      </div>

      <!-- Related Products -->
      <section v-if="relatedProducts.length > 0" class="mt-16">
        <h2 class="text-xl font-bold mb-6">You might also like</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            v-for="item in relatedProducts"
            :key="item.id"
            class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            @click="navigateTo(`/shop/${item.id}`)"
          >
            <div class="aspect-square overflow-hidden">
              <NuxtImg 
                :src="item.image" 
                :alt="item.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                format="webp"
                sizes="sm:50vw md:25vw lg:300px"
              />
            </div>
            <div class="p-3">
              <h3 class="font-semibold text-sm">{{ item.name }}</h3>
              <p class="text-xs text-muted-foreground">{{ item.nameEn }}</p>
              <div class="flex items-center justify-between mt-2">
                <span class="font-bold" style="color: var(--yndu-green);">{{ formatPrice(item.price) }}</span>
                <span class="text-xs text-muted-foreground">/ {{ item.unit }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
