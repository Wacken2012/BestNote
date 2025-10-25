import { canAccessCalendar } from '../services/PermissionService'
import { useUserStore } from '../store/user'

export default {
  mounted(el: HTMLElement) {
    try {
      const userStore = useUserStore()
      const role = userStore.primaryRole
      const user = { role }
      if (!canAccessCalendar(user as any)) {
        el.style.display = 'none'
      }
    } catch (e) {
      el.style.display = 'none'
    }
  }
}
