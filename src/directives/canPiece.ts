import { canAccessPiece } from '../services/PermissionService'
import { useUserStore } from '../store/user'

export default {
  mounted(el: HTMLElement, binding: any) {
    try {
      const userStore = useUserStore()

      const updateVisibility = () => {
        const role = userStore.primaryRole
        const user = { role }
        const piece = binding.value
        const allowed = canAccessPiece(piece as any, user as any)
        el.style.display = allowed ? '' : 'none'
      }

      updateVisibility()
      // ensure reactivity has settled in tests by scheduling another update
      setTimeout(() => updateVisibility(), 0)

      const stop = userStore.$subscribe(() => {
        updateVisibility()
      })

      ;(el as any).__vCanPieceStop = stop
      ;(el as any).__vCanPieceStore = userStore
    } catch (e) {
      el.style.display = 'none'
    }
  },

  unmounted(el: HTMLElement) {
    const stop = (el as any).__vCanPieceStop
    if (typeof stop === 'function') stop()
  }
}
