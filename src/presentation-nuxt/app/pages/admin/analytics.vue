<script setup lang="ts">
import { ref } from 'vue';
import { motion } from 'motion-v';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter
} from 'lucide-vue-next';
import { 
  AvatarRoot, 
  AvatarImage, 
  AvatarFallback,
  SelectRoot,
  SelectTrigger,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectValue
} from 'reka-ui';
import { ChevronDown, Check } from 'lucide-vue-next';

// Page meta
useSeoMeta({
  title: 'Analytics | Yndu Admin',
  description: 'View detailed analytics and insights for your Yndu store',
});

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
});

const selectedPeriod = ref('Last 30 days');

// Analytics metrics
const metrics = [
  {
    title: 'Total Revenue',
    value: 'KSh 12,450,000',
    change: '+12.5%',
    changeType: 'up' as const,
    subtitle: 'vs last month',
    icon: DollarSign,
  },
  {
    title: 'Orders',
    value: '3,156',
    change: '+8.2%',
    changeType: 'up' as const,
    subtitle: 'vs last month',
    icon: ShoppingCart,
  },
  {
    title: 'Customers',
    value: '1,847',
    change: '+23.1%',
    changeType: 'up' as const,
    subtitle: 'vs last month',
    icon: Users,
  },
  {
    title: 'Avg. Order Value',
    value: 'KSh 3,945',
    change: '-2.4%',
    changeType: 'down' as const,
    subtitle: 'vs last month',
    icon: TrendingUp,
  },
];

// Top selling products
const topProducts = [
  { name: 'Large Veggie Box', sales: 847, revenue: 'KSh 3,812,500', growth: '+15%' },
  { name: 'Family Box', sales: 623, revenue: 'KSh 2,179,050', growth: '+8%' },
  { name: 'Fruit Sampler', sales: 512, revenue: 'KSh 1,433,600', growth: '+22%' },
  { name: 'Medium Veggie Box', sales: 445, revenue: 'KSh 1,512,100', growth: '+5%' },
  { name: 'Fresh Herbs Pack', sales: 389, revenue: 'KSh 466,800', growth: '+31%' },
];

// Top customers
const topCustomers = [
  { 
    name: 'Serena Hotel',
    type: 'B2B',
    orders: 156,
    spent: 'KSh 1,245,000',
    avatar: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=40&h=40&fit=crop'
  },
  { 
    name: 'Safari Park Hotel',
    type: 'B2B',
    orders: 134,
    spent: 'KSh 987,500',
    avatar: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=40&h=40&fit=crop'
  },
  { 
    name: 'Java House HQ',
    type: 'B2B',
    orders: 98,
    spent: 'KSh 756,200',
    avatar: 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=40&h=40&fit=crop'
  },
  { 
    name: 'Grace Wambui',
    type: 'Consumer',
    orders: 67,
    spent: 'KSh 234,500',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
  },
  { 
    name: 'James Ochieng',
    type: 'Consumer',
    orders: 52,
    spent: 'KSh 182,000',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
  },
];

// Sales by category
const categoryData = [
  { name: 'Vegetables', value: 45, color: 'var(--yndu-green)' },
  { name: 'Fruits', value: 25, color: 'var(--yndu-gold)' },
  { name: 'Mixed Boxes', value: 20, color: '#3498db' },
  { name: 'Herbs', value: 10, color: '#9b59b6' },
];

// Sales by location
const locationData = [
  { city: 'Nairobi', orders: 1847, percentage: 58 },
  { city: 'Mombasa', orders: 523, percentage: 17 },
  { city: 'Kisumu', orders: 312, percentage: 10 },
  { city: 'Nakuru', orders: 234, percentage: 7 },
  { city: 'Other', orders: 240, percentage: 8 },
];
</script>

<template>
  <div class="min-h-dvh" style="background: var(--bg-canvas);">
    <div class="flex">
      <!-- Sidebar -->
      <AdminDrawer active-section="analytics" />

      <!-- Main Content -->
      <main class="flex-1 min-w-0">
        <!-- Top Bar -->
        <AdminTopBar :breadcrumb="['Pages', 'Analytics']" />

        <!-- Analytics Content -->
        <div class="p-6 lg:p-8 space-y-8 max-w-[1200px] mx-auto">
          <!-- Page Header -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold tracking-tight">Analytics</h1>
              <p class="text-muted-foreground">Track your store performance and insights.</p>
            </div>
            <div class="flex items-center gap-3">
              <SelectRoot v-model="selectedPeriod">
                <SelectTrigger
                  class="admin-search px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 min-w-[140px]"
                  aria-label="Select time period"
                >
                  <SelectValue placeholder="Select period" />
                  <ChevronDown class="size-4 text-muted-foreground ml-auto" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectContent
                    class="glass-card rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px]"
                    position="popper"
                    :side-offset="5"
                  >
                    <SelectViewport class="p-1">
                      <SelectItem
                        value="Last 7 days"
                        class="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors hover:bg-[var(--yndu-green)]/10 data-[highlighted]:bg-[var(--yndu-green)]/10 data-[state=checked]:bg-[var(--yndu-green)]/15 outline-none"
                      >
                        <Check class="size-4 invisible data-[state=checked]:visible" />
                        <SelectItemText>Last 7 days</SelectItemText>
                      </SelectItem>
                      <SelectItem
                        value="Last 30 days"
                        class="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors hover:bg-[var(--yndu-green)]/10 data-[highlighted]:bg-[var(--yndu-green)]/10 data-[state=checked]:bg-[var(--yndu-green)]/15 outline-none"
                      >
                        <Check class="size-4 invisible data-[state=checked]:visible" />
                        <SelectItemText>Last 30 days</SelectItemText>
                      </SelectItem>
                      <SelectItem
                        value="Last 90 days"
                        class="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors hover:bg-[var(--yndu-green)]/10 data-[highlighted]:bg-[var(--yndu-green)]/10 data-[state=checked]:bg-[var(--yndu-green)]/15 outline-none"
                      >
                        <Check class="size-4 invisible data-[state=checked]:visible" />
                        <SelectItemText>Last 90 days</SelectItemText>
                      </SelectItem>
                      <SelectItem
                        value="This year"
                        class="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors hover:bg-[var(--yndu-green)]/10 data-[highlighted]:bg-[var(--yndu-green)]/10 data-[state=checked]:bg-[var(--yndu-green)]/15 outline-none"
                      >
                        <Check class="size-4 invisible data-[state=checked]:visible" />
                        <SelectItemText>This year</SelectItemText>
                      </SelectItem>
                    </SelectViewport>
                  </SelectContent>
                </SelectPortal>
              </SelectRoot>
              <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass-card hover:bg-white/80 transition-colors">
                <Download class="size-4" />
                Export
              </button>
            </div>
          </div>

          <!-- Metrics Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <motion.div
              v-for="(metric, index) in metrics"
              :key="metric.title"
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.4, delay: index * 0.1 }"
              class="glass-card glass-card-hover p-5 cursor-pointer"
            >
              <div class="flex items-center justify-between mb-4">
                <div 
                  class="w-10 h-10 rounded-xl flex items-center justify-center"
                  style="background: rgba(90, 120, 99, 0.12);"
                >
                  <component :is="metric.icon" class="size-5" style="color: var(--yndu-green);" />
                </div>
                <div 
                  class="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold"
                  :class="metric.changeType === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  <ArrowUpRight v-if="metric.changeType === 'up'" class="size-3" />
                  <ArrowDownRight v-else class="size-3" />
                  {{ metric.change }}
                </div>
              </div>
              <p class="text-2xl font-bold mb-1">{{ metric.value }}</p>
              <p class="text-sm text-muted-foreground">{{ metric.title }}</p>
            </motion.div>
          </div>

          <!-- Charts Row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Revenue Chart -->
            <AdminChartCard
              title="Revenue Overview"
              :icon="LineChartIcon"
              :delay="4"
            >
              <!-- Placeholder line chart -->
              <div class="h-56 relative">
                <svg class="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color: var(--yndu-green); stop-opacity: 0.3" />
                      <stop offset="100%" style="stop-color: var(--yndu-green); stop-opacity: 0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 180 Q50 160 100 140 T200 100 T300 80 T400 40"
                    fill="none"
                    stroke="var(--yndu-green)"
                    stroke-width="3"
                    stroke-linecap="round"
                  />
                  <path
                    d="M0 180 Q50 160 100 140 T200 100 T300 80 T400 40 L400 200 L0 200 Z"
                    fill="url(#revenueGradient)"
                  />
                </svg>
              </div>
            </AdminChartCard>

            <!-- Orders Chart -->
            <AdminChartCard
              title="Orders by Day"
              :icon="BarChart3"
              :delay="5"
            />
          </div>

          <!-- Two Column Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Top Products -->
            <motion.div
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.4, delay: 0.6 }"
              class="glass-card overflow-hidden"
            >
              <div class="p-5 border-b" style="border-color: rgba(90, 120, 99, 0.1);">
                <h3 class="font-semibold text-lg">Top Selling Products</h3>
                <p class="text-sm text-muted-foreground">Best performers this month</p>
              </div>
              <div class="p-4 space-y-3">
                <div
                  v-for="(product, index) in topProducts"
                  :key="product.name"
                  class="flex items-center justify-between p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <div 
                      class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                      :style="{ 
                        background: index < 3 ? 'var(--yndu-gold)' : 'rgba(90, 120, 99, 0.15)',
                        color: index < 3 ? '#111' : 'var(--yndu-green)'
                      }"
                    >
                      {{ index + 1 }}
                    </div>
                    <div>
                      <p class="font-medium text-sm">{{ product.name }}</p>
                      <p class="text-xs text-muted-foreground">{{ product.sales }} sales</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-sm">{{ product.revenue }}</p>
                    <p class="text-xs text-green-600">{{ product.growth }}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <!-- Top Customers -->
            <motion.div
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.4, delay: 0.7 }"
              class="glass-card overflow-hidden"
            >
              <div class="p-5 border-b" style="border-color: rgba(90, 120, 99, 0.1);">
                <h3 class="font-semibold text-lg">Top Customers</h3>
                <p class="text-sm text-muted-foreground">Highest spending customers</p>
              </div>
              <div class="p-4 space-y-3">
                <div
                  v-for="customer in topCustomers"
                  :key="customer.name"
                  class="flex items-center justify-between p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <AvatarRoot class="w-10 h-10 rounded-full">
                      <AvatarImage :src="customer.avatar" :alt="customer.name" />
                      <AvatarFallback class="bg-[var(--yndu-green)] text-white text-sm">
                        {{ customer.name.charAt(0) }}
                      </AvatarFallback>
                    </AvatarRoot>
                    <div>
                      <p class="font-medium text-sm">{{ customer.name }}</p>
                      <p class="text-xs text-muted-foreground">{{ customer.orders }} orders</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-sm">{{ customer.spent }}</p>
                    <span 
                      class="text-xs px-2 py-0.5 rounded-full"
                      :class="customer.type === 'B2B' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'"
                    >
                      {{ customer.type }}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <!-- Bottom Row -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Sales by Category -->
            <motion.div
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.4, delay: 0.8 }"
              class="glass-card p-5"
            >
              <div class="flex items-center gap-3 mb-6">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background: rgba(90, 120, 99, 0.12);">
                  <PieChart class="size-4" style="color: var(--yndu-green);" />
                </div>
                <h3 class="font-semibold">Sales by Category</h3>
              </div>
              
              <!-- Simple donut representation -->
              <div class="flex items-center justify-center mb-6">
                <div class="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(90, 120, 99, 0.1)" stroke-width="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--yndu-green)" stroke-width="3" stroke-dasharray="45 55" stroke-linecap="round" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--yndu-gold)" stroke-width="3" stroke-dasharray="25 75" stroke-dashoffset="-45" stroke-linecap="round" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3498db" stroke-width="3" stroke-dasharray="20 80" stroke-dashoffset="-70" stroke-linecap="round" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#9b59b6" stroke-width="3" stroke-dasharray="10 90" stroke-dashoffset="-90" stroke-linecap="round" />
                  </svg>
                </div>
              </div>
              
              <div class="space-y-2">
                <div v-for="cat in categoryData" :key="cat.name" class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full" :style="{ background: cat.color }" />
                    <span class="text-sm">{{ cat.name }}</span>
                  </div>
                  <span class="text-sm font-medium">{{ cat.value }}%</span>
                </div>
              </div>
            </motion.div>

            <!-- Sales by Location -->
            <motion.div
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.4, delay: 0.9 }"
              class="glass-card p-5 lg:col-span-2"
            >
              <div class="flex items-center gap-3 mb-6">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background: rgba(90, 120, 99, 0.12);">
                  <BarChart3 class="size-4" style="color: var(--yndu-green);" />
                </div>
                <h3 class="font-semibold">Sales by Location</h3>
              </div>
              
              <div class="space-y-4">
                <div v-for="location in locationData" :key="location.city" class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="font-medium">{{ location.city }}</span>
                    <span class="text-muted-foreground">{{ location.orders.toLocaleString() }} orders ({{ location.percentage }}%)</span>
                  </div>
                  <div class="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      :initial="{ width: 0 }"
                      :animate="{ width: `${location.percentage}%` }"
                      :transition="{ duration: 0.6, delay: 1 }"
                      class="h-full rounded-full"
                      style="background: var(--yndu-green);"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
