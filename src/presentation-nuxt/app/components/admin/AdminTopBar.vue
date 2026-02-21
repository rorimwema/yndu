<script setup lang="ts">
import { Search, Bell, Settings } from 'lucide-vue-next';
import { AvatarRoot, AvatarImage, AvatarFallback } from 'reka-ui';

interface Props {
  breadcrumb?: string[];
}

withDefaults(defineProps<Props>(), {
  breadcrumb: () => ['Pages', 'Dashboard'],
});
</script>

<template>
  <header class="admin-topbar sticky top-0 z-30 px-6 py-4">
    <div class="flex items-center justify-between max-w-[1200px] mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm">
        <template v-for="(crumb, index) in breadcrumb" :key="crumb">
          <span 
            :class="index === breadcrumb.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'"
          >
            {{ crumb }}
          </span>
          <span v-if="index < breadcrumb.length - 1" class="text-muted-foreground">/</span>
        </template>
      </div>

      <!-- Search + Actions -->
      <div class="flex items-center gap-4">
        <!-- Search -->
        <div class="relative hidden sm:block">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            class="admin-search w-64"
          />
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button 
            class="relative p-2.5 rounded-xl hover:bg-accent transition-colors"
            aria-label="Notifications"
          >
            <Bell class="size-5 text-muted-foreground" />
            <span class="absolute top-2 right-2 w-2 h-2 bg-[var(--yndu-gold)] rounded-full" />
          </button>

          <button 
            class="p-2.5 rounded-xl hover:bg-accent transition-colors"
            aria-label="Settings"
          >
            <Settings class="size-5 text-muted-foreground" />
          </button>

          <AvatarRoot class="w-9 h-9 rounded-full bg-[var(--yndu-green)]/10 flex items-center justify-center cursor-pointer hover:ring-2 ring-[var(--yndu-green)]/20 transition-all">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="Admin" />
            <AvatarFallback class="text-[var(--yndu-green)] font-medium text-sm">JM</AvatarFallback>
          </AvatarRoot>
        </div>
      </div>
    </div>
  </header>
</template>
