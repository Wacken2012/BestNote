import { defineStore } from 'pinia'

export const useNoteStore = defineStore('note', {
  state: () => ({
    notes: [
      { id: 1, title: 'Erste Notiz', content: 'Inhalt' },
      { id: 2, title: 'Zweite Notiz', content: 'Mehr Inhalt' },
    ],
  }),
  actions: {
    updateNote(id: number, title: string, content: string) {
      const note: any = this.notes.find((n: any) => n.id === id)
      if (note) {
        note.title = title
        note.content = content
      }
    },
    createNote(title: string, content: string) {
      const ids = this.notes.map((n: any) => Number(n.id) || 0)
      const newId = ids.length ? Math.max(...ids) + 1 : 1
      this.notes.push({ id: newId, title, content })
      return newId
    },
  },
})
