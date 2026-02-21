<script setup lang="ts">
import { ref, computed } from 'vue';
import { motion } from 'motion-v';
import {
  Search, Plus, Package, AlertTriangle, RefreshCw, Edit3,
  TrendingUp, TrendingDown, Minus, CheckCircle, XCircle,
  BarChart3, Save, X,
} from 'lucide-vue-next';
import {
  DialogRoot, DialogPortal, DialogOverlay, DialogContent,
  DialogTitle, DialogDescription, DialogClose,
  TabsRoot, TabsList, TabsTrigger, TabsContent,
} from 'reka-ui';

useSeoMeta({ title: 'Inventory | Yndu Admin', description: 'Manage produce inventory, pricing, and stock levels' });
definePageMeta({ 
  layout: 'admin',
  middleware: 'admin-auth',
});

// ─── State ──────────────────────────────────────────────────
const searchQuery = ref('');
const selectedCategory = ref('all');
const showRestockModal = ref(false);
const showAddModal = ref(false);
const selectedItem = ref<any>(null);
const editingId = ref<string | null>(null);

const categories = [
  { id: 'all', label: 'All' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'herbs', label: 'Herbs' },
  { id: 'grains', label: 'Grains' },
];

const units = ['kg', 'bunch', 'head', 'dozen', 'piece', '2kg', '500g'];

// ─── Inventory — matches shop produce catalog ───────────────
const inventory = ref([
  { id: 'sukuma-wiki', name: 'Sukuma Wiki', nameEn: 'Collard Greens', category: 'vegetables', stock: 80, minStock: 40, unit: 'bunch', costPrice: 15, sellingPrice: 40, slots: 1, weight: 0.3, supplier: 'Kiambu Green Farms', trend: 'stable' as const },
  { id: 'tomatoes', name: 'Nyanya', nameEn: 'Tomatoes', category: 'vegetables', stock: 45, minStock: 20, unit: 'kg', costPrice: 80, sellingPrice: 150, slots: 2, weight: 1.0, supplier: 'Naivasha Farms', trend: 'down' as const },
  { id: 'spinach', name: 'Mchicha', nameEn: 'Spinach', category: 'vegetables', stock: 78, minStock: 30, unit: 'bunch', costPrice: 25, sellingPrice: 60, slots: 1, weight: 0.25, supplier: 'Kiambu Green Farms', trend: 'stable' as const },
  { id: 'cabbage', name: 'Kabichi', nameEn: 'Cabbage', category: 'vegetables', stock: 67, minStock: 20, unit: 'head', costPrice: 50, sellingPrice: 80, slots: 3, weight: 1.5, supplier: 'Limuru Fresh Produce', trend: 'stable' as const },
  { id: 'carrots', name: 'Karoti', nameEn: 'Carrots', category: 'vegetables', stock: 89, minStock: 25, unit: 'kg', costPrice: 60, sellingPrice: 120, slots: 2, weight: 1.0, supplier: 'Naivasha Farms', trend: 'up' as const },
  { id: 'mangoes', name: 'Maembe', nameEn: 'Mangoes', category: 'fruits', stock: 120, minStock: 40, unit: 'kg', costPrice: 150, sellingPrice: 250, slots: 3, weight: 1.0, supplier: 'Machakos Orchards', trend: 'up' as const },
  { id: 'bananas', name: 'Ndizi', nameEn: 'Bananas', category: 'fruits', stock: 200, minStock: 50, unit: 'dozen', costPrice: 60, sellingPrice: 100, slots: 2, weight: 1.5, supplier: 'Kisii Banana Farms', trend: 'stable' as const },
  { id: 'avocados', name: 'Parachichi', nameEn: 'Avocados', category: 'fruits', stock: 65, minStock: 30, unit: 'kg', costPrice: 120, sellingPrice: 180, slots: 2, weight: 1.0, supplier: "Murang'a Avocado Coop", trend: 'down' as const },
  { id: 'passion-fruit', name: 'Passion', nameEn: 'Passion Fruit', category: 'fruits', stock: 30, minStock: 15, unit: 'kg', costPrice: 130, sellingPrice: 200, slots: 2, weight: 0.5, supplier: 'Kibwezi Farm', trend: 'down' as const },
  { id: 'dhania', name: 'Dhania', nameEn: 'Coriander', category: 'herbs', stock: 45, minStock: 20, unit: 'bunch', costPrice: 10, sellingPrice: 30, slots: 1, weight: 0.1, supplier: 'Urban Herbs Kenya', trend: 'stable' as const },
  { id: 'mint', name: 'Mint', nameEn: 'Fresh Mint', category: 'herbs', stock: 35, minStock: 15, unit: 'bunch', costPrice: 15, sellingPrice: 40, slots: 1, weight: 0.1, supplier: 'Limuru Herbs', trend: 'up' as const },
  { id: 'maize-flour', name: 'Unga wa Mahindi', nameEn: 'Maize Flour', category: 'grains', stock: 50, minStock: 20, unit: '2kg', costPrice: 100, sellingPrice: 180, slots: 3, weight: 2.0, supplier: 'Kibwezi Mill', trend: 'stable' as const },
  { id: 'beans', name: 'Maharagwe', nameEn: 'Red Kidney Beans', category: 'grains', stock: 40, minStock: 15, unit: 'kg', costPrice: 140, sellingPrice: 220, slots: 2, weight: 1.0, supplier: 'Meru Farmers Coop', trend: 'stable' as const },
]);

// New item form
const newItem = ref({
  name: '', nameEn: '', category: 'vegetables', unit: 'kg',
  costPrice: 0, sellingPrice: 0, stock: 0, minStock: 10,
  slots: 1, weight: 1.0, supplier: '',
});

// ─── Computed ───────────────────────────────────────────────
const filteredInventory = computed(() => {
  let result = inventory.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(i => i.name.toLowerCase().includes(q) || i.nameEn.toLowerCase().includes(q));
  }
  if (selectedCategory.value !== 'all') result = result.filter(i => i.category === selectedCategory.value);
  return result;
});

const stats = computed(() => ({
  total: inventory.value.length,
  healthy: inventory.value.filter(i => i.stock > i.minStock).length,
  low: inventory.value.filter(i => i.stock > 0 && i.stock <= i.minStock).length,
  out: inventory.value.filter(i => i.stock === 0).length,
  value: inventory.value.reduce((s, i) => s + i.stock * i.costPrice, 0),
}));

const margin = (item: any) => Math.round(((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100);
const formatPrice = (p: number) => `KSh ${p.toLocaleString()}`;

const getStockColor = (item: any) => {
  if (item.stock === 0) return '#e74c3c';
  if (item.stock <= item.minStock) return 'var(--yndu-gold)';
  return 'var(--yndu-green)';
};

const getStockBadge = (item: any) => {
  if (item.stock === 0) return { label: 'Out', bg: 'bg-red-100 text-red-700' };
  if (item.stock <= item.minStock) return { label: 'Low', bg: 'bg-orange-100 text-orange-700' };
  return { label: 'OK', bg: 'bg-green-100 text-green-700' };
};

const getTrendIcon = (t: string) => t === 'up' ? TrendingUp : t === 'down' ? TrendingDown : Minus;
const getTrendColor = (t: string) => t === 'up' ? 'text-green-600' : t === 'down' ? 'text-red-500' : 'text-gray-400';

// ─── Actions ────────────────────────────────────────────────
const openRestock = (item: any) => {
  selectedItem.value = { ...item, restockQty: 20 };
  showRestockModal.value = true;
};

const restock = () => {
  if (!selectedItem.value) return;
  const item = inventory.value.find(i => i.id === selectedItem.value.id);
  if (item) {
    item.stock += selectedItem.value.restockQty;
    item.trend = 'up';
  }
  showRestockModal.value = false;
};

const startEdit = (id: string) => { editingId.value = id; };
const stopEdit = () => { editingId.value = null; };

const addItem = () => {
  if (!newItem.value.name || !newItem.value.nameEn) return;
  inventory.value.push({
    id: newItem.value.name.toLowerCase().replace(/\s+/g, '-'),
    ...newItem.value,
    trend: 'stable',
  });
  showAddModal.value = false;
  newItem.value = { name: '', nameEn: '', category: 'vegetables', unit: 'kg', costPrice: 0, sellingPrice: 0, stock: 0, minStock: 10, slots: 1, weight: 1.0, supplier: '' };
};

const inputClass = 'w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-sm bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep/40';
</script>

<template>
  <div class="min-h-dvh" style="background: var(--bg-canvas);">
    <div class="flex">
      <AdminDrawer active-section="inventory" />

      <main class="flex-1 min-w-0">
        <AdminTopBar :breadcrumb="['Pages', 'Inventory']" />

        <div class="p-4 lg:p-6 space-y-4 max-w-[1400px] mx-auto">

          <!-- Header -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 class="text-xl font-bold tracking-tight text-balance">Inventory</h1>
              <p class="text-xs text-muted-foreground">Produce catalog · Pricing · Stock levels</p>
            </div>
            <button
              @click="showAddModal = true"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors cursor-pointer"
              style="background: var(--yndu-green);"
            >
              <Plus class="size-4" /> Add Item
            </button>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div v-for="stat in [
              { label: 'Total', value: stats.total, icon: Package, color: 'var(--yndu-green)' },
              { label: 'Healthy', value: stats.healthy, icon: CheckCircle, color: '#27ae60' },
              { label: 'Low Stock', value: stats.low, icon: AlertTriangle, color: 'var(--yndu-gold)' },
              { label: 'Out', value: stats.out, icon: XCircle, color: '#e74c3c' },
              { label: 'Value', value: formatPrice(stats.value), icon: BarChart3, color: '#9b59b6' },
            ]" :key="stat.label" class="glass-card p-3 flex items-center gap-3">
              <div class="size-9 rounded-lg flex items-center justify-center" :style="{ background: `${stat.color}15` }">
                <component :is="stat.icon" class="size-4" :style="{ color: stat.color }" />
              </div>
              <div>
                <p class="text-lg font-bold tabular-nums">{{ stat.value }}</p>
                <p class="text-[10px] text-muted-foreground">{{ stat.label }}</p>
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="glass-card p-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <div class="relative flex-1 max-w-xs">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input v-model="searchQuery" type="text" placeholder="Search..." class="admin-search w-full" />
            </div>
            <div class="flex items-center gap-1 overflow-x-auto">
              <button
                v-for="cat in categories" :key="cat.id"
                class="admin-tab whitespace-nowrap" :class="{ active: selectedCategory === cat.id }"
                @click="selectedCategory = cat.id"
              >{{ cat.label }}</button>
            </div>
          </div>

          <!-- Inventory Table -->
          <div class="glass-card overflow-hidden">
            <div class="overflow-x-auto">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Cost / Sell</th>
                    <th>Unit</th>
                    <th>Margin</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Trend</th>
                    <th>Supplier</th>
                    <th class="w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in filteredInventory" :key="item.id">
                    <!-- Item name -->
                    <td>
                      <div>
                        <p class="font-medium text-sm">{{ item.name }}</p>
                        <p class="text-[10px] text-muted-foreground">{{ item.nameEn }}</p>
                      </div>
                    </td>

                    <!-- Category -->
                    <td>
                      <span class="text-xs capitalize text-muted-foreground">{{ item.category }}</span>
                    </td>

                    <!-- Cost / Selling price -->
                    <td>
                      <template v-if="editingId === item.id">
                        <div class="flex gap-1">
                          <input v-model.number="item.costPrice" type="number" class="w-16 px-1.5 py-1 rounded border border-neutral-200 text-xs tabular-nums" />
                          <input v-model.number="item.sellingPrice" type="number" class="w-16 px-1.5 py-1 rounded border border-neutral-200 text-xs tabular-nums" />
                        </div>
                      </template>
                      <template v-else>
                        <div class="text-xs tabular-nums">
                          <span class="text-muted-foreground">{{ item.costPrice }}</span>
                          <span class="mx-0.5 text-muted-foreground">/</span>
                          <span class="font-bold" style="color: var(--yndu-green);">{{ item.sellingPrice }}</span>
                        </div>
                      </template>
                    </td>

                    <!-- Unit -->
                    <td>
                      <template v-if="editingId === item.id">
                        <select v-model="item.unit" class="px-1.5 py-1 rounded border border-neutral-200 text-xs bg-white">
                          <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
                        </select>
                      </template>
                      <template v-else>
                        <span class="text-xs font-medium">{{ item.unit }}</span>
                      </template>
                    </td>

                    <!-- Margin -->
                    <td>
                      <span class="text-xs font-bold tabular-nums" :class="margin(item) > 40 ? 'text-green-600' : margin(item) > 20 ? 'text-orange-500' : 'text-red-500'">
                        {{ margin(item) }}%
                      </span>
                    </td>

                    <!-- Stock bar -->
                    <td>
                      <template v-if="editingId === item.id">
                        <input v-model.number="item.stock" type="number" class="w-14 px-1.5 py-1 rounded border border-neutral-200 text-xs tabular-nums" />
                      </template>
                      <template v-else>
                        <div class="w-24">
                          <div class="flex items-center justify-between text-[10px] mb-0.5">
                            <span class="font-bold tabular-nums">{{ item.stock }}</span>
                            <span class="text-muted-foreground">{{ item.unit }}</span>
                          </div>
                          <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div class="h-full rounded-full transition-all" :style="{ width: `${Math.min((item.stock / (item.minStock * 3)) * 100, 100)}%`, background: getStockColor(item) }" />
                          </div>
                        </div>
                      </template>
                    </td>

                    <!-- Status badge -->
                    <td>
                      <span :class="getStockBadge(item).bg" class="text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {{ getStockBadge(item).label }}
                      </span>
                    </td>

                    <!-- Trend -->
                    <td>
                      <div class="flex items-center gap-0.5" :class="getTrendColor(item.trend)">
                        <component :is="getTrendIcon(item.trend)" class="size-3" />
                      </div>
                    </td>

                    <!-- Supplier -->
                    <td>
                      <span class="text-[11px] text-muted-foreground truncate max-w-[100px] block">{{ item.supplier }}</span>
                    </td>

                    <!-- Actions -->
                    <td>
                      <div class="flex items-center gap-1">
                        <template v-if="editingId === item.id">
                          <button @click="stopEdit" class="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors cursor-pointer" aria-label="Save changes">
                            <Save class="size-3.5" />
                          </button>
                          <button @click="editingId = null" class="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer" aria-label="Cancel editing">
                            <X class="size-3.5" />
                          </button>
                        </template>
                        <template v-else>
                          <button @click="startEdit(item.id)" class="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer" aria-label="Edit item">
                            <Edit3 class="size-3.5 text-muted-foreground" />
                          </button>
                          <button @click="openRestock(item)" class="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer" aria-label="Restock item"
                            style="color: var(--yndu-green);"
                          >
                            <RefreshCw class="size-3.5" />
                          </button>
                        </template>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Restock Modal -->
    <DialogRoot v-model:open="showRestockModal">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 bg-black/40 z-50" />
        <DialogContent class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm glass-card p-5 z-50 rounded-2xl">
          <DialogTitle class="text-base font-bold mb-1">Restock {{ selectedItem?.name }}</DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground mb-4">Current: {{ selectedItem?.stock }} {{ selectedItem?.unit }}</DialogDescription>

          <div v-if="selectedItem" class="space-y-3">
            <div>
              <label class="text-[11px] font-medium mb-1 block">Quantity to add</label>
              <div class="flex items-center gap-2">
                <input v-model.number="selectedItem.restockQty" type="number" :class="inputClass" class="flex-1" />
                <span class="text-xs text-muted-foreground">{{ selectedItem.unit }}</span>
              </div>
            </div>
            <div class="flex justify-between p-2.5 rounded-lg text-xs" style="background: rgba(90, 120, 99, 0.05);">
              <span>Est. cost</span>
              <span class="font-bold" style="color: var(--yndu-green);">{{ formatPrice(selectedItem.restockQty * selectedItem.costPrice) }}</span>
            </div>
            <div class="flex gap-2">
              <DialogClose as-child>
                <button class="flex-1 py-2 rounded-lg border border-neutral-200 text-xs font-medium cursor-pointer">Cancel</button>
              </DialogClose>
              <button @click="restock" class="flex-1 py-2 rounded-lg text-white text-xs font-bold cursor-pointer" style="background: var(--yndu-green);">Restock</button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>

    <!-- Add Item Modal -->
    <DialogRoot v-model:open="showAddModal">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 bg-black/40 z-50" />
        <DialogContent class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass-card p-5 z-50 rounded-2xl">
          <DialogTitle class="text-base font-bold mb-1">Add Produce Item</DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground mb-4">This item will appear in the shop catalog</DialogDescription>

          <form @submit.prevent="addItem" class="space-y-3">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-[11px] font-medium mb-1 block">Swahili Name *</label>
                <input v-model="newItem.name" :class="inputClass" placeholder="e.g., Nyanya" />
              </div>
              <div>
                <label class="text-[11px] font-medium mb-1 block">English Name *</label>
                <input v-model="newItem.nameEn" :class="inputClass" placeholder="e.g., Tomatoes" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="text-[11px] font-medium mb-1 block">Category</label>
                <select v-model="newItem.category" :class="inputClass">
                  <option v-for="c in categories.slice(1)" :key="c.id" :value="c.id">{{ c.label }}</option>
                </select>
              </div>
              <div>
                <label class="text-[11px] font-medium mb-1 block">Unit</label>
                <select v-model="newItem.unit" :class="inputClass">
                  <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
                </select>
              </div>
              <div>
                <label class="text-[11px] font-medium mb-1 block">Weight (kg)</label>
                <input v-model.number="newItem.weight" type="number" step="0.1" :class="inputClass" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="text-[11px] font-medium mb-1 block">Cost Price</label>
                <input v-model.number="newItem.costPrice" type="number" :class="inputClass" placeholder="KSh" />
              </div>
              <div>
                <label class="text-[11px] font-medium mb-1 block">Selling Price</label>
                <input v-model.number="newItem.sellingPrice" type="number" :class="inputClass" placeholder="KSh" />
              </div>
              <div>
                <label class="text-[11px] font-medium mb-1 block">Box Slots</label>
                <input v-model.number="newItem.slots" type="number" min="1" max="5" :class="inputClass" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="text-[11px] font-medium mb-1 block">Initial Stock</label>
                <input v-model.number="newItem.stock" type="number" :class="inputClass" />
              </div>
              <div>
                <label class="text-[11px] font-medium mb-1 block">Min Stock</label>
                <input v-model.number="newItem.minStock" type="number" :class="inputClass" />
              </div>
              <div>
                <label class="text-[11px] font-medium mb-1 block">Supplier</label>
                <input v-model="newItem.supplier" :class="inputClass" placeholder="Farm name" />
              </div>
            </div>

            <div class="flex gap-2 pt-1">
              <DialogClose as-child>
                <button type="button" class="flex-1 py-2.5 rounded-lg border border-neutral-200 text-xs font-medium cursor-pointer">Cancel</button>
              </DialogClose>
              <button type="submit" class="flex-1 py-2.5 rounded-lg text-white text-xs font-bold cursor-pointer" style="background: var(--yndu-green);">Add Item</button>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>
