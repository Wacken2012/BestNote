import { defineStore } from 'pinia'

export const useModuleStore = defineStore('modules', {
  state: () => ({
    libraryOpen: true
  }),
  actions: {
    toggleLibrary() { this.libraryOpen = !this.libraryOpen }
  }
})
