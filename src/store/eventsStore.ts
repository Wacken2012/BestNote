import { defineStore } from 'pinia'
import { useSetupStore } from './setup'

export const useEventsStore = defineStore('events', {
  state: () => ({ events: [] as Array<{ id: number; title: string; date: string; location: string }> }),
  actions: {
    init() {
      const setup = useSetupStore()
      if ((import.meta.env.VITE_DEMO === 'true') || !!setup.demoMode) {
        this.events = [
          { id: 1, title: 'Probe', date: '2025-11-05T19:00', location: 'Musikheim' },
          { id: 2, title: 'Konzert', date: '2025-11-12T20:00', location: 'Stadthalle' },
        ]
      }
    }
  }
})
