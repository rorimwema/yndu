<script setup lang="ts">
import { motion } from 'motion-v';
import { computed } from 'vue';

interface Props {
  /** Direction to slide in from */
  direction?: 'left' | 'right' | 'up' | 'down';
  /** Distance to slide (in pixels) */
  distance?: number;
  /** Initial delay before animation starts (in seconds) */
  delay?: number;
  /** Animation duration (in seconds) */
  duration?: number;
  /** Whether to animate only once when entering viewport */
  once?: boolean;
  /** Viewport margin for triggering animation */
  viewportMargin?: string;
  /** Easing type */
  ease?: 'easeOut' | 'easeIn' | 'easeInOut' | 'linear' | 'circOut';
  /** Starting opacity (0-1) */
  initialOpacity?: number;
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'up',
  distance: 40,
  delay: 0,
  duration: 0.5,
  once: true,
  viewportMargin: '-50px',
  ease: 'easeOut',
  initialOpacity: 0,
});

const initialPosition = computed(() => {
  switch (props.direction) {
    case 'left':
      return { x: -props.distance, y: 0 };
    case 'right':
      return { x: props.distance, y: 0 };
    case 'up':
      return { x: 0, y: props.distance };
    case 'down':
      return { x: 0, y: -props.distance };
    default:
      return { x: 0, y: props.distance };
  }
});
</script>

<template>
  <component
    :is="motion.div"
    :initial="{ 
      opacity: props.initialOpacity, 
      x: initialPosition.x, 
      y: initialPosition.y 
    }"
    :while-in-view="{ 
      opacity: 1, 
      x: 0, 
      y: 0 
    }"
    :viewport="{ 
      once: props.once, 
      margin: props.viewportMargin 
    }"
    :transition="{ 
      duration: props.duration, 
      delay: props.delay,
      ease: props.ease 
    }"
  >
    <slot />
  </component>
</template>
