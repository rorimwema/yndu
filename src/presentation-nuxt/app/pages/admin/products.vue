<script setup lang="ts">
import { ref, computed } from 'vue';
import { motion, AnimatePresence } from 'motion-v';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Package,
  Tag,
  Image as ImageIcon,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Percent,
  Box,
  TrendingUp,
  DollarSign,
  Layers,
  Archive,
  Copy,
  Camera,
  X
} from 'lucide-vue-next';
import { 
  DialogRoot, 
  DialogPortal, 
  DialogOverlay, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  DialogClose,
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  SwitchRoot,
  SwitchThumb
} from 'reka-ui';

// Page meta
useSeoMeta({
  title: 'Products | Yndu Admin',
  description: 'Manage products, inventory, and pricing',
});

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
});

// State
const searchQuery = ref('');
const selectedCategory = ref('all');
const showAddModal = ref(false);
const showCampaignModal = ref(false);
const activeTab = ref('products');
const selectedProduct = ref<any>(null);

// Categories
const categories = ref([
  { id: 'all', label: 'All Products', count: 48 },
  { id: 'vegetables', label: 'Vegetables', count: 18 },
  { id: 'fruits', label: 'Fruits', count: 15 },
  { id: 'herbs', label: 'Herbs & Spices', count: 8 },
  { id: 'grains', label: 'Grains', count: 7 },
]);

// Products data
const products = ref([
  {
    id: 'PRD-001',
    name: 'Tomatoes',
    nameSw: 'Nyanya',
    category: 'vegetables',
    description: 'Fresh, ripe tomatoes from Naivasha farms',
    price: 150,
    discountPrice: null,
    discountPercent: 0,
    stock: 45,
    unit: 'kg',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1546470427-0d4db154cde8?w=200&h=200&fit=crop'],
    sku: 'VEG-TOM-001',
    featured: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'PRD-002',
    name: 'Spinach',
    nameSw: 'Mchicha',
    category: 'vegetables',
    description: 'Farm-fresh spinach bunches, freshly harvested',
    price: 80,
    discountPrice: 60,
    discountPercent: 25,
    stock: 78,
    unit: 'bunch',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop'],
    sku: 'VEG-SPI-002',
    featured: false,
    createdAt: '2024-02-20',
  },
  {
    id: 'PRD-003',
    name: 'Onions',
    nameSw: 'Vitunguu',
    category: 'vegetables',
    description: 'Red onions from Meru region',
    price: 120,
    discountPrice: null,
    discountPercent: 0,
    stock: 8,
    unit: 'kg',
    status: 'low-stock',
    images: ['https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=200&h=200&fit=crop'],
    sku: 'VEG-ONI-003',
    featured: false,
    createdAt: '2024-01-10',
  },
  {
    id: 'PRD-004',
    name: 'Mangoes',
    nameSw: 'Maembe',
    category: 'fruits',
    description: 'Sweet Apple mangoes from Machakos',
    price: 250,
    discountPrice: 200,
    discountPercent: 20,
    stock: 120,
    unit: 'kg',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&h=200&fit=crop'],
    sku: 'FRT-MNG-004',
    featured: true,
    createdAt: '2024-03-01',
  },
  {
    id: 'PRD-005',
    name: 'Bananas',
    nameSw: 'Ndizi',
    category: 'fruits',
    description: 'Sweet bananas, perfectly ripe',
    price: 100,
    discountPrice: null,
    discountPercent: 0,
    stock: 200,
    unit: 'dozen',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop'],
    sku: 'FRT-BAN-005',
    featured: false,
    createdAt: '2024-02-15',
  },
  {
    id: 'PRD-006',
    name: 'Kale (Sukuma Wiki)',
    nameSw: 'Sukuma Wiki',
    category: 'vegetables',
    description: 'Fresh, dark green kale bunches',
    price: 40,
    discountPrice: null,
    discountPercent: 0,
    stock: 0,
    unit: 'bunch',
    status: 'out-of-stock',
    images: ['https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=200&h=200&fit=crop'],
    sku: 'VEG-KAL-006',
    featured: false,
    createdAt: '2024-01-25',
  },
  {
    id: 'PRD-007',
    name: 'Coriander',
    nameSw: 'Dhania',
    category: 'herbs',
    description: 'Fresh coriander leaves for garnishing',
    price: 30,
    discountPrice: null,
    discountPercent: 0,
    stock: 45,
    unit: 'bunch',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=200&h=200&fit=crop'],
    sku: 'HRB-COR-007',
    featured: false,
    createdAt: '2024-03-10',
  },
  {
    id: 'PRD-008',
    name: 'Avocados',
    nameSw: 'Parachichi',
    category: 'fruits',
    description: 'Creamy Hass avocados from Murang\'a',
    price: 180,
    discountPrice: null,
    discountPercent: 0,
    stock: 65,
    unit: 'kg',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=200&h=200&fit=crop'],
    sku: 'FRT-AVO-008',
    featured: true,
    createdAt: '2024-02-28',
  },
]);

// Box campaigns
const campaigns = ref([
  {
    id: 'CMP-001',
    name: 'Weekly Veggie Box',
    description: 'Subscription box with seasonal vegetables',
    products: ['PRD-001', 'PRD-002', 'PRD-003', 'PRD-006'],
    originalPrice: 390,
    campaignPrice: 320,
    discount: 18,
    status: 'active',
    startDate: '2026-02-01',
    endDate: '2026-03-31',
    subscribers: 145,
  },
  {
    id: 'CMP-002',
    name: 'Fruit Lovers Bundle',
    description: 'Assorted fresh fruits for the family',
    products: ['PRD-004', 'PRD-005', 'PRD-008'],
    originalPrice: 530,
    campaignPrice: 449,
    discount: 15,
    status: 'active',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    subscribers: 89,
  },
  {
    id: 'CMP-003',
    name: 'Herb Garden Pack',
    description: 'Fresh herbs for cooking enthusiasts',
    products: ['PRD-007'],
    originalPrice: 30,
    campaignPrice: 25,
    discount: 17,
    status: 'draft',
    startDate: null,
    endDate: null,
    subscribers: 0,
  },
]);

// New product form
const newProduct = ref({
  name: '',
  nameSw: '',
  category: 'vegetables',
  description: '',
  price: 0,
  stock: 0,
  unit: 'kg',
  sku: '',
  featured: false,
});

// Computed
const filteredProducts = computed(() => {
  let result = products.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.nameSw.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query)
    );
  }

  if (selectedCategory.value !== 'all') {
    result = result.filter(p => p.category === selectedCategory.value);
  }

  return result;
});

const stats = computed(() => ({
  total: products.value.length,
  active: products.value.filter(p => p.status === 'active').length,
  lowStock: products.value.filter(p => p.status === 'low-stock').length,
  outOfStock: products.value.filter(p => p.status === 'out-of-stock').length,
  onSale: products.value.filter(p => p.discountPercent > 0).length,
}));

// Helpers
const formatPrice = (price: number) => `KSh ${price.toLocaleString()}`;

const getStatusConfig = (status: string) => {
  const config: Record<string, { label: string; class: string; icon: any }> = {
    'active': { label: 'Active', class: 'bg-green-100 text-green-700', icon: CheckCircle },
    'low-stock': { label: 'Low Stock', class: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
    'out-of-stock': { label: 'Out of Stock', class: 'bg-red-100 text-red-700', icon: XCircle },
    'draft': { label: 'Draft', class: 'bg-gray-100 text-gray-600', icon: Archive },
  };
  return config[status] || config.active;
};

const getCategoryLabel = (categoryId: string) => {
  const cat = categories.value.find(c => c.id === categoryId);
  return cat?.label || categoryId;
};

// Actions
const toggleStock = (productId: string) => {
  const product = products.value.find(p => p.id === productId);
  if (product) {
    if (product.status === 'out-of-stock') {
      product.status = 'active';
      product.stock = 50;
    } else {
      product.status = 'out-of-stock';
      product.stock = 0;
    }
  }
};

const applyDiscount = (productId: string, percent: number) => {
  const product = products.value.find(p => p.id === productId);
  if (product) {
    product.discountPercent = percent;
    product.discountPrice = Math.round(product.price * (1 - percent / 100));
  }
};

const removeDiscount = (productId: string) => {
  const product = products.value.find(p => p.id === productId);
  if (product) {
    product.discountPercent = 0;
    product.discountPrice = null;
  }
};

const openProductEdit = (product: any) => {
  selectedProduct.value = { ...product };
  showAddModal.value = true;
};

const duplicateProduct = (product: any) => {
  const newProd = {
    ...product,
    id: `PRD-${String(products.value.length + 1).padStart(3, '0')}`,
    name: `${product.name} (Copy)`,
    sku: `${product.sku}-COPY`,
  };
  products.value.push(newProd);
};
</script>

<template>
  <div class="min-h-dvh" style="background: var(--bg-canvas);">
    <div class="flex">
      <!-- Sidebar -->
      <AdminDrawer active-section="products" />

      <!-- Main Content -->
      <main class="flex-1 min-w-0">
        <!-- Top Bar -->
        <AdminTopBar :breadcrumb="['Pages', 'Products']" />

        <!-- Products Content -->
        <div class="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
          <!-- Page Header -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold tracking-tight">Product Management</h1>
              <p class="text-muted-foreground">Manage inventory, pricing, discounts, and campaigns.</p>
            </div>
            <div class="flex items-center gap-3">
              <button 
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass-card hover:bg-white/80 transition-colors"
                @click="showCampaignModal = true"
              >
                <Box class="size-4" />
                New Campaign
              </button>
              <button 
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors" 
                style="background: var(--yndu-green);"
                @click="selectedProduct = null; showAddModal = true"
              >
                <Plus class="size-4" />
                Add Product
              </button>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <motion.div
              v-for="(stat, index) in [
                { label: 'Total Products', value: stats.total, icon: Package, color: 'var(--yndu-green)' },
                { label: 'Active', value: stats.active, icon: CheckCircle, color: '#27ae60' },
                { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'var(--yndu-gold)' },
                { label: 'Out of Stock', value: stats.outOfStock, icon: XCircle, color: '#e74c3c' },
                { label: 'On Sale', value: stats.onSale, icon: Percent, color: '#9b59b6' },
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

          <!-- Tabs -->
          <TabsRoot v-model="activeTab" class="space-y-6">
            <TabsList class="flex items-center gap-1 p-1 rounded-xl w-fit" style="background: rgba(90, 120, 99, 0.08);">
              <TabsTrigger 
                value="products"
                class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm text-muted-foreground data-[state=active]:text-foreground"
              >
                <Package class="size-4" />
                Products
              </TabsTrigger>
              <TabsTrigger 
                value="campaigns"
                class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm text-muted-foreground data-[state=active]:text-foreground"
              >
                <Box class="size-4" />
                Box Campaigns
              </TabsTrigger>
            </TabsList>

            <!-- Products Tab -->
            <TabsContent value="products" class="space-y-4">
              <!-- Filters -->
              <motion.div
                :initial="{ opacity: 0, y: 20 }"
                :animate="{ opacity: 1, y: 0 }"
                :transition="{ delay: 0.5 }"
                class="glass-card p-4"
              >
                <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                  <!-- Search -->
                  <div class="relative flex-1 max-w-sm">
                    <Search class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Search products, SKU..."
                      class="admin-search w-full"
                    />
                  </div>

                  <!-- Category Filter -->
                  <div class="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      v-for="category in categories"
                      :key="category.id"
                      class="admin-tab whitespace-nowrap"
                      :class="{ active: selectedCategory === category.id }"
                      @click="selectedCategory = category.id"
                    >
                      {{ category.label }}
                      <span class="ml-1 opacity-60">({{ category.count }})</span>
                    </button>
                  </div>
                </div>
              </motion.div>

              <!-- Products Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <motion.div
                  v-for="(product, index) in filteredProducts"
                  :key="product.id"
                  :initial="{ opacity: 0, y: 20 }"
                  :while-in-view="{ opacity: 1, y: 0 }"
                  :viewport="{ once: true }"
                  :transition="{ delay: (index % 8) * 0.05 }"
                  class="glass-card glass-card-hover overflow-hidden group"
                >
                  <!-- Image -->
                  <div class="relative aspect-square bg-gray-100">
                    <NuxtImg :src="product.images[0]" :alt="product.name" class="w-full h-full object-cover" format="webp" sizes="48px" loading="lazy" />
                    
                    <!-- Badges -->
                    <div class="absolute top-2 left-2 flex flex-col gap-1">
                      <span
                        v-if="product.featured"
                        class="px-2 py-0.5 text-[10px] font-bold rounded"
                        style="background: var(--yndu-gold); color: white;"
                      >
                        FEATURED
                      </span>
                      <span
                        v-if="product.discountPercent > 0"
                        class="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500 text-white"
                      >
                        -{{ product.discountPercent }}%
                      </span>
                    </div>

                    <!-- Quick Actions -->
                    <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                      <button 
                        class="p-2 rounded-lg bg-white/90 hover:bg-white shadow-sm transition-colors"
                        @click="openProductEdit(product)"
                      >
                        <Edit class="size-4 text-gray-600" />
                      </button>
                      <button 
                        class="p-2 rounded-lg bg-white/90 hover:bg-white shadow-sm transition-colors"
                        @click="duplicateProduct(product)"
                      >
                        <Copy class="size-4 text-gray-600" />
                      </button>
                    </div>

                    <!-- Status Badge -->
                    <div class="absolute bottom-2 left-2">
                      <span 
                        :class="getStatusConfig(product.status).class"
                        class="px-2 py-1 text-xs font-medium rounded-lg flex items-center gap-1"
                      >
                        <component :is="getStatusConfig(product.status).icon" class="size-3" />
                        {{ getStatusConfig(product.status).label }}
                      </span>
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="p-4">
                    <div class="flex items-start justify-between mb-1">
                      <div>
                        <h3 class="font-semibold">{{ product.name }}</h3>
                        <p class="text-xs text-muted-foreground">{{ product.nameSw }} · {{ product.sku }}</p>
                      </div>
                    </div>

                    <p class="text-sm text-muted-foreground line-clamp-1 mb-3">{{ product.description }}</p>

                    <!-- Price -->
                    <div class="flex items-baseline gap-2 mb-3">
                      <span v-if="product.discountPrice" class="text-lg font-bold" style="color: var(--yndu-green);">
                        {{ formatPrice(product.discountPrice) }}
                      </span>
                      <span 
                        class="font-bold"
                        :class="product.discountPrice ? 'text-sm text-muted-foreground line-through' : 'text-lg'"
                        :style="!product.discountPrice ? { color: 'var(--yndu-green)' } : {}"
                      >
                        {{ formatPrice(product.price) }}
                      </span>
                      <span class="text-xs text-muted-foreground">/ {{ product.unit }}</span>
                    </div>

                    <!-- Stock -->
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm text-muted-foreground">Stock</span>
                      <span 
                        class="font-medium text-sm"
                        :class="product.stock <= 10 ? 'text-red-600' : product.stock <= 30 ? 'text-orange-500' : ''"
                      >
                        {{ product.stock }} {{ product.unit }}
                      </span>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2">
                      <button
                        v-if="product.discountPercent === 0"
                        class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                        style="background: rgba(155, 89, 182, 0.1); color: #9b59b6;"
                        @click="applyDiscount(product.id, 10)"
                      >
                        <Percent class="size-3" />
                        Add Discount
                      </button>
                      <button
                        v-else
                        class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                        style="background: rgba(231, 76, 60, 0.1); color: #e74c3c;"
                        @click="removeDiscount(product.id)"
                      >
                        <X class="size-3" />
                        Remove Discount
                      </button>
                      <button
                        class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                        :style="product.status === 'out-of-stock' 
                          ? { background: 'rgba(39, 174, 96, 0.1)', color: '#27ae60' }
                          : { background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' }"
                        @click="toggleStock(product.id)"
                      >
                        {{ product.status === 'out-of-stock' ? 'Restock' : 'Mark OOS' }}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>

              <!-- Empty State -->
              <div v-if="filteredProducts.length === 0" class="text-center py-16">
                <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style="background: rgba(90, 120, 99, 0.1);">
                  <Package class="size-8 text-muted-foreground" />
                </div>
                <h3 class="font-semibold text-lg mb-2">No products found</h3>
                <p class="text-muted-foreground">Try adjusting your search or filter criteria.</p>
              </div>
            </TabsContent>

            <!-- Campaigns Tab -->
            <TabsContent value="campaigns" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <motion.div
                  v-for="(campaign, index) in campaigns"
                  :key="campaign.id"
                  :initial="{ opacity: 0, y: 20 }"
                  :animate="{ opacity: 1, y: 0 }"
                  :transition="{ delay: 0.5 + index * 0.1 }"
                  class="glass-card p-5"
                >
                  <!-- Header -->
                  <div class="flex items-start justify-between mb-4">
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <h3 class="font-semibold">{{ campaign.name }}</h3>
                        <span 
                          :class="getStatusConfig(campaign.status).class"
                          class="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase"
                        >
                          {{ campaign.status }}
                        </span>
                      </div>
                      <p class="text-sm text-muted-foreground">{{ campaign.description }}</p>
                    </div>
                    <button class="p-1.5 rounded-lg hover:bg-accent transition-colors">
                      <MoreHorizontal class="size-4 text-muted-foreground" />
                    </button>
                  </div>

                  <!-- Products -->
                  <div class="flex -space-x-2 mb-4">
                    <div
                      v-for="productId in campaign.products.slice(0, 4)"
                      :key="productId"
                      class="w-10 h-10 rounded-lg border-2 border-white overflow-hidden"
                    >
                      <NuxtImg 
                        :src="image"
                        :alt="`Product ${index + 1}`"
                        class="w-full h-full object-cover"
                        format="webp"
                        sizes="96px"
                        loading="lazy"
                      />
                    </div>
                    <div
                      v-if="campaign.products.length > 4"
                      class="w-10 h-10 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium"
                    >
                      +{{ campaign.products.length - 4 }}
                    </div>
                  </div>

                  <!-- Pricing -->
                  <div class="flex items-baseline gap-2 mb-4">
                    <span class="text-xl font-bold" style="color: var(--yndu-green);">
                      {{ formatPrice(campaign.campaignPrice) }}
                    </span>
                    <span class="text-sm text-muted-foreground line-through">
                      {{ formatPrice(campaign.originalPrice) }}
                    </span>
                    <span class="px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-600">
                      -{{ campaign.discount }}%
                    </span>
                  </div>

                  <!-- Stats -->
                  <div class="grid grid-cols-2 gap-3 mb-4">
                    <div class="p-3 rounded-lg" style="background: rgba(90, 120, 99, 0.05);">
                      <p class="text-lg font-bold">{{ campaign.subscribers }}</p>
                      <p class="text-xs text-muted-foreground">Subscribers</p>
                    </div>
                    <div class="p-3 rounded-lg" style="background: rgba(90, 120, 99, 0.05);">
                      <p class="text-lg font-bold">{{ campaign.products.length }}</p>
                      <p class="text-xs text-muted-foreground">Products</p>
                    </div>
                  </div>

                  <!-- Duration -->
                  <div v-if="campaign.startDate" class="text-xs text-muted-foreground mb-4">
                    {{ new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
                    -
                    {{ new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
                  </div>

                  <!-- Actions -->
                  <div class="flex gap-2">
                    <button class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors" style="background: rgba(90, 120, 99, 0.1); color: var(--yndu-green);">
                      Edit Campaign
                    </button>
                    <button class="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent">
                      <Eye class="size-4" />
                    </button>
                  </div>
                </motion.div>

                <!-- Add Campaign Card -->
                <motion.div
                  :initial="{ opacity: 0, y: 20 }"
                  :animate="{ opacity: 1, y: 0 }"
                  :transition="{ delay: 0.5 + campaigns.length * 0.1 }"
                  class="glass-card p-5 border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--yndu-green)] hover:bg-[var(--yndu-green)]/5 transition-all min-h-[300px]"
                  style="border-color: rgba(90, 120, 99, 0.2);"
                  @click="showCampaignModal = true"
                >
                  <div class="w-14 h-14 rounded-full flex items-center justify-center mb-4" style="background: rgba(90, 120, 99, 0.1);">
                    <Plus class="size-6" style="color: var(--yndu-green);" />
                  </div>
                  <h3 class="font-medium mb-1">Create New Campaign</h3>
                  <p class="text-sm text-muted-foreground">Bundle products into promotional boxes</p>
                </motion.div>
              </div>
            </TabsContent>
          </TabsRoot>
        </div>
      </main>
    </div>

    <!-- Add/Edit Product Modal -->
    <DialogRoot v-model:open="showAddModal">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 bg-black/40 z-50" />
        <DialogContent class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg glass-card p-6 z-50 rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle class="text-lg font-semibold mb-1">
            {{ selectedProduct ? 'Edit Product' : 'Add New Product' }}
          </DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground mb-6">
            {{ selectedProduct ? 'Update product details and inventory.' : 'Add a new product to your catalog.' }}
          </DialogDescription>

          <div class="space-y-4">
            <!-- Image Upload -->
            <div class="border-2 border-dashed rounded-xl p-6 text-center" style="border-color: rgba(90, 120, 99, 0.2);">
              <Camera class="size-8 mx-auto mb-2 text-muted-foreground" />
              <p class="text-sm font-medium">Drop images here or click to upload</p>
              <p class="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
            </div>

            <!-- Name -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">Name (English)</label>
                <input
                  v-model="newProduct.name"
                  type="text"
                  placeholder="e.g. Tomatoes"
                  class="admin-search w-full"
                  style="padding-left: 16px;"
                />
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">Name (Swahili)</label>
                <input
                  v-model="newProduct.nameSw"
                  type="text"
                  placeholder="e.g. Nyanya"
                  class="admin-search w-full"
                  style="padding-left: 16px;"
                />
              </div>
            </div>

            <!-- Category & SKU -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">Category</label>
                <select v-model="newProduct.category" class="admin-search w-full" style="padding-left: 16px;">
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="herbs">Herbs & Spices</option>
                  <option value="grains">Grains</option>
                </select>
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">SKU</label>
                <input
                  v-model="newProduct.sku"
                  type="text"
                  placeholder="e.g. VEG-TOM-001"
                  class="admin-search w-full"
                  style="padding-left: 16px;"
                />
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="text-sm font-medium mb-2 block">Description</label>
              <textarea
                v-model="newProduct.description"
                rows="2"
                placeholder="Brief product description..."
                class="admin-search w-full resize-none"
                style="padding-left: 16px;"
              />
            </div>

            <!-- Price & Stock -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">Price (KSh)</label>
                <input
                  v-model.number="newProduct.price"
                  type="number"
                  placeholder="0"
                  class="admin-search w-full"
                  style="padding-left: 16px;"
                />
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">Stock</label>
                <input
                  v-model.number="newProduct.stock"
                  type="number"
                  placeholder="0"
                  class="admin-search w-full"
                  style="padding-left: 16px;"
                />
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">Unit</label>
                <select v-model="newProduct.unit" class="admin-search w-full" style="padding-left: 16px;">
                  <option value="kg">kg</option>
                  <option value="bunch">bunch</option>
                  <option value="piece">piece</option>
                  <option value="dozen">dozen</option>
                  <option value="crate">crate</option>
                </select>
              </div>
            </div>

            <!-- Featured -->
            <div class="flex items-center justify-between p-3 rounded-xl" style="background: rgba(90, 120, 99, 0.05);">
              <div>
                <p class="font-medium text-sm">Featured Product</p>
                <p class="text-xs text-muted-foreground">Show in featured collections</p>
              </div>
              <SwitchRoot
                v-model:checked="newProduct.featured"
                as-child
                class="w-11 h-6 rounded-full relative transition-colors data-[state=checked]:bg-[var(--yndu-green)] bg-gray-200"
              >
                <button
                  type="button"
                  role="switch"
                  :aria-checked="newProduct.featured"
                  class="w-full h-full relative"
                >
                  <SwitchThumb class="block w-5 h-5 bg-white rounded-full shadow transition-transform will-change-transform data-[state=checked]:translate-x-[22px] translate-x-0.5" />
                </button>
              </SwitchRoot>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <DialogClose as-child>
              <button class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border hover:bg-accent transition-colors" style="border-color: rgba(90, 120, 99, 0.15);">
                Cancel
              </button>
            </DialogClose>
            <button class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white" style="background: var(--yndu-green);">
              {{ selectedProduct ? 'Save Changes' : 'Add Product' }}
            </button>
          </div>

          <DialogClose as-child>
            <button class="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Close">
              <X class="size-5 text-muted-foreground" />
            </button>
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>

    <!-- Create Campaign Modal -->
    <DialogRoot v-model:open="showCampaignModal">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 bg-black/40 z-50" />
        <DialogContent class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass-card p-6 z-50 rounded-2xl">
          <DialogTitle class="text-lg font-semibold mb-1">Create Box Campaign</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground mb-6">
            Bundle products into a promotional box offer.
          </DialogDescription>

          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium mb-2 block">Campaign Name</label>
              <input
                type="text"
                placeholder="e.g. Summer Fruit Box"
                class="admin-search w-full"
                style="padding-left: 16px;"
              />
            </div>

            <div>
              <label class="text-sm font-medium mb-2 block">Description</label>
              <textarea
                rows="2"
                placeholder="Describe the campaign..."
                class="admin-search w-full resize-none"
                style="padding-left: 16px;"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">Start Date</label>
                <input
                  type="date"
                  class="admin-search w-full"
                  style="padding-left: 16px;"
                />
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">End Date</label>
                <input
                  type="date"
                  class="admin-search w-full"
                  style="padding-left: 16px;"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">Campaign Price</label>
                <input
                  type="number"
                  placeholder="0"
                  class="admin-search w-full"
                  style="padding-left: 16px;"
                />
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">Discount %</label>
                <input
                  type="number"
                  placeholder="0"
                  class="admin-search w-full"
                  style="padding-left: 16px;"
                />
              </div>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <DialogClose as-child>
              <button class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border hover:bg-accent transition-colors" style="border-color: rgba(90, 120, 99, 0.15);">
                Cancel
              </button>
            </DialogClose>
            <button class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white" style="background: var(--yndu-green);">
              Create Campaign
            </button>
          </div>

          <DialogClose as-child>
            <button class="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Close">
              <X class="size-5 text-muted-foreground" />
            </button>
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>
