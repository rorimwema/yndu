<script setup lang="ts">
import { ref } from 'vue';
import { motion } from 'motion-v';

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
    icon: 'ShoppingBasket', // Updated to Lucide name
    title: 'Choose Your Box',
    description: 'Select from our curated seasonal mixes or build your own custom crate.',
  },
  {
    number: '2',
    icon: 'Calendar', // Updated to Lucide name (was calendar_month)
    title: 'Schedule Delivery',
    description: 'Pick a one-time delivery or subscribe for weekly freshness and save 10%.',
  },
  {
    number: '3',
    icon: 'Smile', // Updated to Lucide name (was sentiment_satisfied)
    title: 'Enjoy Kibwezi Best',
    description: 'Same-day delivery from the farm to your doorstep. Freshness guaranteed.',
  },
]);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <!-- Hero -->
      <MotionFadeIn :y="30" :duration="0.6">
        <HeroSection />
      </MotionFadeIn>
      
      <!-- Fruit Boxes -->
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
          subtitle="Crisp, organic, and nutritious greens."
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
          <h3 class="text-2xl font-black text-center mb-12 text-flexoki">How it Works</h3>
        </MotionFadeIn>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
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
