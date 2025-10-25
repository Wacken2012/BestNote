import { defineStore } from 'pinia'
function safeJwtDecode(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    // atob works in browser; decodeURIComponent to handle unicode
    const decoded = atob(payload)
    const json = decodeURIComponent(Array.from(decoded).map((c: string) => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''))
    return JSON.parse(json)
  } catch (e) { return null }
}

interface Viewer {
  id?: string
  roles?: string[]
  [key: string]: any
}

export const useAuthStore = defineStore('auth', {
  state: () => ({ token: '' as string, viewer: {} as Viewer }),
  actions: {
    loadFromStorage() {
      const t = localStorage.getItem('jwt') || ''
      if (t) this.setToken(t)
    },
    setToken(t: string) {
      this.token = t
      localStorage.setItem('jwt', t)
      const payload: any = safeJwtDecode(t) || {}
      this.viewer = { id: payload.id || payload.sub || payload.user || '', roles: payload.roles || (payload.role ? [payload.role] : []) }
    },
    clear() {
      this.token = ''
      this.viewer = {}
      localStorage.removeItem('jwt')
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    roles: (state) => (state.viewer && state.viewer.roles) || []
  }
})
