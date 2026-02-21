<script setup lang="ts">
import { ref, computed } from 'vue';
import { motion } from 'motion-v';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  Building2,
  User,
  TrendingUp,
  Eye,
  Edit,
  Star
} from 'lucide-vue-next';
import { 
  AvatarRoot, 
  AvatarImage, 
  AvatarFallback,
  SwitchRoot,
  SwitchThumb,
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
  title: 'Customers | Yndu Admin',
  description: 'Manage individual and B2B customers',
});

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
});

// State
const searchQuery = ref('');
const customerType = ref<'all' | 'individual' | 'b2b'>('all');
const sortBy = ref('spent');

// Individual customers
const individualCustomers = ref([
  {
    id: 'CUS-001',
    type: 'individual',
    name: 'Sarah Njeri',
    email: 'sarah.njeri@gmail.com',
    phone: '+254 712 345 678',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    location: 'Kilimani, Nairobi',
    orders: 24,
    totalSpent: 87500,
    lastOrder: '2026-02-08',
    joinedAt: '2025-06-15',
    status: 'active',
    loyaltyTier: 'gold',
  },
  {
    id: 'CUS-002',
    type: 'individual',
    name: 'David Maina',
    email: 'dmaina@yahoo.com',
    phone: '+254 722 111 222',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    location: 'Westlands, Nairobi',
    orders: 15,
    totalSpent: 45200,
    lastOrder: '2026-02-07',
    joinedAt: '2025-09-20',
    status: 'active',
    loyaltyTier: 'silver',
  },
  {
    id: 'CUS-003',
    type: 'individual',
    name: 'Grace Wambui',
    email: 'grace.w@outlook.com',
    phone: '+254 733 444 555',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    location: 'Karen, Nairobi',
    orders: 42,
    totalSpent: 156800,
    lastOrder: '2026-02-09',
    joinedAt: '2024-11-10',
    status: 'active',
    loyaltyTier: 'platinum',
  },
  {
    id: 'CUS-004',
    type: 'individual',
    name: 'Peter Ochieng',
    email: 'peter.o@gmail.com',
    phone: '+254 744 666 777',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
    location: 'Lavington, Nairobi',
    orders: 8,
    totalSpent: 23400,
    lastOrder: '2026-01-28',
    joinedAt: '2025-12-01',
    status: 'inactive',
    loyaltyTier: 'bronze',
  },
  {
    id: 'CUS-005',
    type: 'individual',
    name: 'Lucy Achieng',
    email: 'lucy.achieng@gmail.com',
    phone: '+254 755 888 999',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
    location: 'South B, Nairobi',
    orders: 31,
    totalSpent: 98700,
    lastOrder: '2026-02-06',
    joinedAt: '2025-03-22',
    status: 'active',
    loyaltyTier: 'gold',
  },
]);

// B2B customers
const b2bCustomers = ref([
  {
    id: 'B2B-001',
    type: 'b2b',
    name: 'Serena Hotel',
    contactPerson: 'James Kamau',
    email: 'procurement@serena.co.ke',
    phone: '+254 20 284 2000',
    avatar: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=100&h=100&fit=crop',
    location: 'Kenyatta Avenue, Nairobi',
    businessType: 'Hotel',
    orders: 156,
    totalSpent: 2450000,
    lastOrder: '2026-02-09',
    joinedAt: '2024-01-15',
    status: 'active',
    paymentTerms: 'Net 30',
    kraPin: 'P051234567X',
  },
  {
    id: 'B2B-002',
    type: 'b2b',
    name: 'Java House HQ',
    contactPerson: 'Mary Wanjiku',
    email: 'supplies@javahouseafrica.com',
    phone: '+254 20 271 0234',
    avatar: 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=100&h=100&fit=crop',
    location: 'Mama Ngina Street, Nairobi',
    businessType: 'Restaurant Chain',
    orders: 234,
    totalSpent: 3890000,
    lastOrder: '2026-02-08',
    joinedAt: '2023-08-10',
    status: 'active',
    paymentTerms: 'Net 14',
    kraPin: 'P052345678Y',
  },
  {
    id: 'B2B-003',
    type: 'b2b',
    name: 'Nairobi Hospital',
    contactPerson: 'Dr. Francis Otieno',
    email: 'nutrition@nairobihospital.org',
    phone: '+254 20 284 5000',
    avatar: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&h=100&fit=crop',
    location: 'Argwings Kodhek Road, Nairobi',
    businessType: 'Hospital',
    orders: 89,
    totalSpent: 1560000,
    lastOrder: '2026-02-07',
    joinedAt: '2024-06-20',
    status: 'active',
    paymentTerms: 'Net 45',
    kraPin: 'P053456789Z',
  },
  {
    id: 'B2B-004',
    type: 'b2b',
    name: 'Brookhouse School',
    contactPerson: 'Susan Mwangi',
    email: 'catering@brookhouse.ac.ke',
    phone: '+254 20 603 3000',
    avatar: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=100&h=100&fit=crop',
    location: 'Karen, Nairobi',
    businessType: 'School',
    orders: 67,
    totalSpent: 890000,
    lastOrder: '2026-02-05',
    joinedAt: '2024-09-01',
    status: 'active',
    paymentTerms: 'LPO',
    kraPin: 'P054567890A',
  },
  {
    id: 'B2B-005',
    type: 'b2b',
    name: 'Safari Park Hotel',
    contactPerson: 'John Kariuki',
    email: 'kitchen@safaripark-hotel.com',
    phone: '+254 20 363 3000',
    avatar: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=100&h=100&fit=crop',
    location: 'Thika Road, Nairobi',
    businessType: 'Hotel',
    orders: 112,
    totalSpent: 1780000,
    lastOrder: '2026-02-09',
    joinedAt: '2024-03-15',
    status: 'active',
    paymentTerms: 'Net 30',
    kraPin: 'P055678901B',
  },
]);

// Computed
const allCustomers = computed(() => [...individualCustomers.value, ...b2bCustomers.value]);

const filteredCustomers = computed(() => {
  let result = customerType.value === 'all' 
    ? allCustomers.value 
    : customerType.value === 'individual' 
      ? individualCustomers.value 
      : b2bCustomers.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.location.toLowerCase().includes(query)
    );
  }

  // Sort
  if (sortBy.value === 'spent') {
    result = [...result].sort((a, b) => b.totalSpent - a.totalSpent);
  } else if (sortBy.value === 'orders') {
    result = [...result].sort((a, b) => b.orders - a.orders);
  } else if (sortBy.value === 'recent') {
    result = [...result].sort((a, b) => new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime());
  }

  return result;
});

const stats = computed(() => ({
  total: allCustomers.value.length,
  individual: individualCustomers.value.length,
  b2b: b2bCustomers.value.length,
  activeB2B: b2bCustomers.value.filter(c => c.status === 'active').length,
}));

// Helpers
const formatPrice = (price: number) => {
  if (price >= 1000000) {
    return `KSh ${(price / 1000000).toFixed(1)}M`;
  }
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(price).replace('KES', 'KSh');
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getLoyaltyColor = (tier: string) => {
  const colors: Record<string, string> = {
    platinum: 'bg-purple-100 text-purple-700',
    gold: 'bg-yellow-100 text-yellow-700',
    silver: 'bg-gray-100 text-gray-600',
    bronze: 'bg-orange-100 text-orange-700',
  };
  return colors[tier] || colors.bronze;
};
</script>

<template>
  <div class="min-h-dvh" style="background: var(--bg-canvas);">
    <div class="flex">
      <!-- Sidebar -->
      <AdminDrawer active-section="customers" />

      <!-- Main Content -->
      <main class="flex-1 min-w-0">
        <!-- Top Bar -->
        <AdminTopBar :breadcrumb="['Pages', 'Customers']" />

        <!-- Customers Content -->
        <div class="p-6 lg:p-8 space-y-6 max-w-[1200px] mx-auto">
          <!-- Page Header -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold tracking-tight">Customers</h1>
              <p class="text-muted-foreground">Manage individual and B2B customer accounts.</p>
            </div>
            <div class="flex items-center gap-3">
              <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass-card hover:bg-white/80 transition-colors">
                <Download class="size-4" />
                Export
              </button>
              <button class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors" style="background: var(--yndu-green);">
                <Plus class="size-4" />
                Add Customer
              </button>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <motion.div
              v-for="(stat, index) in [
                { label: 'Total Customers', value: stats.total, icon: User, color: 'var(--yndu-green)' },
                { label: 'Individuals', value: stats.individual, icon: User, color: '#3498db' },
                { label: 'B2B Accounts', value: stats.b2b, icon: Building2, color: 'var(--yndu-gold)' },
                { label: 'Active B2B', value: stats.activeB2B, icon: TrendingUp, color: '#27ae60' },
              ]"
              :key="stat.label"
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ delay: index * 0.1 }"
              class="glass-card p-4"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ background: `${stat.color}15` }">
                  <component :is="stat.icon" class="size-5" :style="{ color: stat.color }" />
                </div>
                <div>
                  <p class="text-2xl font-bold">{{ stat.value }}</p>
                  <p class="text-xs text-muted-foreground">{{ stat.label }}</p>
                </div>
              </div>
            </motion.div>
          </div>

          <!-- Filters -->
          <motion.div
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.4 }"
            class="glass-card p-4"
          >
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
              <!-- Search -->
              <div class="relative flex-1 max-w-sm">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search customers..."
                  class="admin-search w-full"
                />
              </div>

              <!-- Type Toggle -->
              <div class="flex items-center gap-2 p-1 rounded-xl" style="background: rgba(90, 120, 99, 0.08);">
                <button
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  :class="customerType === 'all' ? 'bg-white shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                  @click="customerType = 'all'"
                >
                  All
                </button>
                <button
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  :class="customerType === 'individual' ? 'bg-white shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                  @click="customerType = 'individual'"
                >
                  <User class="size-4" />
                  Individual
                </button>
                <button
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  :class="customerType === 'b2b' ? 'bg-white shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                  @click="customerType = 'b2b'"
                >
                  <Building2 class="size-4" />
                  B2B
                </button>
              </div>

              <!-- Sort -->
              <SelectRoot v-model="sortBy">
                <SelectTrigger
                  class="admin-search px-4 py-2 text-sm flex items-center gap-2 min-w-[160px]"
                  aria-label="Sort by"
                >
                  <SelectValue placeholder="Sort by..." />
                  <ChevronDown class="size-4 text-muted-foreground ml-auto" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectContent
                    class="glass-card rounded-xl shadow-lg overflow-hidden z-50 min-w-[160px]"
                    position="popper"
                    :side-offset="5"
                  >
                    <SelectViewport class="p-1">
                      <SelectItem
                        value="spent"
                        class="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors hover:bg-[var(--yndu-green)]/10 data-[highlighted]:bg-[var(--yndu-green)]/10 data-[state=checked]:bg-[var(--yndu-green)]/15 outline-none"
                      >
                        <Check class="size-4 invisible data-[state=checked]:visible" />
                        <SelectItemText>Highest Spend</SelectItemText>
                      </SelectItem>
                      <SelectItem
                        value="orders"
                        class="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors hover:bg-[var(--yndu-green)]/10 data-[highlighted]:bg-[var(--yndu-green)]/10 data-[state=checked]:bg-[var(--yndu-green)]/15 outline-none"
                      >
                        <Check class="size-4 invisible data-[state=checked]:visible" />
                        <SelectItemText>Most Orders</SelectItemText>
                      </SelectItem>
                      <SelectItem
                        value="recent"
                        class="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors hover:bg-[var(--yndu-green)]/10 data-[highlighted]:bg-[var(--yndu-green)]/10 data-[state=checked]:bg-[var(--yndu-green)]/15 outline-none"
                      >
                        <Check class="size-4 invisible data-[state=checked]:visible" />
                        <SelectItemText>Recent Activity</SelectItemText>
                      </SelectItem>
                    </SelectViewport>
                  </SelectContent>
                </SelectPortal>
              </SelectRoot>
            </div>
          </motion.div>

          <!-- Customer Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <motion.div
              v-for="(customer, index) in filteredCustomers"
              :key="customer.id"
              :initial="{ opacity: 0, y: 20 }"
              :while-in-view="{ opacity: 1, y: 0 }"
              :viewport="{ once: true }"
              :transition="{ delay: (index % 6) * 0.05 }"
              class="glass-card glass-card-hover p-5 cursor-pointer"
            >
              <!-- Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <AvatarRoot class="w-12 h-12 rounded-xl">
                    <AvatarImage :src="customer.avatar" :alt="customer.name" />
                    <AvatarFallback 
                      class="text-white font-medium"
                      :style="{ background: customer.type === 'b2b' ? 'var(--yndu-gold)' : 'var(--yndu-green)' }"
                    >
                      {{ customer.name.charAt(0) }}
                    </AvatarFallback>
                  </AvatarRoot>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="font-semibold">{{ customer.name }}</h3>
                      <span
                        v-if="customer.type === 'b2b'"
                        class="px-1.5 py-0.5 text-[10px] font-bold rounded"
                        style="background: rgba(244, 153, 26, 0.15); color: var(--yndu-gold);"
                      >
                        B2B
                      </span>
                    </div>
                    <p class="text-sm text-muted-foreground">
                      {{ customer.type === 'b2b' ? (customer as any).businessType : customer.email }}
                    </p>
                  </div>
                </div>
                <button class="p-1.5 rounded-lg hover:bg-accent transition-colors">
                  <MoreHorizontal class="size-4 text-muted-foreground" />
                </button>
              </div>

              <!-- Stats -->
              <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="p-3 rounded-xl" style="background: rgba(90, 120, 99, 0.05);">
                  <p class="text-lg font-bold">{{ customer.orders }}</p>
                  <p class="text-xs text-muted-foreground">Orders</p>
                </div>
                <div class="p-3 rounded-xl" style="background: rgba(90, 120, 99, 0.05);">
                  <p class="text-lg font-bold">{{ formatPrice(customer.totalSpent) }}</p>
                  <p class="text-xs text-muted-foreground">Total Spent</p>
                </div>
              </div>

              <!-- Details -->
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2 text-muted-foreground">
                  <MapPin class="size-3.5" />
                  <span>{{ customer.location }}</span>
                </div>
                <div class="flex items-center gap-2 text-muted-foreground">
                  <Phone class="size-3.5" />
                  <span>{{ customer.phone }}</span>
                </div>
                <div class="flex items-center gap-2 text-muted-foreground">
                  <Calendar class="size-3.5" />
                  <span>Last order: {{ formatDate(customer.lastOrder) }}</span>
                </div>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between mt-4 pt-4 border-t" style="border-color: rgba(90, 120, 99, 0.1);">
                <template v-if="customer.type === 'individual'">
                  <span
                    class="px-2 py-1 rounded-lg text-xs font-medium capitalize"
                    :class="getLoyaltyColor((customer as any).loyaltyTier)"
                  >
                    <Star class="size-3 inline mr-1" />
                    {{ (customer as any).loyaltyTier }}
                  </span>
                </template>
                <template v-else>
                  <span class="text-xs text-muted-foreground">
                    {{ (customer as any).paymentTerms }}
                  </span>
                </template>
                <div class="flex items-center gap-1">
                  <button class="p-2 rounded-lg hover:bg-accent transition-colors" title="View">
                    <Eye class="size-4 text-muted-foreground" />
                  </button>
                  <button class="p-2 rounded-lg hover:bg-accent transition-colors" title="Edit">
                    <Edit class="size-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredCustomers.length === 0" class="text-center py-16">
            <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style="background: rgba(90, 120, 99, 0.1);">
              <User class="size-8 text-muted-foreground" />
            </div>
            <h3 class="font-semibold text-lg mb-2">No customers found</h3>
            <p class="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>

          <!-- Pagination -->
          <div v-if="filteredCustomers.length > 0" class="flex items-center justify-between">
            <p class="text-sm text-muted-foreground">
              Showing {{ filteredCustomers.length }} customers
            </p>
            <div class="flex items-center gap-1">
              <button class="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-accent transition-colors">
                Previous
              </button>
              <button class="px-3 py-1.5 text-sm font-medium rounded-lg" style="background: var(--yndu-green); color: white;">
                1
              </button>
              <button class="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-accent transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
