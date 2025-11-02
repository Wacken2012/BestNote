import { defineStore } from 'pinia'

export const useSetupStore = defineStore('setup', {
  state: () => ({
    setupCompleted: false,
    language: 'de',
    orgName: '',
    demoMode: false
  }),
  actions: {
    complete({ orgName, language, demoMode }: { orgName: string; language: string; demoMode: boolean }) {
      this.setupCompleted = true
      this.language = language
      this.orgName = orgName
      this.demoMode = demoMode
      try {
        localStorage.setItem('setup', JSON.stringify(this.$state))
      } catch (e) {
        // ignore quota errors
      }
    },
    load() {
      const saved = localStorage.getItem('setup')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          Object.assign(this, parsed)
        } catch (e) {
          // corrupted value — ignore
        }
      }
      // Testmodus erzwingen
      if (import.meta.env.VITE_TEST_MODE === 'true') {
        this.setupCompleted = false
      }
    },
    setLanguage(lang: string) {
      this.language = lang
      try { localStorage.setItem('lang', lang) } catch (e) {}
    }
  }
})
