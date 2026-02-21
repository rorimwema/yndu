<script setup lang="ts">
import { Check } from 'lucide-vue-next';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface Props {
  steps: Step[];
  currentStep: number;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'stepClick', stepId: number): void;
}>();
</script>

<template>
  <div class="flex items-center justify-between">
    <template v-for="(step, index) in steps" :key="step.id">
      <!-- Step Button -->
      <button
        @click="emit('stepClick', step.id)"
        class="flex flex-col items-center group"
        :class="{ 'cursor-pointer': currentStep >= step.id, 'cursor-default': currentStep < step.id }"
        :disabled="currentStep < step.id"
      >
        <!-- Circle -->
        <div 
          class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 mb-2"
          :class="[
            currentStep === step.id 
              ? 'bg-primary-deep text-white shadow-lg shadow-primary-deep/30 scale-110' 
              : currentStep > step.id
                ? 'bg-primary-deep/20 text-primary-deep border-2 border-primary-deep'
                : 'bg-neutral-100 dark:bg-zinc-800 text-neutral-400 border-2 border-neutral-200 dark:border-zinc-700'
          ]"
        >
          <Check v-if="currentStep > step.id" :size="18" stroke-width="3" />
          <span v-else class="font-semibold text-sm">{{ step.id }}</span>
        </div>
        
        <!-- Labels -->
        <div class="text-center">
          <p 
            class="text-sm font-semibold transition-colors"
            :class="currentStep >= step.id ? 'text-foundation' : 'text-neutral-400'"
          >
            {{ step.title }}
          </p>
          <p class="text-xs text-neutral-400 hidden sm:block">{{ step.description }}</p>
        </div>
      </button>
      
      <!-- Connector -->
      <div 
        v-if="index < steps.length - 1"
        class="flex-1 h-0.5 mx-2 sm:mx-4 -mt-6 transition-colors duration-300"
        :class="currentStep > step.id ? 'bg-primary-deep/40' : 'bg-neutral-200 dark:bg-zinc-700'"
      />
    </template>
  </div>
</template>
