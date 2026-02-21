<script setup lang="ts">
import { ref, computed } from 'vue';
import { motion } from 'motion-v';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-vue-next';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

interface Props {
  title: string;
  description?: string;
  columns: Column[];
  data: Record<string, any>[];
  tabs?: { id: string; label: string; count?: number }[];
  delay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  tabs: () => [],
  delay: 0,
});

const activeTab = ref(props.tabs[0]?.id || 'all');
const currentPage = ref(1);
const itemsPerPage = 5;

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return props.data.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => Math.ceil(props.data.length / itemsPerPage));

const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    completed: 'status-badge completed',
    delivered: 'status-badge completed',
    'in-progress': 'status-badge in-progress',
    processing: 'status-badge in-progress',
    pending: 'status-badge pending',
    cancelled: 'status-badge cancelled',
  };
  return statusMap[status.toLowerCase()] || 'status-badge pending';
};
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.4, delay: delay * 0.1 }"
    class="glass-card overflow-hidden"
  >
    <!-- Header -->
    <div class="p-5 border-b" style="border-color: rgba(90, 120, 99, 0.1);">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-semibold text-lg">{{ title }}</h3>
          <p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div v-if="tabs.length > 0" class="admin-tabs w-fit">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="admin-tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span v-if="tab.count" class="ml-1 opacity-60">({{ tab.count }})</span>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="admin-table">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">
              {{ column.label }}
            </th>
            <th class="w-12"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in paginatedData" :key="index">
            <td v-for="column in columns" :key="column.key">
              <template v-if="column.key === 'status'">
                <span :class="getStatusClass(row[column.key])">
                  {{ row[column.key] }}
                </span>
              </template>
              <template v-else-if="column.key === 'client'">
                <div class="flex items-center gap-3">
                  <NuxtImg
                    :src="row.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face`"
                    :alt="row[column.key]"
                    class="w-8 h-8 rounded-lg object-cover bg-neutral-100 dark:bg-zinc-800"
                    format="webp"
                    sizes="32px"
                    loading="lazy"
                  />
                  <span class="font-medium">{{ row[column.key] }}</span>
                </div>
              </template>
              <template v-else>
                {{ row[column.key] }}
              </template>
            </td>
            <td>
              <button class="p-1.5 rounded-lg hover:bg-accent transition-colors">
                <MoreHorizontal class="size-4 text-muted-foreground" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="p-4 border-t flex items-center justify-between" style="border-color: rgba(90, 120, 99, 0.1);">
      <p class="text-sm text-muted-foreground">
        Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, data.length) }} of {{ data.length }} results
      </p>
      <div class="flex items-center gap-1">
        <button
          :disabled="currentPage === 1"
          class="p-2 rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="currentPage--"
        >
          <ChevronLeft class="size-4" />
        </button>
        <span class="px-3 py-1 text-sm font-medium">{{ currentPage }} / {{ totalPages }}</span>
        <button
          :disabled="currentPage === totalPages"
          class="p-2 rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="currentPage++"
        >
          <ChevronRight class="size-4" />
        </button>
      </div>
    </div>
  </motion.div>
</template>
