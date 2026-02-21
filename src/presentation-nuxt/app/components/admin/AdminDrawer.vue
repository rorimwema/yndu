<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  LayoutDashboard,
  Truck,
  Package,
  Users,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ChevronDown,
  BarChart3,
  MapPin,
  ShoppingBag,
  Boxes,
  CreditCard,
  UserCog
} from 'lucide-vue-next';
import { motion, AnimatePresence } from 'motion-v';
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  AvatarRoot,
  AvatarImage,
  AvatarFallback,
} from 'reka-ui';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  badge?: number;
  children?: { id: string; label: string; href: string }[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const props = defineProps<{
  activeSection?: string;
}>();

const isMobileMenuOpen = ref(false);
const expandedSections = ref<string[]>(['logistics']);

const navGroups = computed<NavGroup[]>(() => [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    ],
  },
  {
    label: 'Management',
    items: [
      { id: 'orders', label: 'Orders', icon: Package, href: '/admin/orders', badge: 12 },
      { id: 'customers', label: 'Customers', icon: Users, href: '/admin/customers' },
      { id: 'products', label: 'Products', icon: ShoppingBag, href: '/admin/products' },
      { id: 'inventory', label: 'Inventory', icon: Boxes, href: '/admin/inventory' },
    ],
  },
  {
    label: 'Logistics',
    items: [
      {
        id: 'logistics',
        label: 'Deliveries',
        icon: Truck,
        href: '/admin/logistics',
        badge: 8,
        children: [
          { id: 'dispatch', label: 'Dispatch', href: '/admin/logistics#dispatch' },
          { id: 'fleet', label: 'Fleet', href: '/admin/logistics#fleet' },
          { id: 'tracking', label: 'Tracking', href: '/admin/logistics#tracking' },
        ],
      },
      { id: 'locations', label: 'Locations', icon: MapPin, href: '/admin/locations' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { id: 'settings', label: 'Store Settings', icon: Settings, href: '/admin/settings' },
      { id: 'team', label: 'Team', icon: UserCog, href: '/admin/team' },
      { id: 'billing', label: 'Billing', icon: CreditCard, href: '/admin/billing' },
    ],
  },
]);

const toggleSection = (sectionId: string) => {
  const index = expandedSections.value.indexOf(sectionId);
  if (index === -1) {
    expandedSections.value.push(sectionId);
  } else {
    expandedSections.value.splice(index, 1);
  }
};

const isSectionExpanded = (sectionId: string) => expandedSections.value.includes(sectionId);

const handleNavigation = (href: string) => {
  navigateTo(href);
  isMobileMenuOpen.value = false;
};

const isActive = (itemId: string) => props.activeSection === itemId;
</script>

<template>
  <!-- Desktop Sidebar -->
  <aside class="hidden lg:flex flex-col admin-sidebar h-dvh sticky top-0 z-40">
    <!-- Logo -->
    <div class="h-16 flex items-center px-5 border-b border-white/5">
      <NuxtLink to="/admin" class="flex items-center gap-3">
        <img 
          src="/yndu.svg" 
          alt="Yndu" 
          class="w-9 h-9"
        />
        <span class="font-bold text-lg text-white/90">Yndu Admin</span>
      </NuxtLink>
    </div>

    <!-- Store Selector -->
    <div class="px-4 py-3 border-b border-white/5">
      <button class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background: var(--yndu-green);">
            <ShoppingBag class="size-3.5 text-white" />
          </div>
          <span class="text-sm font-medium text-white/80">Yndu Store</span>
        </div>
        <ChevronDown class="size-4 text-white/50" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-6">
      <div v-for="group in navGroups" :key="group.label">
        <p class="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
          {{ group.label }}
        </p>
        <div class="space-y-1">
          <template v-for="item in group.items" :key="item.id">
            <!-- Item with children -->
            <div v-if="item.children">
              <button
                class="admin-sidebar-nav-item w-full relative"
                :class="{ active: isActive(item.id) }"
                @click="toggleSection(item.id)"
              >
                <component :is="item.icon" class="size-5" />
                <span class="flex-1 text-left">{{ item.label }}</span>
                <span
                  v-if="item.badge"
                  class="px-2 py-0.5 text-xs rounded-full"
                  style="background: var(--yndu-gold); color: #111;"
                >
                  {{ item.badge }}
                </span>
                <motion.span :animate="{ rotate: isSectionExpanded(item.id) ? 90 : 0 }">
                  <ChevronRight class="size-4" />
                </motion.span>
              </button>

              <!-- Submenu -->
              <AnimatePresence>
                <motion.div
                  v-if="isSectionExpanded(item.id)"
                  :initial="{ height: 0, opacity: 0 }"
                  :animate="{ height: 'auto', opacity: 1 }"
                  :exit="{ height: 0, opacity: 0 }"
                  class="overflow-hidden ml-4 pl-4 border-l border-white/10 space-y-1 mt-1"
                >
                  <button
                    v-for="child in item.children"
                    :key="child.id"
                    class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors"
                    @click="handleNavigation(child.href)"
                  >
                    {{ child.label }}
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>

            <!-- Regular item -->
            <button
              v-else
              class="admin-sidebar-nav-item w-full relative"
              :class="{ active: isActive(item.id) }"
              @click="handleNavigation(item.href)"
            >
              <component :is="item.icon" class="size-5" />
              <span class="flex-1 text-left">{{ item.label }}</span>
              <span
                v-if="item.badge"
                class="px-2 py-0.5 text-xs rounded-full"
                style="background: var(--yndu-gold); color: #111;"
              >
                {{ item.badge }}
              </span>
            </button>
          </template>
        </div>
      </div>
    </nav>

    <!-- User Profile Footer -->
    <div class="p-4 border-t border-white/5">
      <div class="flex items-center gap-3 px-2 py-2">
        <AvatarRoot class="w-10 h-10 rounded-full">
          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="Admin" />
          <AvatarFallback class="bg-[var(--yndu-green)] text-white font-medium">JM</AvatarFallback>
        </AvatarRoot>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm text-white/90 truncate">James Mwangi</p>
          <p class="text-xs text-white/50 truncate">admin@yndu.ke</p>
        </div>
        <button class="p-2 rounded-lg text-white/50 hover:text-white/90 hover:bg-white/5 transition-colors">
          <LogOut class="size-4" />
        </button>
      </div>
    </div>
  </aside>

  <!-- Mobile Header -->
  <header class="lg:hidden sticky top-0 z-50 admin-topbar">
    <div class="flex items-center justify-between h-14 px-4">
      <div class="flex items-center gap-3">
        <button
          class="p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-accent"
          @click="isMobileMenuOpen = true"
        >
          <Menu class="size-5" />
        </button>
        <div class="flex items-center gap-2">
          <img src="/yndu.svg" alt="Yndu" class="w-7 h-7" width="28" height="28" />
          <span class="font-bold">Yndu Admin</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button class="relative p-2 rounded-lg text-muted-foreground hover:bg-accent">
          <Bell class="size-5" />
          <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style="background: var(--yndu-gold);" />
        </button>
      </div>
    </div>
  </header>

  <!-- Mobile Drawer -->
  <DialogRoot v-model:open="isMobileMenuOpen">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 bg-black/50 z-50 lg:hidden" />
      <DialogContent
        class="fixed left-0 top-0 bottom-0 w-[280px] admin-sidebar z-50 lg:hidden outline-none"
        :trap-focus="true"
      >
        <DialogTitle class="sr-only">Navigation Menu</DialogTitle>
        <DialogDescription class="sr-only">Main navigation menu</DialogDescription>
        
        <div class="flex flex-col h-full">
          <!-- Mobile Drawer Header -->
          <div class="h-14 flex items-center justify-between px-4 border-b border-white/5">
            <NuxtLink to="/admin" class="flex items-center gap-2" @click="isMobileMenuOpen = false">
              <img src="/yndu.svg" alt="Yndu" class="w-7 h-7" width="28" height="28" />
              <span class="font-bold text-white/90">Yndu Admin</span>
            </NuxtLink>
            <button
              class="p-2 -mr-2 rounded-lg text-white/60 hover:bg-white/5"
              @click="isMobileMenuOpen = false"
            >
              <X class="size-5" />
            </button>
          </div>

          <!-- Mobile Navigation -->
          <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            <div v-for="group in navGroups" :key="group.label">
              <p class="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                {{ group.label }}
              </p>
              <div class="space-y-1">
                <template v-for="item in group.items" :key="item.id">
                  <div v-if="item.children">
                    <button
                      class="admin-sidebar-nav-item w-full"
                      :class="{ active: isActive(item.id) }"
                      @click="toggleSection(item.id)"
                    >
                      <component :is="item.icon" class="size-5" />
                      <span class="flex-1 text-left">{{ item.label }}</span>
                      <motion.span :animate="{ rotate: isSectionExpanded(item.id) ? 90 : 0 }">
                        <ChevronRight class="size-4" />
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      <motion.div
                        v-if="isSectionExpanded(item.id)"
                        :initial="{ height: 0, opacity: 0 }"
                        :animate="{ height: 'auto', opacity: 1 }"
                        :exit="{ height: 0, opacity: 0 }"
                        class="overflow-hidden ml-4 pl-4 border-l border-white/10 space-y-1 mt-1"
                      >
                        <button
                          v-for="child in item.children"
                          :key="child.id"
                          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors"
                          @click="handleNavigation(child.href)"
                        >
                          {{ child.label }}
                        </button>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <button
                    v-else
                    class="admin-sidebar-nav-item w-full"
                    :class="{ active: isActive(item.id) }"
                    @click="handleNavigation(item.href)"
                  >
                    <component :is="item.icon" class="size-5" />
                    <span class="flex-1 text-left">{{ item.label }}</span>
                  </button>
                </template>
              </div>
            </div>
          </nav>

          <!-- Mobile Drawer Footer -->
          <div class="p-4 border-t border-white/5 space-y-3">
            <div class="flex items-center gap-3">
              <AvatarRoot class="w-10 h-10 rounded-full">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="Admin" />
                <AvatarFallback class="bg-[var(--yndu-green)] text-white font-medium">JM</AvatarFallback>
              </AvatarRoot>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm text-white/90 truncate">James Mwangi</p>
                <p class="text-xs text-white/50 truncate">admin@yndu.ke</p>
              </div>
            </div>
            <button class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut class="size-4" />
              Sign Out
            </button>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
