<script setup lang="ts">
import { 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Shield, 
  Truck, 
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  HelpCircle,
  Package,
  Calendar,
  CreditCard,
  MessageCircle
} from 'lucide-vue-next';
import { motion } from 'motion-v';
import {
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
} from 'reka-ui';

// SEO
useSeoMeta({
  title: 'Refund Policy | Yndu Farm',
  description: 'Understand our refund policy for fresh produce deliveries. We ensure customer satisfaction with our straightforward refund process.',
  ogTitle: 'Yndu Farm Refund Policy',
  ogDescription: 'Our commitment to customer satisfaction. Learn about our refund eligibility, process, and timelines.',
});

// Policy sections
const policySections = [
  {
    icon: CheckCircle,
    title: 'Eligibility for Refunds',
    description: 'We want you to be completely satisfied with your fresh produce. Refunds are available under the following circumstances:',
    items: [
      'Damaged or spoiled items upon delivery',
      'Wrong items delivered (different from what was ordered)',
      'Missing items from your order',
      'Quality issues that make the produce inedible',
      'Orders cancelled before dispatch'
    ]
  },
  {
    icon: Clock,
    title: 'Refund Timeline',
    description: 'We process refunds promptly to ensure you receive your funds as quickly as possible.',
    items: [
      'Initial review: Within 24-48 hours of submitting your request',
      'Refund processing: 5-7 business days after approval',
      'Funds credited: Within 10-14 business days (depending on your bank)'
    ]
  },
  {
    icon: XCircle,
    title: 'Non-Refundable Items',
    description: 'To maintain our farm-fresh quality standards, certain items cannot be refunded:',
    items: [
      'Produce that has been consumed or partially consumed',
      'Items that have been stored improperly after delivery',
      'Custom or personalized orders',
      'Subscription boxes that have been delivered and accepted'
    ]
  },
  {
    icon: Package,
    title: 'Damaged or Incorrect Orders',
    description: 'We take pride in delivering fresh, accurate orders. Here\'s what to do if something goes wrong:',
    items: [
      'Photo evidence required within 2 hours of delivery',
      'Contact us immediately with your order number',
      'We will arrange for a replacement or full refund',
      'No need to return damaged items'
    ]
  },
  {
    icon: RefreshCw,
    title: 'Subscription Cancellations',
    description: 'Managing your subscription is easy. Here\'s the refund policy for subscriptions:',
    items: [
      'Cancel anytime before the next billing cycle',
      'No refunds for completed delivery cycles',
      'Partial month refunds not available',
      'Reactivation fees may apply to paused subscriptions'
    ]
  },
  {
    icon: CreditCard,
    title: 'Refund Method',
    description: 'Refunds are processed using the original payment method:',
    items: [
      'Mobile Money (M-Pesa): Instant reversal to your registered number',
      'Credit/Debit Card: 5-7 business days',
      'Bank Transfer: 7-14 business days',
      'Store credit: Available for immediate use on next order'
    ]
  }
];

// FAQ items
const faqItems = [
  {
    question: 'How do I request a refund?',
    answer: 'To request a refund, contact us via WhatsApp at +254 700 123 456, email at hello@yndu.co.ke, or call our customer service line. Please have your order number ready and provide photos of any damaged items.',
  },
  {
    question: 'What if I\'m not home during delivery?',
    answer: 'If you\'re not home, our delivery team will leave your order in a safe location as specified in your delivery instructions. Please ensure someone is available to receive perishable items. If items are damaged due to prolonged outdoor exposure, we may not be able to offer a refund.',
  },
  {
    question: 'Can I get a refund for a missed delivery?',
    answer: 'If a delivery was missed due to our error (wrong address, delivery driver issue), we will either reschedule or provide a full refund. For missed deliveries due to incorrect customer information, please contact us to reschedule (delivery fee may apply).',
  },
  {
    question: 'How long do I have to report an issue with my order?',
    answer: 'We recommend reporting any issues within 2 hours of delivery for fresh produce. This allows us to assess the situation while the items are still fresh. For quality concerns, please contact us as soon as possible.',
  },
  {
    question: 'Can I get a refund instead of a replacement?',
    answer: 'Yes, you can choose between a replacement or refund for eligible issues. Simply specify your preference when contacting our customer service team.',
  },
  {
    question: 'Do you offer refunds on subscription boxes?',
    answer: 'Subscription boxes that have already been delivered and accepted are not refundable. However, you can cancel your subscription at any time before the next billing cycle to stop future charges.',
  }
];

// Contact methods
const contactMethods = [
  {
    icon: Phone,
    title: 'Call Us',
    details: '+254 700 123 456',
    description: 'Mon-Sat: 6AM - 8PM'
  },
  {
    icon: Mail,
    title: 'Email Us',
    details: 'hello@yndu.co.ke',
    description: 'We reply within 24 hours'
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    details: '+254 700 123 456',
    description: 'Quick responses'
  }
];
</script>

<template>
  <div class="min-h-dvh bg-background">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-foundation">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-0 w-96 h-96 bg-primary-deep rounded-full blur-3xl" />
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-green-500 rounded-full blur-3xl" />
      </div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div class="max-w-3xl mx-auto text-center">
          <motion.div
            :initial="{ opacity: 0, y: 30 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.6 }"
          >
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-deep/20 mb-6">
              <RefreshCw class="w-8 h-8 text-primary-deep" />
            </div>
          </motion.div>
          
          <motion.h1
            :initial="{ opacity: 0, y: 30 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.6, delay: 0.1 }"
            class="text-4xl sm:text-5xl font-bold text-white text-balance mb-6"
          >
            Refund Policy
          </motion.h1>
          
          <motion.p
            :initial="{ opacity: 0, y: 30 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.6, delay: 0.2 }"
            class="text-lg text-white/80 mb-8 leading-relaxed"
          >
            Our commitment to customer satisfaction. We stand behind the quality of our farm-fresh produce and want to make things right if something goes wrong.
          </motion.p>
          
          <motion.div
            :initial="{ opacity: 0, y: 30 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.6, delay: 0.3 }"
            class="flex flex-wrap justify-center gap-4"
          >
            <button
              class="inline-flex items-center gap-2 px-6 py-3 bg-primary-deep text-white rounded-lg font-semibold hover:bg-primary-deep/90 transition-colors"
              @click="navigateTo('/contact')"
            >
              Contact Support
              <ArrowRight class="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>

    <!-- Quick Info Banner -->
    <section class="py-8 bg-muted/30 border-b border-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div
            v-for="(method, index) in contactMethods"
            :key="method.title"
            :initial="{ opacity: 0, y: 20 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :transition="{ delay: index * 0.1 }"
            :viewport="{ once: true }"
            class="flex items-center gap-4"
          >
            <div class="w-10 h-10 rounded-lg bg-primary-deep/10 flex items-center justify-center shrink-0">
              <component :is="method.icon" class="w-5 h-5 text-primary-deep" />
            </div>
            <div>
              <p class="font-semibold text-foundation">{{ method.title }}</p>
              <p class="text-sm text-muted-foreground">{{ method.description }}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    <!-- Policy Content Sections -->
    <section class="py-16 sm:py-24 bg-background">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            v-for="(section, index) in policySections"
            :key="section.title"
            :initial="{ opacity: 0, y: 30 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :transition="{ delay: index * 0.1 }"
            :viewport="{ once: true }"
            class="bg-card rounded-2xl p-6 shadow-sm border border-border"
          >
            <div class="flex items-start gap-4 mb-4">
              <div class="w-12 h-12 rounded-xl bg-primary-deep/10 flex items-center justify-center shrink-0">
                <component :is="section.icon" class="w-6 h-6 text-primary-deep" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-foundation">{{ section.title }}</h3>
              </div>
            </div>
            <p class="text-muted-foreground mb-4">{{ section.description }}</p>
            <ul class="space-y-2">
              <li v-for="item in section.items" :key="item" class="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle class="w-4 h-4 text-primary-deep shrink-0 mt-0.5" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>

    <!-- How to Request Refund -->
    <section class="py-16 sm:py-24 bg-muted/30">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          :initial="{ opacity: 0, y: 30 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.6 }"
          :viewport="{ once: true }"
          class="text-center mb-12"
        >
          <span class="text-primary-deep font-semibold text-sm uppercase tracking-wider">How It Works</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-foundation text-balance mt-2 mb-4">
            How to Request a Refund
          </h2>
          <p class="text-muted-foreground text-lg">
            Follow these simple steps to get your refund processed quickly.
          </p>
        </motion.div>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div
            v-for="(step, index) in [
              { number: 1, title: 'Contact Us', description: 'Reach out via phone, email, or WhatsApp with your order number.' },
              { number: 2, title: 'Provide Details', description: 'Share photos of any damaged items and describe the issue.' },
              { number: 3, title: 'Get Resolution', description: 'We\'ll process your refund or replacement within 5-7 business days.' }
            ]"
            :key="step.number"
            :initial="{ opacity: 0, y: 30 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :transition="{ delay: index * 0.1 }"
            :viewport="{ once: true }"
            class="bg-card rounded-2xl p-6 shadow-sm border border-border text-center"
          >
            <div class="w-12 h-12 rounded-full bg-primary-deep text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
              {{ step.number }}
            </div>
            <h3 class="text-lg font-semibold text-foundation mb-2">{{ step.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ step.description }}</p>
          </motion.div>
        </div>
      </div>
    </section>

    <!-- Our Commitment -->
    <section class="py-16 sm:py-24 bg-foundation text-white relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 right-0 w-96 h-96 bg-primary-deep rounded-full blur-3xl" />
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-green-500 rounded-full blur-3xl" />
      </div>
      
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          :initial="{ opacity: 0, y: 30 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.6 }"
          :viewport="{ once: true }"
        >
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-6">
            <Shield class="w-8 h-8 text-primary-deep" />
          </div>
          <h2 class="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Our Commitment to You
          </h2>
          <p class="text-white/80 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            At Yndu Farm, we take pride in every delivery. If you're not satisfied for any reason, we want to make it right. Your trust and satisfaction are our top priorities.
          </p>
          <div class="flex flex-wrap justify-center gap-6 text-white/90">
            <div class="flex items-center gap-2">
              <CheckCircle class="w-5 h-5 text-primary-deep" />
              <span>Fast refund processing</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle class="w-5 h-5 text-primary-deep" />
              <span>No questions asked on quality issues</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle class="w-5 h-5 text-primary-deep" />
              <span>24/7 customer support</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-16 sm:py-24 bg-background">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          :initial="{ opacity: 0, y: 30 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.6 }"
          :viewport="{ once: true }"
          class="text-center mb-12"
        >
          <span class="text-primary-deep font-semibold text-sm uppercase tracking-wider">FAQ</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-foundation text-balance mt-2 mb-4">
            Frequently Asked Questions
          </h2>
          <p class="text-muted-foreground text-lg">
            Have questions? Find answers to common refund-related inquiries below.
          </p>
        </motion.div>
        
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

    <!-- Contact CTA Section -->
    <section class="py-16 sm:py-24 bg-muted/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          :initial="{ opacity: 0, y: 30 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.6 }"
          :viewport="{ once: true }"
          class="bg-card rounded-2xl p-8 sm:p-12 shadow-sm border border-border"
        >
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 class="text-3xl sm:text-4xl font-bold text-foundation text-balance mb-4">
                Still Have Questions?
              </h2>
              <p class="text-muted-foreground text-lg mb-6 leading-relaxed">
                Our customer support team is here to help. Whether you need help with a refund or have questions about our policy, we're just a message away.
              </p>
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-primary-deep/10 flex items-center justify-center">
                    <Phone class="w-5 h-5 text-primary-deep" />
                  </div>
                  <div>
                    <p class="font-semibold text-foundation">Phone</p>
                    <p class="text-sm text-muted-foreground">+254 700 123 456</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-primary-deep/10 flex items-center justify-center">
                    <Mail class="w-5 h-5 text-primary-deep" />
                  </div>
                  <div>
                    <p class="font-semibold text-foundation">Email</p>
                    <p class="text-sm text-muted-foreground">hello@yndu.co.ke</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-primary-deep/10 flex items-center justify-center">
                    <MapPin class="w-5 h-5 text-primary-deep" />
                  </div>
                  <div>
                    <p class="font-semibold text-foundation">Farm Location</p>
                    <p class="text-sm text-muted-foreground">Kibwezi, Makueni County</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-4 lg:justify-end">
              <button
                class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-deep text-white rounded-lg font-semibold hover:bg-primary-deep/90 transition-colors"
                @click="navigateTo('/contact')"
              >
                Contact Support
                <ArrowRight class="w-4 h-4" />
              </button>
              <button
                class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-card border border-border text-foundation rounded-lg font-semibold hover:bg-muted/50 transition-colors"
                @click="navigateTo('/')"
              >
                Back to Home
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  </div>
</template>
