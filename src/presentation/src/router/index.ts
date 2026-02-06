import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import OrderPlacement from '../views/OrderPlacement.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/orders',
    name: 'Orders',
    component: OrderPlacement,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
