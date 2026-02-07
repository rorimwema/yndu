<script setup lang="ts">
import { motion } from 'motion-v';

interface Props {
  /** Initial delay before animation starts (in seconds) */
  delay?: number;
  /** Animation duration (in seconds) */
  duration?: number;
  /** Starting opacity (0-1) */
  initialOpacity?: number;
  /** Starting Y offset in pixels (positive = down, negative = up) */
  y?: number;
  /** Starting X offset in pixels (positive = right, negative = left) */
  x?: number;
  /** Scale starting value (1 = normal, 0.5 = half size) */
  scale?: number;
  /** Easing type */
  ease?: 'easeOut' | 'easeIn' | 'easeInOut' | 'linear' | 'circOut';
  /** Whether to animate only once when entering viewport */
  once?: boolean;
  /** Viewport margin for triggering animation */
  viewportMargin?: string;
}

const props = withDefaults(defineProps<Props>(), {
  delay: 0,
  duration: 0.5,
  initialOpacity: 0,
  y: 0,
  x: 0,
  scale: 1,
  ease: 'easeOut',
  once: true,
  viewportMargin: '-50px',
});
</script>

<template>
  <component
    :is="motion.div"
    :initial="{ 
      opacity: props.initialOpacity, 
      y: props.y, 
      x: props.x,
      scale: props.scale 
    }"
    :while-in-view="{ 
      opacity: 1, 
      y: 0, 
      x: 0,
      scale: 1 
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
