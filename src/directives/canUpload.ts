import { canUploadPiece } from '../services/PermissionService'
import { useUserStore } from '../store/user'
import { watch } from 'vue'

export default {
  mounted(el: HTMLElement) {
    try {
      const userStore = useUserStore()

      const updateVisibility = () => {
        const role = userStore.primaryRole
        const user = { role }
        const allowed = canUploadPiece(user as any)
        el.style.display = allowed ? '' : 'none'
      }

  updateVisibility()
  // schedule another visibility update on the next macrotask to ensure
  // Pinia/Vue reactivity has settled in test environments
  setTimeout(() => updateVisibility(), 0)

      // use Pinia's $subscribe to observe any state changes and update
      // visibility. This is more robust in test environments than a
      // composition API watch in a directive.
      const stop = userStore.$subscribe(() => {
        updateVisibility()
      })

  // store the stop handle so we can cleanup on unmount
  ;(el as any).__vCanUploadStop = stop
  // also keep a reference to the store for debugging/tests
  ;(el as any).__vCanUploadStore = userStore
    } catch (e) {
      el.style.display = 'none'
    }
  },

  unmounted(el: HTMLElement) {
    const stop = (el as any).__vCanUploadStop
    if (typeof stop === 'function') stop()
  }
}
