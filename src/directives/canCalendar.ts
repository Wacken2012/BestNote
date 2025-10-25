import { canAccessCalendar } from '../services/PermissionService'
import { useUserStore } from '../store/user'

export default {
  mounted(el: HTMLElement) {
    try {
      const userStore = useUserStore()

      const updateVisibility = () => {
        const role = userStore.primaryRole
        const user = { role }
        const allowed = canAccessCalendar(user as any)
        el.style.display = allowed ? '' : 'none'
      }

      updateVisibility()
      // ensure reactivity has settled in test environments
      setTimeout(() => updateVisibility(), 0)

      const stop = userStore.$subscribe(() => {
        updateVisibility()
      })

      ;(el as any).__vCanCalendarStop = stop
      ;(el as any).__vCanCalendarStore = userStore
    } catch (e) {
      el.style.display = 'none'
    }
  },

  unmounted(el: HTMLElement) {
    const stop = (el as any).__vCanCalendarStop
    if (typeof stop === 'function') stop()
  }
}
