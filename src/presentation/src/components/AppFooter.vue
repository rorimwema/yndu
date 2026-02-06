<script setup lang="ts">
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
  <footer class="bg-flexoki-paper border-t border-flexoki pt-16 pb-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <!-- Brand -->
        <div class="col-span-1">
          <div class="flex items-center gap-3 mb-6">
            <img 
              src="@/assets/images/yndu.webp" 
              alt="Yndu Logo" 
              class="h-6 w-auto"
            />
            <span class="text-lg font-bold text-flexoki">Yndu Marketplace</span>
          </div>
          <p class="text-sm text-flexoki-muted mb-6">
            Bringing the finest Kibwezi produce directly to Kenyan homes since 2021.
          </p>
          <div class="flex gap-4">
            <a href="#" class="text-flexoki-muted hover:text-flexoki-primary transition-colors">🌐</a>
            <a href="#" class="text-flexoki-muted hover:text-flexoki-primary transition-colors">✉️</a>
            <a href="#" class="text-flexoki-muted hover:text-flexoki-primary transition-colors">📞</a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h6 class="font-bold mb-6 text-flexoki">Quick Links</h6>
          <ul class="space-y-4 text-sm">
            <li v-for="link in footerLinks.shop" :key="link.label">
              <router-link :to="link.href" class="text-flexoki-muted hover:text-flexoki-primary transition-colors">
                {{ link.label }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h6 class="font-bold mb-6 text-flexoki">Support</h6>
          <ul class="space-y-4 text-sm">
            <li v-for="link in footerLinks.support" :key="link.label">
              <router-link :to="link.href" class="text-flexoki-muted hover:text-flexoki-primary transition-colors">
                {{ link.label }}
              </router-link>
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
              class="input-flexoki flex-1 text-sm"
            />
            <button class="btn-primary px-4 text-sm">Join</button>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-flexoki pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-xs text-flexoki-muted">© 2025 Yndu Marketplace. All rights reserved.</p>
        <div class="flex gap-6 text-xs text-flexoki-muted">
          <router-link to="/privacy" class="hover:underline">Privacy Policy</router-link>
          <router-link to="/terms" class="hover:underline">Terms of Service</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>
