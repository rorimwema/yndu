<script setup lang="ts">
import { ref } from 'vue';
import { motion } from 'motion-v';
import { ShoppingBasket, Calendar, Smile } from 'lucide-vue-next';

// SEO Meta (nuxt-core skill: useSeoMeta is recommended)
useSeoMeta({
  title: 'Farm Fresh Produce Boxes | Yndu',
  description: 'Fresh fruit, vegetable, and mixed boxes delivered from Kibwezi Farm to your doorstep. Subscribe for weekly freshness or order one-time.',
  ogTitle: 'Farm Fresh Produce Boxes | Yndu',
  ogDescription: 'Fresh fruit, vegetable, and mixed boxes delivered from Kibwezi Farm to your doorstep.',
  ogImage: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=1200',
});

// Fetch products dynamically
const { data: rawProducts } = await useAsyncData('landing-products', () => 
  $fetch<{items: any[]}>('/api/inventory?limit=20')
);

// Map backend items to frontend product shape
const mapProduct = (p: any, isPopular = false) => ({
  id: p.id,
  title: p.name,
  price: p.unitPrice?.amount || 0,
  description: p.description || `${p.availableQuantity?.value} ${p.availableQuantity?.unit} of fresh ${p.name.toLowerCase()}`,
  image: p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop',
  imageAlt: p.name,
  badge: isPopular ? 'Popular' : undefined,
  variant: isPopular ? 'popular' as const : undefined,
});

const fruitBoxes = computed(() => {
  if (!rawProducts.value?.items) return [];
  const fruits = rawProducts.value.items.filter((p: any) => p.category === 'FRUITS');
  return fruits.slice(0, 3).map((p, i) => mapProduct(p, i === 1));
});

const vegBoxes = computed(() => {
  if (!rawProducts.value?.items) return [];
  const veg = rawProducts.value.items.filter((p: any) => p.category === 'VEGETABLES' || p.category === 'ROOT_VEGETABLES');
  return veg.slice(0, 3).map(p => mapProduct(p));
});

const mixedBoxes = computed(() => {
  if (!rawProducts.value?.items) return [];
  // Just take a mix of whatever
  return rawProducts.value.items.slice(0, 2).map((p, i) => mapProduct(p, i === 0));
});

const steps = ref([
  {
    number: '1',
    icon: ShoppingBasket,
    title: 'Choose Your Box',
    description: 'Select from our curated seasonal mixes or build your own custom crate.',
  },
  {
    number: '2',
    icon: Calendar,
    title: 'Schedule Delivery',
    description: 'Pick a one-time delivery or subscribe for weekly freshness and save 10%.',
  },
  {
    number: '3',
    icon: Smile,
    title: 'Enjoy Kibwezi Best',
    description: 'Same-day delivery from the farm to your doorstep. Freshness guaranteed.',
  },
]);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full">
      <!-- Hero - No animation wrapper for LCP optimization -->
      <HeroSection />
      
      <!-- Below fold content with animations -->
      <MotionSlideIn direction="up" :distance="40" :delay="0.1">
        <ProductSection
          title="Fresh Fruit Boxes"
          subtitle="Sweet, seasonal, and sun-ripened in Kibwezi."
          :products="fruitBoxes"
          view-all-link="/shop"
          view-all-label="See all fruits"
        />
      </MotionSlideIn>
      
      <!-- Mixed Boxes (Highlighted) -->
      <MotionSlideIn direction="up" :distance="40" :delay="0.1">
        <ProductSection
          title="Mixed Variety Boxes"
          subtitle=""
          :products="mixedBoxes"
          view-all-link="/shop"
          layout="highlighted"
        />
      </MotionSlideIn>
      
      <!-- Vegetable Boxes -->
      <MotionSlideIn direction="up" :distance="40" :delay="0.1">
        <ProductSection
          title="Fresh Vegetable Boxes"
          subtitle="Crisp, farm-fresh, and nutritious greens."
          :products="vegBoxes"
          view-all-link="/shop"
          view-all-label="See all veggies"
        />
      </MotionSlideIn>
      
      <!-- CTA -->
      <MotionFadeIn :scale="0.95" :duration="0.5">
        <CTASection />
      </MotionFadeIn>
      
      <!-- How It Works -->
      <section class="mt-20 py-10">
        <MotionFadeIn :y="20">
          <h3 class="text-2xl font-serif text-center text-balance mb-12 text-primary-deep">How it Works</h3>
        </MotionFadeIn>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
          <component
            :is="motion.div"
            v-for="(step, index) in steps"
            :key="step.number"
            :initial="{ opacity: 0, y: 30 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :viewport="{ once: true, margin: '-50px' }"
            :transition="{ 
              duration: 0.4, 
              delay: index * 0.15,
              ease: 'easeOut'
            }"
            :while-hover="{ y: -5, scale: 1.02 }"
          >
            <StepCard v-bind="step" />
          </component>
        </div>
      </section>
  </div>
</template>
