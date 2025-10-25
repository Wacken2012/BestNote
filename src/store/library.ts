import { defineStore } from 'pinia'

export type Piece = {
  id: string
  title: string
  composer?: string
  voice?: string
  tags?: string[]
}

const STORAGE_KEY = 'omv_pieces_v1'

function load(): Piece[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

export const useLibraryStore = defineStore('library', {
  state: () => ({ pieces: load() as Piece[] }),
  actions: {
    addPiece(p: Piece) {
      this.pieces.unshift(p)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.pieces))
    },
    removePiece(id: string) {
      this.pieces = this.pieces.filter(x => x.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.pieces))
    }
  }
})
