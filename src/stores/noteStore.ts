import { defineStore } from 'pinia'
import type { Note } from '../types/note'

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
  },
})
