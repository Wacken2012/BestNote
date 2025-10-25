import { defineStore } from 'pinia'
import { Role } from '../services/PermissionService'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: '',
    name: '',
    roles: [] as Role[],
    language: 'de'
  }),
  actions: {
    login(user: { id: string; name: string; roles: Role[] }) {
      this.id = user.id
      this.name = user.name
      this.roles = user.roles
    },
    logout() {
      this.id = ''
      this.name = ''
      this.roles = []
    },
    setLanguage(lang: string) { this.language = lang }
  },
  getters: {
    isAdmin: (state) => state.roles.includes(Role.Admin)
    ,
    primaryRole: (state) => {
      const priority = [Role.Admin, Role.Notenwart, Role.Dirigent, Role.Vorstand, Role.Kassierer, Role.Mitglied] as Role[]
      for (const p of priority) {
        if (state.roles.includes(p)) return p
      }
      return 'mitglied' as Role
    }
  }
})
