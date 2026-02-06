import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../views/LandingPage.vue';
import OrderPlacement from '../views/OrderPlacement.vue';
import Home from '../views/Home.vue';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
  },
  {
    path: '/orders',
    name: 'Orders',
    component: OrderPlacement,
  },
  {
    path: '/shop',
    name: 'Shop',
    component: () => import('../views/Home.vue'), // Temporary, replace with actual shop view
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
