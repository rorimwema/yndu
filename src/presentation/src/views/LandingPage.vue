<script setup lang="ts">
import { ref } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import HeroSection from '../components/HeroSection.vue';
import ProductSection from '../components/ProductSection.vue';
import CTASection from '../components/CTASection.vue';
import StepCard from '../components/StepCard.vue';

// Product data
const fruitBoxes = ref([
  {
    id: 'fruit-small',
    title: 'Small Fruit Box',
    price: 1200,
    description: '4-5 seasonal items. Perfect for singles or couples for a week.',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop',
    imageAlt: 'Box filled with 4-5 types of tropical fruits',
  },
  {
    id: 'fruit-medium',
    title: 'Medium Fruit Box',
    price: 2100,
    description: '7-8 seasonal items. Ideal for a family of three or four.',
    image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=600&auto=format&fit=crop',
    imageAlt: 'Medium size box containing various colorful tropical fruits',
    badge: 'Most Popular',
    variant: 'popular' as const,
  },
  {
    id: 'fruit-large',
    title: 'Large Fruit Box',
    price: 3500,
    description: '10+ seasonal items. Best for fruit lovers and large households.',
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600&auto=format&fit=crop',
    imageAlt: 'Large overflowing box of assorted fresh fruits',
  },
]);

const mixedBoxes = ref([
  {
    id: 'mixed-small',
    title: 'Small Mixed Box',
    price: 1800,
    description: 'Ideal for 1-2 people',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop',
    imageAlt: 'A large mixed box containing kale, tomatoes, oranges and passion fruit',
  },
  {
    id: 'mixed-family',
    title: 'Family Mixed Box',
    price: 3200,
    description: 'Best Value',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop',
    imageAlt: 'Family size mixed produce box',
  },
]);

const vegBoxes = ref([
  {
    id: 'veg-small',
    title: 'Small Veg Box',
    price: 950,
    description: 'The essentials for your weekly meals.',
    image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&auto=format&fit=crop',
    imageAlt: 'Small variety of green vegetables like broccoli and peppers',
  },
  {
    id: 'veg-medium',
    title: 'Medium Veg Box',
    price: 1600,
    description: 'A diverse range of roots and greens for the home cook.',
    image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&auto=format&fit=crop',
    imageAlt: 'Medium assortment of seasonal garden vegetables',
  },
  {
    id: 'veg-large',
    title: 'Large Veg Box',
    price: 2800,
    description: 'Full pantry restock. Best for large families or vegetarian households.',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop',
    imageAlt: 'Abundance of various fresh vegetables in a large wooden crate',
  },
]);

const steps = ref([
  {
    number: '1',
    icon: '🛒',
    title: 'Choose Your Box',
    description: 'Select from our curated seasonal mixes or build your own custom crate.',
  },
  {
    number: '2',
    icon: '📅',
    title: 'Schedule Delivery',
    description: 'Pick a one-time delivery or subscribe for weekly freshness and save 10%.',
  },
  {
    number: '3',
    icon: '😊',
    title: 'Enjoy Kibwezi Best',
    description: 'Same-day delivery from the farm to your doorstep. Freshness guaranteed.',
  },
]);
</script>

<template>
  <div class="min-h-screen bg-flexoki flex flex-col">
    <AppHeader />
    
    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <!-- Hero -->
      <HeroSection />
      
      <!-- Fruit Boxes -->
      <ProductSection
        title="Fresh Fruit Boxes"
        subtitle="Sweet, seasonal, and sun-ripened in Kibwezi."
        :products="fruitBoxes"
        view-all-link="/shop/fruits"
      />
      
      <!-- Mixed Boxes (Highlighted) -->
      <ProductSection
        title="Mixed Variety Boxes"
        subtitle=""
        :products="mixedBoxes"
        view-all-link="/shop/mixed"
        layout="highlighted"
      />
      
      <!-- Vegetable Boxes -->
      <ProductSection
        title="Fresh Vegetable Boxes"
        subtitle="Crisp, organic, and nutritious greens."
        :products="vegBoxes"
        view-all-link="/shop/vegetables"
      />
      
      <!-- CTA -->
      <CTASection />
      
      <!-- How It Works -->
      <section class="mt-20 py-10">
        <h3 class="text-2xl font-black text-center mb-12 text-flexoki">How it Works</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
          <StepCard
            v-for="step in steps"
            :key="step.number"
            v-bind="step"
          />
        </div>
      </section>
    </main>
    
    <AppFooter />
  </div>
</template>
