import { defineStore } from 'pinia'

export const useSetupStore = defineStore('setup', {
  state: () => ({
    setupCompleted: (localStorage.getItem('setupCompleted') === 'true') || false,
    language: localStorage.getItem('lang') || 'de'
  }),
  actions: {
    setSetupCompleted(v: boolean) {
      this.setupCompleted = v
      localStorage.setItem('setupCompleted', v ? 'true' : 'false')
    },
    setLanguage(lang: string) {
      this.language = lang
      localStorage.setItem('lang', lang)
    }
  }
})
