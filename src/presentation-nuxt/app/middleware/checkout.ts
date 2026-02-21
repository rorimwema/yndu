import { useCartStore } from '../stores/cart-store.ts';

export default defineNuxtRouteMiddleware((_to, _from) => {
  const cartStore = useCartStore();

  // Redirect to home if cart is empty
  if (cartStore.isEmpty) {
    return navigateTo('/');
  }
});
