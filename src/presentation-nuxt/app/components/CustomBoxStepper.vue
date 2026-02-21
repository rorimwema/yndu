<script setup lang="ts">
import { Check, Box, ShoppingBag } from 'lucide-vue-next';

interface Props {
  currentStep: number;
}

defineProps<Props>();

const steps = [
  { 
    id: 1, 
    label: 'Choose Size',
    description: 'Select your box',
    icon: Box 
  },
  { 
    id: 2, 
    label: 'Fill Box',
    description: 'Add produce',
    icon: ShoppingBag 
  },
];
</script>

<template>
  <div class="flex items-center">
    <template v-for="(step, index) in steps" :key="step.id">
      <!-- Step Circle -->
      <div class="flex flex-col items-center">
        <div 
          class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
          :class="[
            currentStep === step.id 
              ? 'bg-primary-deep text-white shadow-lg shadow-primary-deep/30 scale-110' 
              : currentStep > step.id
                ? 'bg-primary-deep/20 text-primary-deep border-2 border-primary-deep/30'
                : 'bg-neutral-100 dark:bg-zinc-800 text-neutral-400 border-2 border-neutral-200 dark:border-zinc-700'
          ]"
        >
          <component 
            :is="currentStep > step.id ? Check : step.icon" 
            :size="18" 
            :stroke-width="currentStep > step.id ? 3 : 2"
          />
        </div>
      </div>
      
      <!-- Connector -->
      <div 
        v-if="index < steps.length - 1"
        class="w-12 sm:w-16 h-0.5 mx-2 transition-colors duration-300"
        :class="currentStep > step.id ? 'bg-primary-deep/40' : 'bg-neutral-200 dark:bg-zinc-700'"
      />
    </template>
  </div>
</template>
