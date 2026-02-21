<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  Leaf, 
  Heart, 
  Users, 
  Award, 
  Sprout, 
  Droplets, 
  Sun, 
  Truck, 
  MapPin, 
  Phone, 
  Mail,
  ArrowRight,
  Quote
} from 'lucide-vue-next';
import { motion } from 'motion-v';
import {
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
  AvatarRoot,
  AvatarImage,
  AvatarFallback,
} from 'reka-ui';

// Import images directly - Nuxt/Vite will handle asset processing
import bannerImage from '~/assets/images/slider1.jpg';
import storyImage1 from '~/assets/images/slider2.jpg';
import storyImage2 from '~/assets/images/slider3.jpg';
import sustainImage1 from '~/assets/images/slider4.jpg';
import sustainImage2 from '~/assets/images/slider5.jpg';

// SEO
useSeoMeta({
  title: 'About Yndu Farm | Fresh Produce from Kibwezi',
  description: 'Discover Yndu Farm - where passion meets sustainability. We deliver farm-fresh produce straight from our Kibwezi farm to your doorstep in Nairobi.',
  ogTitle: 'About Yndu Farm | Fresh From Our Farm to You',
  ogDescription: 'Experience the difference of truly fresh produce. Grown with love in Kibwezi, delivered with care to Nairobi.',
});

// Stats
const stats = [
  { value: '500+', label: 'Happy Customers', icon: Heart },
  { value: '50+', label: 'Acres of Farmland', icon: Sprout },
  { value: '12', label: 'Delivery Routes', icon: Truck },
  { value: '100%', label: 'Farm-Fresh Practices', icon: Leaf },
];

// Values
const values = [
  {
    icon: Leaf,
    title: 'Sustainable Farming',
    description: 'We use regenerative agriculture practices that enrich the soil and protect our environment for future generations.',
  },
  {
    icon: Heart,
    title: 'Farm to Table Freshness',
    description: 'Produce harvested at peak ripeness and delivered within hours, ensuring maximum nutrition and flavor.',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'We employ local farmers and invest in our community, creating sustainable livelihoods in Kibwezi.',
  },
  {
    icon: Award,
    title: 'Quality Guaranteed',
    description: 'Every product is hand-selected and inspected. Not satisfied? We\'ll make it right, guaranteed.',
  },
];

// Team members
const team = [
  {
    name: 'Daniel Mwangi',
    role: 'Founder & Lead Farmer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    bio: 'With 15+ years in sustainable agriculture, Daniel founded Yndu with a vision to bring farm-fresh produce to every Nairobi home.',
  },
  {
    name: 'Grace Wanjiku',
    role: 'Operations Manager',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    bio: 'Grace ensures every order is packed with care and delivered on time. Her attention to detail keeps our customers smiling.',
  },
  {
    name: 'John Kamau',
    role: 'Head of Agriculture',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    bio: 'An expert in farm-fresh farming methods, John oversees our crops from seed to harvest, ensuring the highest quality standards.',
  },
  {
    name: 'Mary Akinyi',
    role: 'Customer Experience',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    bio: 'Mary is the voice of Yndu, helping customers with subscriptions, orders, and ensuring their experience is exceptional.',
  },
];

// Import gallery images
import gallery1 from '~/assets/images/slider1.jpg';
import gallery2 from '~/assets/images/slider2.jpg';
import gallery3 from '~/assets/images/slider3.jpg';
import gallery4 from '~/assets/images/slider4.jpg';
import gallery5 from '~/assets/images/slider5.jpg';
import gallery6 from '~/assets/images/slider6.jpg';
import gallery7 from '~/assets/images/slider7.jpg';
import gallery8 from '~/assets/images/20240409_093141.jpg';
import gallery9 from '~/assets/images/20240409_094007.jpg';

// Gallery images
const galleryImages = [
  { src: gallery1, alt: 'Farm landscape view', caption: 'Our beautiful Kibwezi farmland' },
  { src: gallery2, alt: 'Crop rows', caption: 'Naturally grown vegetable rows' },
  { src: gallery3, alt: 'Farm workers', caption: 'Our dedicated farming team at work' },
  { src: gallery4, alt: 'Fresh harvest', caption: 'Daily harvest of fresh produce' },
  { src: gallery5, alt: 'Irrigation system', caption: 'Sustainable irrigation in action' },
  { src: gallery6, alt: 'Green vegetables', caption: 'Lush green vegetable gardens' },
  { src: gallery7, alt: 'Farm produce', caption: 'Fresh from the field' },
  { src: gallery8, alt: 'Farm scenery', caption: 'The heart of our operations' },
  { src: gallery9, alt: 'Yndu Farm', caption: 'Welcome to Yndu Farm' },
];

// FAQ items
const faqItems = [
  {
    question: 'Where is Yndu Farm located?',
    answer: 'Our farm is located in Kibwezi, Makueni County - a region known for its fertile soil and ideal climate for vegetable farming. We deliver fresh produce daily to Nairobi and surrounding areas.',
  },
  {
    question: 'How fresh is your produce?',
    answer: 'Extremely fresh! We harvest our produce early in the morning and deliver it the same day. Most vegetables reach your kitchen within 6-12 hours of being picked, ensuring maximum nutrition and flavor.',
  },
  {
    question: 'Do you use pesticides?',
    answer: 'No, we practice farm-fresh and regenerative farming. We use natural pest control methods, companion planting, and beneficial insects to protect our crops. Our produce is grown without synthetic pesticides or fertilizers.',
  },
  {
    question: 'What areas do you deliver to?',
    answer: 'We currently deliver to all areas in Nairobi including Kilimani, Westlands, Karen, Lavington, Runda, Kileleshwa, and more. We\'re expanding rapidly - contact us if your area isn\'t listed!',
  },
  {
    question: 'Can I visit the farm?',
    answer: 'Absolutely! We love showing people where their food comes from. We organize farm tours every Saturday. Book through our website or contact us directly for a personalized tour experience.',
  },
];

// Certifications
const certifications = [
  { name: 'Farm Fresh Certified', icon: Leaf },
  { name: 'Kenya GAP', icon: Award },
  { name: 'Fair Trade', icon: Heart },
  { name: 'Eco-Friendly', icon: Sprout },
];

// Testimonials
const testimonials = [
  {
    name: 'Sarah M.',
    location: 'Kilimani, Nairobi',
    text: 'The freshness is unmatched! I can actually taste the difference. My kids now love eating vegetables.',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
  },
  {
    name: 'Michael O.',
    location: 'Westlands, Nairobi',
    text: 'Been subscribed for 6 months. Never missed a delivery, and the quality is consistently excellent.',
    avatar: 'https://i.pravatar.cc/150?u=michael',
  },
  {
    name: 'Jane W.',
    location: 'Karen, Nairobi',
    text: 'Knowing exactly where my food comes from gives me peace of mind. Yndu is doing amazing work!',
    avatar: 'https://i.pravatar.cc/150?u=jane',
  },
];
</script>

<template>
  <div class="min-h-dvh bg-background">
    <!-- Hero Section with Local Banner Image -->
    <section class="relative overflow-hidden">
      <!-- Background Image with Overlay -->
      <div class="absolute inset-0">
        <NuxtImg 
          :src="bannerImage" 
          alt="Yndu Farm Landscape"
          class="w-full h-full object-cover"
          loading="eager"
          format="webp"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-foundation/90 via-foundation/70 to-transparent" />
      </div>
      
      <!-- Hero Content -->
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div class="max-w-2xl">
          <motion.div
            :initial="{ opacity: 0, y: 30 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.6 }"
          >
            <span class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              <Sprout class="w-4 h-4" />
              Est. 2019 • Kibwezi, Kenya
            </span>
          </motion.div>
          
          <motion.h1
            :initial="{ opacity: 0, y: 30 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.6, delay: 0.1 }"
            class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance mb-6"
          >
            Growing Freshness,<br />
            <span class="text-primary-deep">Delivering Happiness</span>
          </motion.h1>
          
          <motion.p
            :initial="{ opacity: 0, y: 30 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.6, delay: 0.2 }"
            class="text-lg text-white/80 mb-8 leading-relaxed"
          >
            From our fertile fields in Kibwezi to your kitchen in Nairobi, we're on a mission to reconnect you with real food. No chemicals, no compromises - just pure, farm-fresh goodness.
          </motion.p>
          
          <motion.div
            :initial="{ opacity: 0, y: 30 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.6, delay: 0.3 }"
            class="flex flex-wrap gap-4"
          >
            <button
              class="inline-flex items-center gap-2 px-6 py-3 bg-primary-deep text-white rounded-lg font-semibold hover:bg-primary-deep/90 transition-colors"
              @click="navigateTo('/subscription')"
            >
              Start Your Subscription
              <ArrowRight class="w-4 h-4" />
            </button>
            <button
              class="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
              @click="navigateTo('/shop')"
            >
              Shop Produce
            </button>
          </motion.div>
        </div>
      </div>
      
      <!-- Stats Bar -->
      <motion.div
        :initial="{ opacity: 0, y: 40 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.4 }"
        class="relative bg-white/95 backdrop-blur-md border-t border-white/20"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div v-for="(stat, index) in stats" :key="stat.label" class="text-center">
              <motion.div
                :initial="{ scale: 0 }"
                :while-in-view="{ scale: 1 }"
                :transition="{ delay: index * 0.1, type: 'spring' }"
                :viewport="{ once: true }"
                class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-deep/10 mb-3"
              >
                <component :is="stat.icon" class="w-6 h-6 text-primary-deep" />
              </motion.div>
              <div class="text-2xl sm:text-3xl font-bold text-foundation">{{ stat.value }}</div>
              <div class="text-sm text-muted-foreground">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>

    <!-- Our Story Section with Local Images -->
    <section class="py-16 sm:py-24 bg-background">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <!-- Image Grid with Local Images -->
          <motion.div
            :initial="{ opacity: 0, x: -50 }"
            :while-in-view="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.6 }"
            :viewport="{ once: true }"
            class="relative"
          >
            <div class="grid grid-cols-2 gap-4">
              <motion.div
                :while-hover="{ scale: 1.02 }"
                class="rounded-2xl overflow-hidden shadow-lg"
              >
                <NuxtImg 
                  :src="storyImage1" 
                  alt="Fresh produce from Yndu Farm"
                  class="w-full h-64 object-cover"
                  loading="lazy"
                  format="webp"
                  sizes="sm:100vw md:50vw lg:400px"
                />
              </motion.div>
              <motion.div
                :while-hover="{ scale: 1.02 }"
                class="rounded-2xl overflow-hidden shadow-lg mt-8"
              >
                <NuxtImg 
                  :src="storyImage2" 
                  alt="Farm irrigation and crops"
                  class="w-full h-64 object-cover"
                  loading="lazy"
                  format="webp"
                  sizes="sm:100vw md:50vw lg:400px"
                />
              </motion.div>
            </div>
            <!-- Experience Badge -->
            <motion.div
              :initial="{ scale: 0, rotate: -10 }"
              :while-in-view="{ scale: 1, rotate: 0 }"
              :transition="{ delay: 0.3, type: 'spring' }"
              :viewport="{ once: true }"
              class="absolute -bottom-6 -right-6 bg-primary-deep text-white p-6 rounded-2xl shadow-xl"
            >
              <div class="text-4xl font-bold">6+</div>
              <div class="text-sm opacity-90">Years of<br/>Excellence</div>
            </motion.div>
          </motion.div>
          
          <!-- Story Content -->
          <motion.div
            :initial="{ opacity: 0, x: 50 }"
            :while-in-view="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.6 }"
            :viewport="{ once: true }"
          >
            <span class="text-primary-deep font-semibold text-sm uppercase tracking-wider">Our Story</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-foundation text-balance mt-2 mb-6">
              Rooted in Passion,<br/>Grown with Purpose
            </h2>
            <div class="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Yndu began with a simple belief: everyone deserves access to fresh, nutritious produce. What started as a small family plot in Kibwezi has grown into a thriving farm that supplies thousands of Nairobi households with farm-fresh vegetables.
              </p>
              <p>
                Our name "Yndu" (pronounced "Yin-du") means "earth" in Kamba, honoring our deep connection to the land and our commitment to sustainable farming practices that nurture rather than deplete.
              </p>
              <p>
                Every morning at 5 AM, our team begins harvesting. By 10 AM, those same vegetables are packed and on their way to Nairobi. This farm-to-table speed isn't just about freshness - it's about preserving nutrients and flavor that industrial supply chains lose.
              </p>
            </div>
            
            <div class="mt-8 flex items-center gap-4">
              <div class="flex -space-x-3">
                <img v-for="i in 4" :key="i" :src="`https://i.pravatar.cc/150?u=team${i}`" class="w-10 h-10 rounded-full border-2 border-white" />
              </div>
              <div class="text-sm">
                <span class="font-semibold text-foundation">20+ Team Members</span>
                <p class="text-muted-foreground">Dedicated to your fresh produce</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="py-16 sm:py-24 bg-muted/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <span class="text-primary-deep font-semibold text-sm uppercase tracking-wider">Our Values</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-foundation text-balance mt-2 mb-4">
            What We Stand For
          </h2>
          <p class="text-muted-foreground text-lg">
            Our values guide every decision we make - from seed selection to delivery.
          </p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            v-for="(value, index) in values"
            :key="value.title"
            :initial="{ opacity: 0, y: 30 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :transition="{ delay: index * 0.1 }"
            :while-hover="{ y: -8 }"
            :viewport="{ once: true }"
            class="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="w-12 h-12 rounded-xl bg-primary-deep/10 flex items-center justify-center mb-4">
              <component :is="value.icon" class="w-6 h-6 text-primary-deep" />
            </div>
            <h3 class="text-lg font-semibold text-foundation mb-2">{{ value.title }}</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">{{ value.description }}</p>
          </motion.div>
        </div>
      </div>
    </section>

    <!-- Gallery Section with Local Images -->
    <section class="py-16 sm:py-24 bg-background">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-12">
          <span class="text-primary-deep font-semibold text-sm uppercase tracking-wider">Farm Life</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-foundation text-balance mt-2 mb-4">
            A Glimpse Into Our Farm
          </h2>
          <p class="text-muted-foreground text-lg">
            See where your food grows and meet the people who make it happen.
          </p>
        </div>
        
        <!-- Masonry Gallery with Local Images -->
        <div class="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          <motion.div
            v-for="(image, index) in galleryImages"
            :key="image.src"
            :initial="{ opacity: 0, scale: 0.9 }"
            :while-in-view="{ opacity: 1, scale: 1 }"
            :transition="{ delay: index * 0.05 }"
            :while-hover="{ scale: 1.02 }"
            :viewport="{ once: true }"
            class="break-inside-avoid rounded-2xl overflow-hidden shadow-md group cursor-pointer relative"
          >
            <NuxtImg 
              :src="image.src" 
              :alt="image.alt"
              class="w-full object-cover"
              loading="lazy"
              format="webp"
              sizes="sm:100vw md:50vw lg:33vw"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <p class="text-white font-medium text-sm">{{ image.caption }}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="py-16 sm:py-24 bg-muted/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <span class="text-primary-deep font-semibold text-sm uppercase tracking-wider">Our Team</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-foundation text-balance mt-2 mb-4">
            Meet the People Behind Yndu
          </h2>
          <p class="text-muted-foreground text-lg">
            Passionate individuals dedicated to bringing you the freshest produce.
          </p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div
            v-for="(member, index) in team"
            :key="member.name"
            :initial="{ opacity: 0, y: 30 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :transition="{ delay: index * 0.1 }"
            :viewport="{ once: true }"
            class="text-center"
          >
            <motion.div
              :while-hover="{ scale: 1.05 }"
              class="relative inline-block mb-4"
            >
              <AvatarRoot class="w-32 h-32 rounded-full border-4 border-white shadow-lg">
                <AvatarImage :src="member.image" :alt="member.name" class="object-cover" />
                <AvatarFallback class="text-2xl font-bold bg-primary-deep text-white">
                  {{ member.name.charAt(0) }}
                </AvatarFallback>
              </AvatarRoot>
            </motion.div>
            <h3 class="text-lg font-semibold text-foundation">{{ member.name }}</h3>
            <p class="text-primary-deep text-sm font-medium mb-2">{{ member.role }}</p>
            <p class="text-sm text-muted-foreground">{{ member.bio }}</p>
          </motion.div>
        </div>
      </div>
    </section>

    <!-- Sustainability Section with Local Images -->
    <section class="py-16 sm:py-24 bg-foundation text-white relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-0 w-96 h-96 bg-primary-deep rounded-full blur-3xl" />
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-green-500 rounded-full blur-3xl" />
      </div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            :initial="{ opacity: 0, x: -30 }"
            :while-in-view="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.6 }"
            :viewport="{ once: true }"
          >
            <span class="text-primary-deep font-semibold text-sm uppercase tracking-wider">Sustainability</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-balance mt-2 mb-6 text-white">
              Farming for the Future
            </h2>
            <p class="text-white/90 mb-8 leading-relaxed">
              We believe in leaving the land better than we found it. Our regenerative practices build soil health, sequester carbon, and create a thriving ecosystem.
            </p>
            
            <div class="space-y-4">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-lg bg-primary-deep/20 flex items-center justify-center shrink-0">
                  <Droplets class="w-5 h-5 text-primary-deep" />
                </div>
                <div>
                  <h4 class="font-semibold mb-1 text-white">Water Conservation</h4>
                  <p class="text-sm text-white/90">Drip irrigation reduces water usage by 60% while maximizing crop yields.</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-lg bg-primary-deep/20 flex items-center justify-center shrink-0">
                  <Sun class="w-5 h-5 text-primary-deep" />
                </div>
                <div>
                  <h4 class="font-semibold mb-1 text-white">Solar Powered</h4>
                  <p class="text-sm text-white/90">Our irrigation systems run on solar energy, reducing our carbon footprint.</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-lg bg-primary-deep/20 flex items-center justify-center shrink-0">
                  <Leaf class="w-5 h-5 text-primary-deep" />
                </div>
                <div>
                  <h4 class="font-semibold mb-1 text-white">Zero Waste</h4>
                  <p class="text-sm text-white/90">All farm byproduct waste is composted and returned to enrich our soil.</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            :initial="{ opacity: 0, x: 30 }"
            :while-in-view="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.6 }"
            :viewport="{ once: true }"
            class="grid grid-cols-2 gap-4"
          >
            <div class="space-y-4">
              <motion.div
                :while-hover="{ scale: 1.02 }"
                class="rounded-2xl overflow-hidden"
              >
                <NuxtImg 
                  :src="sustainImage1" 
                  alt="Farm fresh vegetables"
                  class="w-full h-48 object-cover"
                  loading="lazy"
                  format="webp"
                  sizes="sm:100vw md:50vw lg:400px"
                />
              </motion.div>
              <motion.div
                :while-hover="{ scale: 1.02 }"
                class="rounded-2xl overflow-hidden bg-primary-deep/20 p-6 flex items-center justify-center"
              >
                <div class="text-center">
                  <Leaf class="w-12 h-12 text-primary-deep mx-auto mb-2" />
                  <div class="text-3xl font-bold">100%</div>
                  <div class="text-sm text-white/90">Farm Fresh</div>
                </div>
              </motion.div>
            </div>
            <div class="space-y-4 pt-8">
              <motion.div
                :while-hover="{ scale: 1.02 }"
                class="rounded-2xl overflow-hidden bg-green-500/20 p-6 flex items-center justify-center"
              >
                <div class="text-center">
                  <Sprout class="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <div class="text-3xl font-bold">50+</div>
                  <div class="text-sm text-white/90">Crop Varieties</div>
                </div>
              </motion.div>
              <motion.div
                :while-hover="{ scale: 1.02 }"
                class="rounded-2xl overflow-hidden"
              >
                <NuxtImg 
                  :src="sustainImage2" 
                  alt="Farmers at work"
                  class="w-full h-48 object-cover"
                  loading="lazy"
                  format="webp"
                  sizes="sm:100vw md:50vw lg:400px"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-16 sm:py-24 bg-background">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <span class="text-primary-deep font-semibold text-sm uppercase tracking-wider">Testimonials</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-foundation text-balance mt-2 mb-4">
            What Our Customers Say
          </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            v-for="(testimonial, index) in testimonials"
            :key="testimonial.name"
            :initial="{ opacity: 0, y: 30 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :transition="{ delay: index * 0.1 }"
            :viewport="{ once: true }"
            class="bg-card rounded-2xl p-6 shadow-sm relative"
          >
            <Quote class="w-8 h-8 text-primary-deep/20 absolute top-4 right-4" />
            <p class="text-muted-foreground mb-6 italic">"{{ testimonial.text }}"</p>
            <div class="flex items-center gap-3">
              <AvatarRoot class="w-10 h-10 rounded-full">
                <AvatarImage :src="testimonial.avatar" :alt="testimonial.name" />
                <AvatarFallback>{{ testimonial.name.charAt(0) }}</AvatarFallback>
              </AvatarRoot>
              <div>
                <div class="font-semibold text-foundation">{{ testimonial.name }}</div>
                <div class="text-sm text-muted-foreground">{{ testimonial.location }}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-16 sm:py-24 bg-muted/30">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="text-primary-deep font-semibold text-sm uppercase tracking-wider">FAQ</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-foundation text-balance mt-2 mb-4">
            Frequently Asked Questions
          </h2>
        </div>
        
        <AccordionRoot type="single" collapsible class="space-y-4">
          <AccordionItem
            v-for="(item, index) in faqItems"
            :key="item.question"
            :value="`item-${index}`"
            class="bg-card rounded-xl border border-border overflow-hidden"
          >
            <AccordionHeader>
              <AccordionTrigger class="flex items-center justify-between w-full px-6 py-4 text-left font-medium hover:bg-accent/50 transition-colors [&[data-state=open]>svg]:rotate-180">
                {{ item.question }}
                <ArrowRight class="w-4 h-4 shrink-0 transition-transform" />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent class="px-6 pb-4 text-muted-foreground">
              {{ item.answer }}
            </AccordionContent>
          </AccordionItem>
        </AccordionRoot>
      </div>
    </section>

    <!-- Certifications -->
    <section class="py-12 bg-background border-y border-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          <div v-for="cert in certifications" :key="cert.name" class="flex items-center gap-2 text-muted-foreground">
            <component :is="cert.icon" class="w-5 h-5 text-primary-deep" />
            <span class="font-medium">{{ cert.name }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 sm:py-24 bg-primary-deep relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
      </div>
      
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          :initial="{ opacity: 0, y: 30 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.6 }"
          :viewport="{ once: true }"
        >
          <h2 class="text-3xl sm:text-4xl font-bold text-white text-balance mb-4">
            Ready to Taste the Difference?
          </h2>
          <p class="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of Nairobi families who've made the switch to farm-fresh produce delivered to their doorstep.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <button
              class="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-deep rounded-lg font-bold hover:bg-white/90 transition-colors"
              @click="navigateTo('/subscription')"
            >
              Start Your Subscription
              <ArrowRight class="w-5 h-5" />
            </button>
            <button
              class="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-lg font-bold hover:bg-white/20 transition-colors"
              @click="navigateTo('/shop')"
            >
              Shop Now
            </button>
          </div>
          <p class="text-white/60 text-sm mt-6">
            Free delivery on orders over KSh 2,000 • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="py-16 sm:py-24 bg-background">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            :while-hover="{ y: -4 }"
            class="flex items-center gap-4 p-6 bg-card rounded-xl border border-border"
          >
            <div class="w-12 h-12 rounded-xl bg-primary-deep/10 flex items-center justify-center">
              <MapPin class="w-6 h-6 text-primary-deep" />
            </div>
            <div>
              <h3 class="font-semibold text-foundation">Visit Us</h3>
              <p class="text-sm text-muted-foreground">Kibwezi, Makueni County</p>
            </div>
          </motion.div>
          
          <motion.div
            :while-hover="{ y: -4 }"
            class="flex items-center gap-4 p-6 bg-card rounded-xl border border-border"
          >
            <div class="w-12 h-12 rounded-xl bg-primary-deep/10 flex items-center justify-center">
              <Phone class="w-6 h-6 text-primary-deep" />
            </div>
            <div>
              <h3 class="font-semibold text-foundation">Call Us</h3>
              <p class="text-sm text-muted-foreground">+254 700 123 456</p>
            </div>
          </motion.div>
          
          <motion.div
            :while-hover="{ y: -4 }"
            class="flex items-center gap-4 p-6 bg-card rounded-xl border border-border"
          >
            <div class="w-12 h-12 rounded-xl bg-primary-deep/10 flex items-center justify-center">
              <Mail class="w-6 h-6 text-primary-deep" />
            </div>
            <div>
              <h3 class="font-semibold text-foundation">Email Us</h3>
              <p class="text-sm text-muted-foreground">hello@yndu.co.ke</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
