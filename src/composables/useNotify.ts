import { ref } from 'vue'

type Toast = { id: number; type?: 'info'|'success'|'error'; message: string }
const toasts = ref<Toast[]>([])
let nextId = 1

export function useNotify() {
  function push(message: string, type: Toast['type']='info', ttl = 4000) {
    const t = { id: nextId++, type, message }
    toasts.value.push(t)
    setTimeout(() => { toasts.value = toasts.value.filter(x=>x.id !== t.id) }, ttl)
  }
  return { toasts, push }
}
