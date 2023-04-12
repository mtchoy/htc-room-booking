
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/bookings',
      name: 'booking-list',
      component: () => import('../views/BookingList.vue'),
    },
  ],
});

export default router;
