import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useSetupStore } from '../store/setup'
import { useUserStore } from '../store/user'
import { useAuthStore } from '../store/auth'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: () => import('../components/MainDashboard.vue'), meta: { roles: ['admin','vorstand','notenwart','mitglied'] } },
  { path: '/library', name: 'Library', component: () => import('../views/LibraryView.vue'), meta: { roles: ['admin','notenwart','dirigent','mitglied'] } },
  { path: '/members', name: 'Members', component: () => import('../views/MembersView.vue'), meta: { roles: ['admin','vorstand'] } },
  { path: '/events', name: 'Events', component: () => import('../views/EventsView.vue'), meta: { roles: ['admin','vorstand','mitglied'] } },
  { path: '/finances', name: 'Finances', component: () => import('../views/FinancesView.vue'), meta: { roles: ['admin','kassierer','vorstand'] } },
  { path: '/notes', name: 'NotesList', component: () => import('../views/NoteList.vue') },
  { path: '/notes/:id', name: 'NoteEditor', component: () => import('../views/NoteEditor.vue') },
  { path: '/create', name: 'NoteCreate', component: () => import('../views/NoteCreate.vue') },
  { path: '/settings', name: 'Settings', component: () => import('../views/SettingsView.vue'), meta: { roles: ['admin'] } },
  { path: '/import', name: 'MemberImport', component: () => import('../views/MemberImport.vue') },
  { path: '/login', name: 'Login', component: () => import('../components/Login.vue') },
  { path: '/setup', name: 'Setup', component: () => import('../components/SetupWizard.vue') }
]

const router = createRouter({ history: createWebHistory(), routes })

// Combined guard: first ensure setup is completed, then enforce role-based access
router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const setup = useSetupStore()
  // always allow setup route
  if (to.name === 'Setup') return next()
  if (!setup.setupCompleted) return next({ name: 'Setup' })

  // Role-based checks (if route has meta.roles)
  const allowedRoles = (to.meta && (to.meta as any).roles) || null
  if (!allowedRoles) return next()
  const auth = useAuthStore()
  const userStore = useUserStore()
  const roles = (auth.roles && auth.roles.length) ? auth.roles : userStore.roles
  const has = roles.some((r:string) => (allowedRoles as string[]).includes(r))
  if (has) return next()
  return next('/library')
})

export default router
