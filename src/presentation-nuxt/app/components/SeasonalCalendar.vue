<script setup lang="ts">
import { computed, ref } from 'vue';
import { motion } from 'motion-v';
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'reka-ui';
import { Leaf, Apple, Sprout, Sun, Snowflake, Wind } from 'lucide-vue-next';

interface ProduceItem {
  name: string;
  icon: string;
  months: number[]; // 0 = not in season, 1 = available, 2 = peak season
}

interface ProduceCategory {
  id: string;
  label: string;
  items: ProduceItem[];
}

const props = defineProps<{
  categories?: ProduceCategory[];
}>();

// Default seasonal produce data
const defaultCategories: ProduceCategory[] = [
  {
    id: 'vegetables',
    label: 'Vegetables',
    items: [
      { name: 'Asparagus', icon: '🥬', months: [0,0,2,3,3,2,0,0,0,0,0,0] },
      { name: 'Beets', icon: '🫑', months: [1,1,2,2,2,1,0,0,1,2,2,2] },
      { name: 'Bell Peppers', icon: '🫑', months: [0,0,0,0,1,2,3,3,2,1,0,0] },
      { name: 'Broccoli', icon: '🥦', months: [1,1,2,2,2,1,0,0,1,2,2,2] },
      { name: 'Brussels Sprouts', icon: '🥬', months: [2,2,1,0,0,0,0,0,0,1,2,2] },
      { name: 'Cabbage', icon: '🥬', months: [2,2,2,1,0,0,0,0,1,2,2,2] },
      { name: 'Carrots', icon: '🥕', months: [2,2,2,1,0,0,0,0,1,2,2,2] },
      { name: 'Cauliflower', icon: '🥦', months: [1,1,2,2,1,0,0,0,1,2,2,2] },
      { name: 'Corn', icon: '🌽', months: [0,0,0,0,0,1,3,3,2,0,0,0] },
      { name: 'Cucumber', icon: '🥒', months: [0,0,0,0,1,2,3,3,2,1,0,0] },
      { name: 'Eggplant', icon: '🍆', months: [0,0,0,0,0,1,2,3,3,2,0,0] },
      { name: 'Garlic', icon: '🧄', months: [0,0,0,0,0,1,2,3,2,1,0,0] },
      { name: 'Green Beans', icon: '🫘', months: [0,0,0,0,1,2,3,3,2,1,0,0] },
      { name: 'Kale', icon: '🥬', months: [2,2,2,1,0,0,0,0,1,2,2,2] },
      { name: 'Lettuce', icon: '🥬', months: [1,1,2,2,2,1,0,0,1,2,2,2] },
      { name: 'Onions', icon: '🧅', months: [1,1,1,1,2,2,2,1,1,1,1,1] },
      { name: 'Peas', icon: '🫛', months: [0,0,2,3,2,0,0,0,0,0,0,0] },
      { name: 'Potatoes', icon: '🥔', months: [2,2,1,0,0,0,0,1,2,3,3,2] },
      { name: 'Pumpkin', icon: '🎃', months: [0,0,0,0,0,0,0,1,2,3,3,1] },
      { name: 'Spinach', icon: '🍃', months: [2,2,2,1,0,0,0,0,1,2,2,2] },
      { name: 'Tomatoes', icon: '🍅', months: [0,0,0,0,1,2,3,3,2,1,0,0] },
      { name: 'Zucchini', icon: '🥒', months: [0,0,0,0,1,2,3,3,2,1,0,0] },
    ]
  },
  {
    id: 'fruits',
    label: 'Fruits',
    items: [
      { name: 'Apples', icon: '🍎', months: [2,2,1,0,0,0,0,1,2,3,3,2] },
      { name: 'Apricots', icon: '🍑', months: [0,0,0,0,0,1,2,1,0,0,0,0] },
      { name: 'Avocado', icon: '🥑', months: [1,1,1,1,2,2,2,2,2,2,1,1] },
      { name: 'Bananas', icon: '🍌', months: [1,1,1,1,1,1,1,1,1,1,1,1] },
      { name: 'Blackberries', icon: '🫐', months: [0,0,0,0,0,1,2,2,1,0,0,0] },
      { name: 'Blueberries', icon: '🫐', months: [0,0,0,0,0,1,2,2,1,0,0,0] },
      { name: 'Cantaloupe', icon: '🍈', months: [0,0,0,0,1,2,3,2,1,0,0,0] },
      { name: 'Cherries', icon: '🍒', months: [0,0,0,0,0,1,2,1,0,0,0,0] },
      { name: 'Cranberries', icon: '🫐', months: [0,0,0,0,0,0,0,0,1,2,3,1] },
      { name: 'Grapes', icon: '🍇', months: [0,0,0,0,0,0,1,2,3,2,0,0] },
      { name: 'Grapefruit', icon: '🍊', months: [2,2,2,1,0,0,0,0,0,0,1,2] },
      { name: 'Kiwi', icon: '🥝', months: [2,2,2,1,0,0,0,0,0,1,2,2] },
      { name: 'Lemons', icon: '🍋', months: [1,1,1,2,2,1,0,0,0,0,1,1] },
      { name: 'Mangoes', icon: '🥭', months: [0,0,0,1,2,2,2,1,0,0,0,0] },
      { name: 'Oranges', icon: '🍊', months: [2,2,2,1,0,0,0,0,0,0,1,2] },
      { name: 'Peaches', icon: '🍑', months: [0,0,0,0,0,1,2,2,1,0,0,0] },
      { name: 'Pears', icon: '🍐', months: [0,0,0,0,0,0,0,1,2,3,2,1] },
      { name: 'Pineapple', icon: '🍍', months: [1,1,1,2,2,1,0,0,0,0,1,1] },
      { name: 'Plums', icon: '🍑', months: [0,0,0,0,0,0,2,3,2,0,0,0] },
      { name: 'Raspberries', icon: '🫐', months: [0,0,0,0,0,1,2,2,1,0,0,0] },
      { name: 'Strawberries', icon: '🍓', months: [0,0,0,0,1,2,2,1,0,0,0,0] },
      { name: 'Watermelon', icon: '🍉', months: [0,0,0,0,0,1,2,3,2,0,0,0] },
    ]
  }
];

const categories = computed(() => props.categories ?? defaultCategories);

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const currentMonth = ref(new Date().getMonth());
const selectedTab = ref('all');

const getSeasonIcon = (monthIndex: number) => {
  if (monthIndex >= 2 && monthIndex <= 4) return Sprout; // Spring
  if (monthIndex >= 5 && monthIndex <= 7) return Sun; // Summer
  if (monthIndex >= 8 && monthIndex <= 10) return Wind; // Autumn
  return Snowflake; // Winter
};

const getSeasonName = (monthIndex: number) => {
  if (monthIndex >= 2 && monthIndex <= 4) return 'Spring';
  if (monthIndex >= 5 && monthIndex <= 7) return 'Summer';
  if (monthIndex >= 8 && monthIndex <= 10) return 'Autumn';
  return 'Winter';
};

const getStatusColor = (status: number) => {
  switch (status) {
    case 3: return 'bg-[#66800b] shadow-sm shadow-[#66800b]/30'; // Peak
    case 2: return 'bg-[#66800b]/70'; // Good
    case 1: return 'bg-[#66800b]/40'; // Available
    default: return 'bg-transparent';
  }
};

const getStatusLabel = (status: number) => {
  switch (status) {
    case 3: return 'Peak Season';
    case 2: return 'In Season';
    case 1: return 'Available';
    default: return 'Not in Season';
  }
};

const filteredCategories = computed(() => {
  if (selectedTab.value === 'all') return categories.value;
  return categories.value.filter(cat => cat.id === selectedTab.value);
});

const currentSeasonProduces = computed(() => {
  const current = currentMonth.value;
  const produces: { name: string; icon: string; category: string; status: number }[] = [];
  
  categories.value.forEach(cat => {
    cat.items.forEach(item => {
      const status = item.months[current];
      if (status >= 2) {
        produces.push({ name: item.name, icon: item.icon, category: cat.label, status });
      }
    });
  });
  
  return produces.sort((a, b) => b.status - a.status).slice(0, 6);
});
</script>

<template>
  <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header Section -->
    <div class="text-center mb-8 sm:mb-12">
      <motion.div
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5 }"
      >
        <span class="inline-flex items-center gap-2 text-[#66800b] text-sm font-semibold uppercase tracking-wider mb-3">
          <Leaf :size="16" />
          Farm to Table Guide
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111811] mb-4 tracking-tight">
          Seasonal <em class="text-[#66800b] font-normal">Harvest</em> Calendar
        </h2>
        <p class="text-[#546a54] max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          Discover the natural rhythm of fresh produce. Eating seasonally means better flavor, 
          higher nutrition, and support for local farmers.
        </p>
      </motion.div>
    </div>

    <!-- Current Season Highlight -->
    <motion.div
      class="mb-8 sm:mb-10"
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5, delay: 0.1 }"
    >
      <div class="glass-card p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-[#66800b]/10 flex items-center justify-center">
              <component :is="getSeasonIcon(currentMonth)" class="w-6 h-6 text-[#66800b]" />
            </div>
            <div>
              <h3 class="font-bold text-lg text-[#111811]">
                {{ fullMonthNames[currentMonth] }} — {{ getSeasonName(currentMonth) }}
              </h3>
              <p class="text-sm text-[#546a54]">What's in season now</p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-[#66800b]"></span>
              <span class="text-[#3c4c3c]">Peak</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-[#66800b]/70"></span>
              <span class="text-[#3c4c3c]">Good</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-[#66800b]/40"></span>
              <span class="text-[#3c4c3c]">Available</span>
            </span>
          </div>
        </div>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div
            v-for="produce in currentSeasonProduces"
            :key="produce.name"
            class="flex items-center gap-2 p-3 rounded-lg bg-white/50 border border-[#66800b]/10 hover:border-[#66800b]/30 transition-colors"
          >
            <span class="text-xl">{{ produce.icon }}</span>
            <div class="min-w-0">
              <p class="font-medium text-sm text-[#111811] truncate">{{ produce.name }}</p>
              <p class="text-xs text-[#66800b]">{{ produce.status === 3 ? 'Peak' : 'Good' }}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>

    <!-- Main Calendar Tabs -->
    <TabsRoot v-model="selectedTab" default-value="all" class="w-full">
      <TabsList 
        class="flex flex-wrap justify-center gap-2 mb-6 sm:mb-8 p-1.5 bg-[#66800b]/10 rounded-xl w-fit mx-auto"
        aria-label="Filter produce by category"
      >
        <TabsTrigger
          value="all"
          class="px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium text-[#546a54] transition-all duration-200 hover:text-[#111811] data-[state=active]:bg-white data-[state=active]:text-[#111811] data-[state=active]:shadow-sm"
        >
          All Produce
        </TabsTrigger>
        <TabsTrigger
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
          class="px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium text-[#546a54] transition-all duration-200 hover:text-[#111811] data-[state=active]:bg-white data-[state=active]:text-[#111811] data-[state=active]:shadow-sm flex items-center gap-2"
        >
          <Leaf v-if="category.id === 'vegetables'" :size="14" />
          <Apple v-if="category.id === 'fruits'" :size="14" />
          {{ category.label }}
        </TabsTrigger>
      </TabsList>

      <!-- All Categories View -->
      <TabsContent value="all" class="focus:outline-none">
        <div class="space-y-8">
          <div
            v-for="(category, catIndex) in categories"
            :key="category.id"
            class="glass-card overflow-hidden"
          >
            <motion.div
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.4, delay: catIndex * 0.1 }"
            >
              <div class="px-4 sm:px-6 py-4 border-b border-[#66800b]/10 bg-[#66800b]/5">
                <h3 class="font-bold text-lg text-[#111811] flex items-center gap-2">
                  <Leaf v-if="category.id === 'vegetables'" :size="18" class="text-[#66800b]" />
                  <Apple v-if="category.id === 'fruits'" :size="18" class="text-[#66800b]" />
                  {{ category.label }}
                </h3>
              </div>
              
              <!-- Desktop Table View -->
              <div class="hidden lg:block overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-[#66800b]/10">
                      <th class="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-[#546a54] w-40">Produce</th>
                      <th 
                        v-for="(month, idx) in monthNames" 
                        :key="month"
                        class="py-3 px-1 text-center text-xs font-semibold uppercase tracking-wider"
                        :class="idx === currentMonth ? 'text-[#66800b] bg-[#66800b]/5' : 'text-[#546a54]'"
                      >
                        {{ month }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, itemIndex) in category.items"
                      :key="item.name"
                      class="border-b border-[#66800b]/5 hover:bg-[#66800b]/5 transition-colors"
                      :style="{ animationDelay: `${itemIndex * 30}ms` }"
                    >
                      <td class="py-3 px-6">
                        <div class="flex items-center gap-3">
                          <span class="text-xl">{{ item.icon }}</span>
                          <span class="font-medium text-sm text-[#111811]">{{ item.name }}</span>
                        </div>
                      </td>
                      <td
                        v-for="(status, idx) in item.months"
                        :key="idx"
                        class="py-2 px-1"
                        :class="idx === currentMonth ? 'bg-[#66800b]/5' : ''"
                      >
                        <div class="flex justify-center">
                          <div
                            v-if="status > 0"
                            class="w-6 h-6 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer"
                            :class="getStatusColor(status)"
                            :title="`${item.name} — ${fullMonthNames[idx]}: ${getStatusLabel(status)}`"
                          />
                          <div v-else class="w-6 h-6 rounded-full bg-[#e2e8e2]/50" />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Mobile/Tablet Card View -->
              <div class="lg:hidden divide-y divide-[#66800b]/10">
                <div
                  v-for="item in category.items"
                  :key="item.name"
                  class="p-4 hover:bg-[#66800b]/5 transition-colors"
                >
                  <div class="flex items-center gap-3 mb-3">
                    <span class="text-2xl">{{ item.icon }}</span>
                    <h4 class="font-semibold text-[#111811]">{{ item.name }}</h4>
                  </div>
                  
                  <div class="grid grid-cols-6 gap-1">
                    <div
                      v-for="(status, idx) in item.months"
                      :key="idx"
                      class="flex flex-col items-center gap-1"
                    >
                      <span 
                        class="text-[10px] font-medium uppercase"
                        :class="idx === currentMonth ? 'text-[#66800b]' : 'text-[#8aa08a]'"
                      >
                        {{ monthNames[idx].charAt(0) }}
                      </span>
                      <div
                        class="w-full h-8 rounded-md transition-all duration-200"
                        :class="status > 0 ? getStatusColor(status) : 'bg-[#e2e8e2]/50'"
                        :title="`${item.name} — ${fullMonthNames[idx]}: ${getStatusLabel(status)}`"
                      />
                    </div>
                  </div>
                  
                  <!-- Season indicators -->
                  <div class="flex flex-wrap gap-2 mt-3 text-xs">
                    <span 
                      v-for="(status, idx) in item.months.map((s, i) => ({ status: s, index: i })).filter(x => x.status >= 2)" 
                      :key="idx"
                      class="px-2 py-0.5 rounded-full bg-[#66800b]/10 text-[#66800b] font-medium"
                    >
                      {{ monthNames[status.index] }}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </TabsContent>

      <!-- Individual Category Views -->
      <TabsContent
        v-for="category in categories"
        :key="category.id"
        :value="category.id"
        class="focus:outline-none"
      >
        <div class="glass-card overflow-hidden">
          <!-- Desktop Table View -->
          <div class="hidden lg:block overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-[#66800b]/10">
                  <th class="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-[#546a54] w-48">Produce</th>
                  <th 
                    v-for="(month, idx) in monthNames" 
                    :key="month"
                    class="py-4 px-2 text-center text-xs font-semibold uppercase tracking-wider"
                    :class="idx === currentMonth ? 'text-[#66800b] bg-[#66800b]/5' : 'text-[#546a54]'"
                  >
                    {{ month }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, itemIndex) in category.items"
                  :key="item.name"
                  class="border-b border-[#66800b]/5 hover:bg-[#66800b]/5 transition-colors"
                >
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <span class="text-2xl">{{ item.icon }}</span>
                      <div>
                        <span class="font-medium text-[#111811] block">{{ item.name }}</span>
                      </div>
                    </div>
                  </td>
                  <td
                    v-for="(status, idx) in item.months"
                    :key="idx"
                    class="py-3 px-2"
                    :class="idx === currentMonth ? 'bg-[#66800b]/5' : ''"
                  >
                    <div class="flex justify-center">
                      <div
                        v-if="status > 0"
                        class="w-8 h-8 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer"
                        :class="getStatusColor(status)"
                        :title="`${item.name} — ${fullMonthNames[idx]}: ${getStatusLabel(status)}`"
                      />
                      <div v-else class="w-8 h-8 rounded-full bg-[#e2e8e2]/50" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile/Tablet Card View -->
          <div class="lg:hidden divide-y divide-[#66800b]/10">
            <div
              v-for="item in category.items"
              :key="item.name"
              class="p-4 sm:p-5 hover:bg-[#66800b]/5 transition-colors"
            >
              <div class="flex items-center gap-3 mb-4">
                <span class="text-3xl">{{ item.icon }}</span>
                <h4 class="font-semibold text-lg text-[#111811]">{{ item.name }}</h4>
              </div>
              
              <!-- Month Grid -->
              <div class="grid grid-cols-6 sm:grid-cols-12 gap-2">
                <div
                  v-for="(status, idx) in item.months"
                  :key="idx"
                  class="flex flex-col items-center gap-1.5"
                >
                  <span 
                    class="text-xs font-medium uppercase"
                    :class="idx === currentMonth ? 'text-[#66800b]' : 'text-[#8aa08a]'"
                  >
                    {{ monthNames[idx] }}
                  </span>
                  <div
                    class="w-full h-10 rounded-lg transition-all duration-200"
                    :class="status > 0 ? getStatusColor(status) : 'bg-[#e2e8e2]/50'"
                    :title="`${item.name} — ${fullMonthNames[idx]}: ${getStatusLabel(status)}`"
                  />
                </div>
              </div>
              
              <!-- Season summary -->
              <div class="mt-4 pt-3 border-t border-[#66800b]/10">
                <p class="text-sm text-[#546a54]">
                  <span class="font-medium text-[#111811]">Peak months:</span>
                  {{ item.months.map((s, i) => s === 3 ? monthNames[i] : null).filter(Boolean).join(', ') || 'None' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </TabsRoot>

    <!-- Footer Note -->
    <motion.p
      class="text-center text-sm text-[#8aa08a] mt-8"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :transition="{ duration: 0.5, delay: 0.3 }"
    >
      Seasonal availability may vary based on weather and regional growing conditions.
    </motion.p>
  </div>
</template>

<style scoped>
/* Smooth transitions for tab content */
[data-state="active"] {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Table row hover animation */
tbody tr {
  transition: background-color 0.2s ease;
}

/* Custom scrollbar for table overflow */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: rgba(102, 128, 11, 0.2);
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 128, 11, 0.3);
}
</style>
