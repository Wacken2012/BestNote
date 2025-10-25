import { canAccessCalendar } from '../services/PermissionService'
import { useUserStore } from '../store/user'

export default {
  mounted(el: HTMLElement) {
    try {
      const userStore = useUserStore()

      const updateVisibility = () => {
        try {
          const role = userStore.primaryRole
          const user = { role }
          const allowed = canAccessCalendar(user as any)
          el.style.display = allowed ? '' : 'none'
        } catch (err) {
          // hide on any error during evaluation
          el.style.display = 'none'
        }
      }

      updateVisibility()
      // ensure reactivity has settled in test environments
      setTimeout(() => updateVisibility(), 0)

      const stop = userStore.$subscribe(() => {
        try {
          updateVisibility()
        } catch (e) {
          // swallow to avoid breaking host app/tests; ensure element hidden
          el.style.display = 'none'
        }
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
