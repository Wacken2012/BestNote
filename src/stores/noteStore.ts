import { defineStore } from 'pinia'
import type { Note } from '../types/note'
import { useSetupStore } from '../store/setup'

export const useNoteStore = defineStore('note', {
  state: () => ({
    notes: [] as Note[],
  }),
  actions: {
    addNote(sheetId: number, content: string, author = 'Du') {
      const id = Date.now()
      const createdAt = new Date().toISOString()
      this.notes.push({ id, sheetId, content, author, createdAt })
      return id
    },
    getNotesForSheet(sheetId: number) {
      return this.notes.filter(n => n.sheetId === sheetId)
    },
    init() {
      const setup = useSetupStore()
      if ((import.meta.env.VITE_DEMO === 'true') || !!setup.demoMode) {
        this.notes = [
          { id: 1, sheetId: 1, author: 'Dirigent', content: 'Takt 42: Einsatz verzögern', createdAt: new Date().toISOString() },
        ]
      }
    }
  },
})
