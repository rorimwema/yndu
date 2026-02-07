<script setup lang="ts">
import { Sprout, Globe, Mail, Phone } from 'lucide-vue-next';
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
  <footer class="bg-flexoki border-t border-flexoki pt-16 pb-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <!-- Brand -->
        <div class="col-span-1">
          <div class="flex items-center gap-3 mb-6">
            <img 
              src="~/assets/images/yndu.svg" 
              alt="Yndu Logo" 
              class="h-8 w-auto"
            />
            <h1 class="text-lg font-bold text-flexoki">Yndu Marketplace</h1>
          </div>
          <p class="text-sm text-flexoki-muted mb-6">
            Bringing the finest Kibwezi produce directly to Kenyan homes since 2021.
          </p>
          <div class="flex gap-4">
            <a href="#" class="text-flexoki-muted hover:text-flexoki-primary transition-colors">
              <Globe :size="20" />
            </a>
            <a href="#" class="text-flexoki-muted hover:text-flexoki-primary transition-colors">
              <Mail :size="20" />
            </a>
            <a href="#" class="text-flexoki-muted hover:text-flexoki-primary transition-colors">
              <Phone :size="20" />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h6 class="font-bold mb-6 text-flexoki">Quick Links</h6>
          <ul class="space-y-4 text-sm">
            <li v-for="link in footerLinks.shop" :key="link.label">
              <NuxtLink :to="link.href" class="text-flexoki-muted hover:text-flexoki-primary transition-colors">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h6 class="font-bold mb-6 text-flexoki">Support</h6>
          <ul class="space-y-4 text-sm">
            <li v-for="link in footerLinks.support" :key="link.label">
              <NuxtLink :to="link.href" class="text-flexoki-muted hover:text-flexoki-primary transition-colors">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div>
          <h6 class="font-bold mb-6 text-flexoki">Newsletter</h6>
          <p class="text-sm text-flexoki-muted mb-4">Get seasonal recipes and farm updates.</p>
          <div class="flex gap-2">
            <input 
              type="email" 
              placeholder="Email address" 
              class="w-full bg-flexoki-50 dark:bg-white/10 border-none rounded-lg text-sm p-2 focus:ring-1 focus:ring-flexoki-primary outline-none"
            />
            <button class="bg-flexoki-primary text-flexoki-900 px-4 rounded-lg font-bold text-sm">Join</button>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-flexoki pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-xs text-flexoki-muted">© 2025 Yndu Marketplace. All rights reserved.</p>
        <div class="flex gap-6 text-xs text-flexoki-muted">
          <NuxtLink to="/privacy" class="hover:underline">Privacy Policy</NuxtLink>
          <NuxtLink to="/terms" class="hover:underline">Terms of Service</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
