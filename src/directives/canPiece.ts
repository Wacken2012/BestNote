import { canAccessPiece } from '../services/PermissionService'
import { useUserStore } from '../store/user'

export default {
  mounted(el: HTMLElement, binding: any) {
    try {
      const userStore = useUserStore()
      const role = userStore.primaryRole
      const user = { role }
      const piece = binding.value
      if (!canAccessPiece(piece as any, user as any)) {
        el.style.display = 'none'
      }
    } catch (e) {
      el.style.display = 'none'
    }
  }
}
