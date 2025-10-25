import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '../store/user'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/library' },
  { path: '/library', name: 'Library', component: () => import('../views/LibraryView.vue'), meta: { roles: ['admin','notenwart','dirigent','mitglied'] } },
  { path: '/members', name: 'Members', component: () => import('../views/MembersView.vue'), meta: { roles: ['admin','vorstand'] } },
  { path: '/events', name: 'Events', component: () => import('../views/EventsView.vue'), meta: { roles: ['admin','vorstand','mitglied'] } },
  { path: '/finances', name: 'Finances', component: () => import('../views/FinancesView.vue'), meta: { roles: ['admin','kassierer','vorstand'] } },
  { path: '/settings', name: 'Settings', component: () => import('../views/SettingsView.vue'), meta: { roles: ['admin'] } }
]

const router = createRouter({ history: createWebHistory(), routes })

// Role-based guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const allowedRoles = (to.meta && (to.meta as any).roles) || null
  if (!allowedRoles) return next()
  const has = userStore.roles.some(r => (allowedRoles as string[]).includes(r))
  if (has) return next()
  // otherwise redirect to library or show a 403 page in a real app
  return next('/library')
})

export default router
