
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
    {
      path: '/booking',
      name: 'new-booking',
      component: () => import('../views/BookingView.vue'),
    },
    {
      path: '/booking/:id',
      name: 'booking-view',
      component: () => import('../views/BookingView.vue'),
    },
    {
      path: '/chart-view/:mode',
      name: 'chart-view',
      component: () => import('../views/ChartView.vue'),
    },
    {
      path: '/equipment-view',
      name: 'equipment-view',
      component: () => import('../views/EquipmentView.vue'),
    },
    {
      path: '/redirect',
      name: 'redirect-view',
      component: () => import('../views/RedirectView.vue'),
    },
    {
      path: '/logout',
      name: 'logout-view',
      component: () => import('../views/Logout.vue'),
    },
  ],
});

export default router;
