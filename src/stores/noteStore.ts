import { defineStore } from 'pinia'
import type { Note } from '../types/note'

export const useNoteStore = defineStore('note', {
  state: () => ({
    notes: [
      {
        id: 1,
        sheetId: 1,
        author: 'Dirigent',
        content: 'Takt 42: Einsatz verzögern',
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        sheetId: 1,
        author: 'Mitglied',
        content: 'Bitte Tempo beachten',
        createdAt: new Date().toISOString(),
      },
    ] as Note[],
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
