<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { TabsRoot, TabsList, TabsTrigger, TabsContent, RadioGroupRoot, RadioGroupItem } from 'reka-ui';
import { motion } from 'motion-v';
import {
  Search, Leaf, Apple, Sprout, Wheat, Plus, Minus, Check,
  Truck, Clock, Package, Users, ShoppingCart,
  Sparkles, X, ChevronDown, ChevronUp, ArrowRight,
} from 'lucide-vue-next';
import { useCartStore } from '~/stores/cart-store';
import { BOX_SIZE_CONFIG, type SubscriptionBoxSize } from '~/types/subscription';
import type { BoxCartItem, BoxContentItem } from '~/types/cart';

// Page meta
useSeoMeta({
  title: 'Build Your Box | Yndu',
  description: 'Build a custom produce box from our farm-fresh selection. Choose your size and fill it with your favorites.',
});

const cart = useCartStore();

// Box builder state
const selectedBoxSize = ref<SubscriptionBoxSize>('MEDIUM');
const boxContents = ref<BoxContentItem[]>([]);
const searchQuery = ref('');
const showContents = ref(false);
const justAddedId = ref<string | null>(null);
const boxAddedToCart = ref(false);

// Box configs
const boxOptions = computed(() => [
  { value: 'SMALL' as SubscriptionBoxSize, ...BOX_SIZE_CONFIG.SMALL, icon: Leaf },
  { value: 'MEDIUM' as SubscriptionBoxSize, ...BOX_SIZE_CONFIG.MEDIUM, icon: Package, popular: true },
  { value: 'LARGE' as SubscriptionBoxSize, ...BOX_SIZE_CONFIG.LARGE, icon: Users },
]);

const currentBox = computed(() => BOX_SIZE_CONFIG[selectedBoxSize.value]);
const maxSlots = computed(() => currentBox.value.slots);

// Slot calculations
const usedSlots = computed(() =>
  boxContents.value.reduce((total, item) => total + item.slots * item.quantity, 0)
);
const slotsRemaining = computed(() => maxSlots.value - usedSlots.value);
const slotPercentage = computed(() => Math.round((usedSlots.value / maxSlots.value) * 100));
const isFull = computed(() => slotsRemaining.value <= 0);

// Price calculation
const boxPrice = computed(() => currentBox.value.basePrice);
const hasItems = computed(() => boxContents.value.length > 0);

// Categories
const categories = [
  { id: 'all', label: 'All', icon: Leaf },
  { id: 'vegetables', label: 'Vegetables', icon: Sprout },
  { id: 'fruits', label: 'Fruits', icon: Apple },
  { id: 'herbs', label: 'Herbs', icon: Leaf },
  { id: 'grains', label: 'Grains', icon: Wheat },
];

// Fetch produce catalog from backend
const { data: rawProduce } = await useAsyncData('produce', () => $fetch<{items: any[]}>('/api/inventory'));

const produce = computed(() => {
  if (!rawProduce.value?.items) return [];
  return rawProduce.value.items.map(p => {
    // Determine slots based on unit/weight roughly
    const slots = p.availableQuantity.unit === 'kg' ? 2 : 1;
    // Map category to frontend categories ('vegetables', 'fruits', 'herbs', 'grains')
    const cat = (p.category || 'vegetables').toLowerCase().replace('_', ' ');
    
    return {
      id: p.id,
      name: p.name,
      nameEn: p.name, // The backend doesn't have nameEn yet, using name
      category: ['vegetables', 'fruits', 'herbs', 'grains'].includes(cat) ? cat : 'vegetables',
      price: p.unitPrice?.amount || 0,
      unit: p.availableQuantity?.unit || 'Item',
      slots: slots,
      weight: 1.0,
      image: p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop',
      farmLocation: 'Kibwezi Farm',
    };
  });
});

// Filtered produce
const activeCategory = ref('all');

const filteredProduce = computed(() => {
  let result = produce.value;
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) || p.nameEn.toLowerCase().includes(query)
    );
  }
  if (activeCategory.value !== 'all') {
    result = result.filter(p => p.category === activeCategory.value);
  }
  return result;
});

// Box item helpers
const getItemQuantity = (produceId: string) => {
  const item = boxContents.value.find(i => i.produceId === produceId);
  return item?.quantity || 0;
};

const canAddItem = (slots: number) => {
  return usedSlots.value + slots <= maxSlots.value;
};

const addItem = (item: typeof produce[0]) => {
  if (!canAddItem(item.slots)) return;

  const existing = boxContents.value.find(i => i.produceId === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    boxContents.value.push({
      produceId: item.id,
      name: item.name,
      quantity: 1,
      weight: item.weight,
      slots: item.slots,
      image: item.image,
    });
  }

  justAddedId.value = item.id;
  setTimeout(() => { justAddedId.value = null; }, 800);
};

const removeItem = (produceId: string) => {
  const index = boxContents.value.findIndex(i => i.produceId === produceId);
  if (index > -1) {
    if (boxContents.value[index].quantity > 1) {
      boxContents.value[index].quantity -= 1;
    } else {
      boxContents.value.splice(index, 1);
    }
  }
};

const clearBox = () => {
  boxContents.value = [];
};

// Change box size — clear if downsizing would overflow
const changeBoxSize = (newSize: SubscriptionBoxSize) => {
  const newMax = BOX_SIZE_CONFIG[newSize].slots;
  if (usedSlots.value > newMax) {
    boxContents.value = [];
  }
  selectedBoxSize.value = newSize;
};

// Add complete box to cart
const addBoxToCart = () => {
  if (!hasItems.value) return;

  const boxItem: BoxCartItem = {
    id: `box_${selectedBoxSize.value}_${Date.now()}`,
    productId: `box_${selectedBoxSize.value}`,
    type: 'box',
    size: selectedBoxSize.value,
    name: `${currentBox.value.name}`,
    price: boxPrice.value,
    quantity: 1,
    weight: boxContents.value.reduce((w, c) => w + c.weight * c.quantity, 0),
    image: boxContents.value[0]?.image || '',
    unit: 'box',
    contents: [...boxContents.value],
  };

  cart.addBox(boxItem);
  boxAddedToCart.value = true;
  setTimeout(() => {
    boxAddedToCart.value = false;
    boxContents.value = [];
  }, 2000);
};

// Helpers
const formatPrice = (price: number) => `KSh ${price.toLocaleString()}`;
</script>

<template>
  <div class="min-h-dvh bg-[var(--bg-canvas)] pb-28">

    <!-- Header -->
    <div class="bg-white border-b border-neutral-100">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <motion.div
          :initial="{ opacity: 0, y: 12 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.4 }"
        >
          <div class="flex items-center gap-2 text-xs text-neutral-400 mb-2">
            <Leaf :size="14" class="text-primary-deep" />
            Fresh from Kibwezi Farm
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-foundation tracking-tight text-balance">Build Your Box</h1>
          <p class="text-sm text-neutral-400 mt-1">Pick a size, fill it with your favorites</p>
        </motion.div>

        <!-- Delivery badges -->
        <div class="flex flex-wrap gap-3 mt-4 text-xs text-neutral-500">
          <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-50 border border-neutral-100">
            <Truck :size="12" class="text-primary-deep" /> Free over KSh 2,000
          </span>
          <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-50 border border-neutral-100">
            <Clock :size="12" class="text-primary-deep" /> Same-day Nairobi
          </span>
        </div>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      <!-- STEP 1: Box Size Selector -->
      <motion.section
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.35, delay: 0.1 }"
      >
        <h2 class="text-sm font-semibold text-neutral-600 mb-3 uppercase tracking-wider">
          1. Choose your box
        </h2>
        <RadioGroupRoot :model-value="selectedBoxSize" @update:model-value="changeBoxSize" class="grid grid-cols-3 gap-3">
          <RadioGroupItem
            v-for="box in boxOptions"
            :key="box.value"
            :value="box.value"
            class="group relative p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-deep/40 text-center
              border-neutral-100 bg-white
              hover:border-primary-deep/30
              data-[state=checked]:border-primary-deep data-[state=checked]:bg-primary-deep/5 data-[state=checked]:shadow-sm"
          >
            <!-- Popular -->
            <div v-if="box.popular" class="absolute -top-2 left-1/2 -translate-x-1/2">
              <span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary-deep text-white text-[9px] font-bold uppercase">
                <Sparkles class="w-2.5 h-2.5" /> Popular
              </span>
            </div>

            <component :is="box.icon" :size="20" class="mx-auto mb-1 text-neutral-400 group-data-[state=checked]:text-primary-deep transition-colors" />
            <p class="font-bold text-sm text-foundation">{{ box.name }}</p>
            <p class="text-[11px] text-neutral-400">{{ box.slots }} slots · {{ box.weightEstimate }}</p>
            <p class="text-base font-bold text-primary-deep mt-1">{{ formatPrice(box.basePrice) }}</p>
          </RadioGroupItem>
        </RadioGroupRoot>
      </motion.section>

      <!-- Slot Meter -->
      <motion.section
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.35, delay: 0.2 }"
        class="bg-white rounded-xl border border-neutral-100 p-4"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <Package :size="16" class="text-primary-deep" />
            <span class="text-sm font-semibold text-foundation">Your Box</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-mono">
              <span class="font-bold" :class="isFull ? 'text-red-500' : 'text-primary-deep'">{{ usedSlots }}</span>
              <span class="text-neutral-400"> / {{ maxSlots }} slots</span>
            </span>
            <button
              v-if="hasItems"
              @click="clearBox"
              class="text-xs text-neutral-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <X :size="12" /> Clear
            </button>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="h-2.5 bg-neutral-50 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500 ease-out"
            :class="[
              slotPercentage >= 100 ? 'bg-red-400' :
              slotPercentage >= 80 ? 'bg-amber-400' :
              'bg-primary-deep'
            ]"
            :style="{ width: `${Math.min(slotPercentage, 100)}%` }"
          />
        </div>

        <p v-if="isFull" class="text-xs text-red-500 mt-1.5 font-medium">Box is full! Remove items or upgrade to a larger box.</p>
        <p v-else-if="!hasItems" class="text-xs text-neutral-400 mt-1.5">Add produce from the catalog below</p>
        <p v-else class="text-xs text-neutral-400 mt-1.5">{{ slotsRemaining }} slots remaining</p>

        <!-- Box contents (collapsible) -->
        <div v-if="hasItems" class="mt-3">
          <button
            @click="showContents = !showContents"
            class="flex items-center gap-1.5 text-xs font-medium text-primary-deep hover:text-primary-deep/80 transition-colors"
          >
            <component :is="showContents ? ChevronUp : ChevronDown" :size="14" />
            {{ boxContents.length }} item{{ boxContents.length > 1 ? 's' : '' }} in box
          </button>

          <div v-if="showContents" class="mt-2 space-y-1.5">
            <div
              v-for="item in boxContents"
              :key="item.produceId"
              class="flex items-center gap-3 p-2 rounded-lg bg-neutral-50"
            >
              <NuxtImg :src="item.image" :alt="item.name" class="w-8 h-8 rounded-md object-cover" format="webp" sizes="32px" loading="lazy" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-foundation truncate">{{ item.name }}</p>
                <p class="text-[10px] text-neutral-400">{{ item.slots }} slot{{ item.slots > 1 ? 's' : '' }} each</p>
              </div>
              <div class="flex items-center gap-1.5">
                <button
                  @click="removeItem(item.produceId)"
                  class="w-6 h-6 rounded-md bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-red-300 hover:text-red-500 transition-colors"
                >
                  <Minus :size="12" />
                </button>
                <span class="text-xs font-bold text-foundation w-5 text-center">{{ item.quantity }}</span>
                <button
                  @click="addItem(produce.find(p => p.id === item.produceId)!)"
                  :disabled="!canAddItem(item.slots)"
                  class="w-6 h-6 rounded-md bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-primary-deep hover:text-primary-deep transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus :size="12" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <!-- STEP 2: Produce Catalog -->
      <motion.section
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.35, delay: 0.3 }"
      >
        <h2 class="text-sm font-semibold text-neutral-600 mb-3 uppercase tracking-wider">
          2. Fill your box
        </h2>

        <!-- Search -->
        <div class="relative mb-4">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search produce..."
            class="w-full px-4 py-2.5 pl-10 bg-white border border-neutral-100 rounded-xl text-sm text-foundation placeholder-neutral-400/60 focus:outline-none focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep/40"
          />
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400/50" :size="16" />
        </div>

        <!-- Category Tabs -->
        <TabsRoot v-model="activeCategory" class="space-y-4">
          <TabsList class="flex gap-1.5 overflow-x-auto pb-1">
            <TabsTrigger
              v-for="cat in categories"
              :key="cat.id"
              :value="cat.id"
              class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all outline-none
                text-neutral-400 hover:text-neutral-600 hover:bg-white
                data-[state=active]:bg-primary-deep data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <component :is="cat.icon" :size="14" />
              {{ cat.label }}
            </TabsTrigger>
          </TabsList>

          <!-- Produce Grid (content for all tabs) -->
          <TabsContent v-for="cat in categories" :key="cat.id" :value="cat.id" class="outline-none">
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <motion.div
                v-for="(item, index) in filteredProduce"
                :key="item.id"
                :initial="{ opacity: 0, scale: 0.95 }"
                :animate="{ opacity: 1, scale: 1 }"
                :transition="{ duration: 0.2, delay: (index % 8) * 0.04 }"
                class="bg-white rounded-xl border border-neutral-100 overflow-hidden transition-shadow hover:shadow-md"
                :class="{ 'ring-2 ring-primary-deep/40': getItemQuantity(item.id) > 0 }"
              >
                <!-- Image -->
                <div class="relative aspect-[4/3] overflow-hidden">
                  <NuxtImg
                    :src="item.image"
                    :alt="item.name"
                    class="w-full h-full object-cover"
                    loading="lazy"
                    format="webp"
                    sizes="sm:50vw md:33vw lg:25vw"
                  />
                  <!-- Slot cost badge -->
                  <div class="absolute top-1.5 left-1.5">
                    <span class="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-black/60 text-white backdrop-blur-sm">
                      {{ item.slots }} slot{{ item.slots > 1 ? 's' : '' }}
                    </span>
                  </div>
                  <!-- Quantity badge -->
                  <div v-if="getItemQuantity(item.id) > 0" class="absolute top-1.5 right-1.5">
                    <span class="w-6 h-6 rounded-full bg-primary-deep text-white text-xs font-bold flex items-center justify-center shadow-sm">
                      {{ getItemQuantity(item.id) }}
                    </span>
                  </div>
                </div>

                <!-- Info -->
                <div class="p-2.5">
                  <h3 class="font-semibold text-sm text-foundation truncate">{{ item.name }}</h3>
                  <p class="text-[11px] text-neutral-400 truncate">{{ item.nameEn }}</p>

                  <div class="flex items-center justify-between mt-2">
                    <div>
                      <span class="font-bold text-sm text-primary-deep">{{ formatPrice(item.price) }}</span>
                      <span class="text-[10px] text-neutral-400 ml-0.5">/ {{ item.unit }}</span>
                    </div>

                    <!-- Add/Remove Controls -->
                    <div v-if="getItemQuantity(item.id) > 0" class="flex items-center gap-1">
                      <button
                        @click="removeItem(item.id)"
                        class="w-7 h-7 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Minus :size="14" />
                      </button>
                      <span class="text-sm font-bold text-foundation w-5 text-center">{{ getItemQuantity(item.id) }}</span>
                      <button
                        @click="addItem(item)"
                        :disabled="!canAddItem(item.slots)"
                        class="w-7 h-7 rounded-lg bg-primary-deep text-white flex items-center justify-center hover:bg-primary-deep/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Plus :size="14" />
                      </button>
                    </div>
                    <button
                      v-else
                      @click="addItem(item)"
                      :disabled="!canAddItem(item.slots)"
                      class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
                        bg-primary-deep text-white hover:bg-primary-deep/90
                        disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus :size="14" />
                      Add
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            <!-- Empty state -->
            <div v-if="filteredProduce.length === 0" class="text-center py-12">
              <Search :size="32" class="mx-auto text-neutral-400/30 mb-3" />
              <p class="text-sm font-medium text-foundation">No produce found</p>
              <p class="text-xs text-neutral-400">Try a different search or category</p>
            </div>
          </TabsContent>
        </TabsRoot>
      </motion.section>
    </div>

    <!-- Floating Bottom Bar -->
    <div class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" style="padding-bottom: env(safe-area-inset-bottom, 0px)">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div class="flex items-center justify-between gap-4">
          <!-- Box info -->
          <div class="flex items-center gap-3">
            <div class="relative">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center"
                :class="hasItems ? 'bg-primary-deep/10' : 'bg-neutral-50'"
              >
                <Package :size="20" :class="hasItems ? 'text-primary-deep' : 'text-neutral-400'" />
              </div>
              <span
                v-if="hasItems"
                class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-deep text-white text-[10px] font-bold flex items-center justify-center"
              >
                {{ boxContents.length }}
              </span>
            </div>
            <div>
              <p class="text-sm font-bold text-foundation leading-none">
                {{ currentBox.name }}
              </p>
              <p class="text-xs text-neutral-400 mt-0.5">
                {{ usedSlots }}/{{ maxSlots }} slots · {{ formatPrice(boxPrice) }}
              </p>
            </div>
          </div>

          <!-- CTA -->
          <button
            @click="addBoxToCart"
            :disabled="!hasItems || boxAddedToCart"
            class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2
              bg-primary-deep text-white
              hover:bg-primary-deep/90 hover:shadow-lg hover:shadow-primary-deep/25
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            <template v-if="boxAddedToCart">
              <Check :size="16" />
              Added!
            </template>
            <template v-else>
              <ShoppingCart :size="16" />
              Add Box to Cart
            </template>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
