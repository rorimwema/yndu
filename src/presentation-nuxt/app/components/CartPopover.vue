<script setup lang="ts">
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  PopoverClose,
} from 'reka-ui';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-vue-next';
import { useCartStore } from '../stores/cart-store';

const cart = useCartStore();

const formatPrice = (price: number) => {
  return `KSh ${price.toLocaleString()}`;
};
</script>

<template>
  <PopoverRoot v-model:open="cart.isOpen" :modal="false">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        align="end"
        :side-offset="8"
        class="z-50 w-[340px] bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-neutral-100 dark:border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
      >
        <!-- Header -->
        <div class="px-4 py-3 border-b border-neutral-100 dark:border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <ShoppingBag :size="18" class="text-primary-deep" />
            <span class="font-semibold text-foundation">Cart</span>
            <span class="text-xs text-neutral-400">({{ cart.itemCount }})</span>
          </div>
          <PopoverClose class="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
            <X :size="16" class="text-neutral-400" />
          </PopoverClose>
        </div>

        <!-- Empty State -->
        <div v-if="cart.isEmpty" class="p-8 text-center">
          <ShoppingBag :size="32" class="mx-auto text-neutral-200 mb-3" />
          <p class="text-sm text-neutral-400 mb-4">Your cart is empty</p>
          <PopoverClose as-child>
            <NuxtLink 
              to="/shop"
              class="inline-block px-4 py-2 text-sm font-medium text-primary-deep hover:underline"
            >
              Browse products →
            </NuxtLink>
          </PopoverClose>
        </div>

        <!-- Items -->
        <div v-else>
          <div class="max-h-[280px] overflow-y-auto">
            <div class="p-3 space-y-3">
              <div 
                v-for="item in cart.items" 
                :key="item.id" 
                class="flex gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <!-- Image -->
                <div class="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                  <NuxtImg :src="item.image" :alt="item.name" class="w-full h-full object-cover" format="webp" sizes="64px" loading="lazy" />
                </div>
                
                <!-- Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start">
                    <h4 class="text-sm font-medium text-foundation truncate pr-2">{{ item.name }}</h4>
                    <button 
                      @click="cart.removeItem(item.productId)"
                      class="text-neutral-300 hover:text-red-500 transition-colors p-0.5"
                    >
                      <Trash2 :size="12" />
                    </button>
                  </div>
                  
                  <div class="flex items-center justify-between mt-1">
                    <!-- Quantity controls -->
                    <div class="flex items-center gap-1 bg-neutral-50 rounded-md p-0.5">
                      <button 
                        @click="cart.decrementQuantity(item.productId)"
                        class="p-1 hover:bg-white rounded transition-colors"
                      >
                        <Minus :size="10" />
                      </button>
                      <span class="w-5 text-center text-xs font-medium">{{ item.quantity }}</span>
                      <button 
                        @click="cart.incrementQuantity(item.productId)"
                        class="p-1 hover:bg-white rounded transition-colors"
                      >
                        <Plus :size="10" />
                      </button>
                    </div>
                    
                    <!-- Price -->
                    <span class="text-sm font-semibold text-foundation">
                      {{ formatPrice(item.price * item.quantity) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-neutral-100 dark:border-zinc-800 bg-neutral-50/50">
            <!-- Totals -->
            <div class="flex justify-between items-center mb-3">
              <span class="text-sm text-neutral-400">Subtotal</span>
              <span class="font-semibold text-foundation">{{ formatPrice(cart.cartTotals.subtotal) }}</span>
            </div>
            
            <div v-if="cart.cartTotals.delivery > 0" class="flex justify-between items-center mb-3 text-xs">
              <span class="text-neutral-400">Delivery</span>
              <span class="text-neutral-400">{{ formatPrice(cart.cartTotals.delivery) }}</span>
            </div>
            <div v-else class="flex justify-between items-center mb-3 text-xs">
              <span class="text-neutral-400">Delivery</span>
              <span class="text-green-600 font-medium">Free</span>
            </div>

            <!-- Checkout button -->
            <PopoverClose as-child>
              <NuxtLink
                to="/checkout"
                class="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-deep text-white font-semibold text-sm rounded-lg hover:bg-primary-deep/90 transition-colors"
              >
                Checkout · {{ formatPrice(cart.cartTotals.total) }}
                <ArrowRight :size="14" />
              </NuxtLink>
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
