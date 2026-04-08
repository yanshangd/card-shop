
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('@/views/DetailView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/views/OrderView.vue')
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/UserView.vue')
  },
  {
    path: '/admin/monitor',
    name: 'Monitor',
    component: () => import('@/views/MonitorView.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/payment/success',
    name: 'PaymentSuccess',
    component: () => import('@/views/PaymentSuccessView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAdmin && !userStore.isAdminLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
