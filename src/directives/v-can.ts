import { DirectiveBinding } from 'vue'
import { useUserStore } from '../store/user'
import { can as canPermission } from '../services/PermissionService'

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
    const user = useUserStore()
    const permission = binding.value
    if (!permission) return
    const ok = canPermission(permission, user.roles)
    if (!ok) el.style.display = 'none'
  }
}
