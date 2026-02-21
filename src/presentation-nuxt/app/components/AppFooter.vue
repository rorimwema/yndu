<script setup lang="ts">
import { Globe, Mail, Phone } from 'lucide-vue-next';
const footerLinks = {
  shop: [
    { label: 'Shop All', href: '/shop' },
    { label: 'Subscriptions', href: '/subscription' },
    { label: 'Corporate Gifting', href: '/corporate' },
    { label: 'Our Farm Story', href: '/story' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Delivery Map', href: '/delivery' },
    { label: 'Refund Policy', href: '/refund' },
    { label: 'Contact Us', href: '/contact' },
  ],
};
</script>

<template>
  <footer class="bg-canvas border-t border-neutral-200 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
        <!-- Brand -->
        <div class="col-span-1">
          <div class="flex items-center gap-3 mb-6">
            <img 
              src="/yndu.svg" 
              alt="Yndu Logo" 
              class="h-8 w-auto"
              width="100"
              height="32"
            />
            <h1 class="text-lg font-serif text-primary-deep">Yndu Marketplace</h1>
          </div>
          <p class="text-sm text-neutral-400 mb-6 leading-relaxed">
            Bringing the finest Kibwezi produce directly to Kenyan homes since 2021.
          </p>
          <div class="flex gap-4">
            <a href="#" class="text-neutral-400 hover:text-primary-deep transition-colors duration-200 ease-in-out">
              <Globe :size="20" />
            </a>
            <a href="#" class="text-neutral-400 hover:text-primary-deep transition-colors duration-200 ease-in-out">
              <Mail :size="20" />
            </a>
            <a href="#" class="text-neutral-400 hover:text-primary-deep transition-colors duration-200 ease-in-out">
              <Phone :size="20" />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h6 class="font-sans font-semibold text-xs uppercase tracking-widest text-secondary-sage mb-6">Quick Links</h6>
          <ul class="space-y-4 text-sm">
            <li v-for="link in footerLinks.shop" :key="link.label">
              <NuxtLink :to="link.href" class="text-neutral-400 hover:text-primary-deep transition-colors duration-200 ease-in-out">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h6 class="font-sans font-semibold text-xs uppercase tracking-widest text-secondary-sage mb-6">Support</h6>
          <ul class="space-y-4 text-sm">
            <li v-for="link in footerLinks.support" :key="link.label">
              <NuxtLink :to="link.href" class="text-neutral-400 hover:text-primary-deep transition-colors duration-200 ease-in-out">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div>
          <h6 class="font-sans font-semibold text-xs uppercase tracking-widest text-secondary-sage mb-6">Newsletter</h6>
          <p class="text-sm text-neutral-400 mb-4">Get seasonal recipes and farm updates.</p>
          <div class="flex gap-2">
            <input 
              type="email" 
              placeholder="Email address" 
              class="w-full bg-neutral-50 dark:bg-white/10 border-none rounded text-sm p-2 focus:ring-1 focus:ring-primary-deep outline-none transition-all duration-200 ease-in-out"
            />
            <button class="bg-accent-clay hover:bg-primary-deep text-white px-4 rounded font-medium text-sm transition-colors duration-200 ease-in-out">Join</button>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-neutral-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-xs text-neutral-400">© 2025 Yndu Marketplace. All rights reserved.</p>
        <div class="flex gap-6 text-xs text-neutral-400">
          <NuxtLink to="/privacy" class="hover:underline hover:text-primary-deep transition-colors duration-200 ease-in-out">Privacy Policy</NuxtLink>
          <NuxtLink to="/terms" class="hover:underline hover:text-primary-deep transition-colors duration-200 ease-in-out">Terms of Service</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
