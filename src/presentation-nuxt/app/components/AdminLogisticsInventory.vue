<script setup lang="ts">
import { ref, computed } from 'vue';
import { Package, AlertTriangle, TrendingDown, Plus } from 'lucide-vue-next';

interface InventoryItem {
  name: string;
  current: number;
  max: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

const items = ref<InventoryItem[]>([
  { name: 'Tomatoes', current: 45, max: 100, unit: 'kg', trend: 'down' },
  { name: 'Spinach', current: 78, max: 100, unit: 'bunches', trend: 'stable' },
  { name: 'Onions', current: 23, max: 100, unit: 'kg', trend: 'down' },
  { name: 'Carrots', current: 89, max: 100, unit: 'kg', trend: 'up' },
  { name: 'Kale', current: 12, max: 50, unit: 'bunches', trend: 'down' },
]);

const lowStockItems = computed(() =>
  items.value.filter((item) => (item.current / item.max) < 0.3)
);

const getStockLevel = (current: number, max: number) => {
  const percent = (current / max) * 100;
  if (percent <= 20) return { color: 'bg-red-500', label: 'Critical' };
  if (percent <= 40) return { color: 'bg-orange-400', label: 'Low' };
  if (percent <= 70) return { color: 'bg-yellow-400', label: 'Medium' };
  return { color: 'bg-green-500', label: 'Good' };
};

const isExpanded = ref(false);
</script>

<template>
  <div class="bg-white dark:bg-zinc-900 border-t border-neutral-100 dark:border-zinc-800">
    <!-- Summary Bar -->
    <div
      class="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-zinc-800/50 transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <Package class="size-4 text-primary-deep" />
          <span class="text-sm font-bold text-foundation dark:text-white">Farm Inventory</span>
        </div>

        <!-- Low Stock Alert -->
        <div
          v-if="lowStockItems.length > 0"
          class="flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        >
          <AlertTriangle class="size-3 text-red-500" />
          <span class="text-xs font-bold text-red-600">
            {{ lowStockItems.length }} item{{ lowStockItems.length > 1 ? 's' : '' }} low stock
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-deep text-white text-xs font-bold hover:bg-primary-deep/90 transition-colors"
        >
          <Plus class="size-3" />
          Restock
        </button>
        <span class="text-xs text-neutral-400">
          {{ isExpanded ? '▼' : '▶' }}
        </span>
      </div>
    </div>

    <!-- Expanded Inventory Grid -->
    <div
      v-show="isExpanded"
      class="border-t border-neutral-100 dark:border-zinc-800 px-6 py-4"
    >
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div
          v-for="item in items"
          :key="item.name"
          class="p-3 rounded-xl border"
          :class="[
            (item.current / item.max) < 0.3
              ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
              : 'bg-neutral-50 dark:bg-zinc-800 border-neutral-100 dark:border-zinc-700'
          ]"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-bold text-foundation dark:text-white">{{ item.name }}</span>
            <TrendingDown
              v-if="item.trend === 'down'"
              class="size-3 text-red-500"
            />
          </div>

          <div class="flex items-center justify-between mb-2">
            <span class="text-lg font-bold" :class="(item.current / item.max) < 0.3 ? 'text-red-600' : 'text-primary-deep'">
              {{ item.current }}
            </span>
            <span class="text-xs text-neutral-400">/{{ item.max }} {{ item.unit }}</span>
          </div>

          <!-- Stock Level Bar -->
          <div class="h-1.5 bg-neutral-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="getStockLevel(item.current, item.max).color"
              :style="{ width: `${(item.current / item.max) * 100}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
