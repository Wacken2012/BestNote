import { describe, it, expect } from 'vitest'
import {
  Role,
  canAccessPiece,
  canUploadPiece,
  canAccessCalendar,
} from '../src/services/PermissionService'

const pieceA = { voice: 'violin', title: 'Piece A' }
const pieceB = { voice: 'flute', title: 'Piece B' }

describe('canAccessPiece', () => {
  it('Mitglied: access only own voice', () => {
    const user = { role: Role.Mitglied, voice: 'violin' }
    expect(canAccessPiece(pieceA, user)).toBe(true)
    expect(canAccessPiece(pieceB, user)).toBe(false)
  })

  it('Dirigent, Notenwart, Vorstand, Admin: access all', () => {
    const roles = [Role.Dirigent, Role.Notenwart, Role.Vorstand, Role.Admin]
    for (const r of roles) {
      const user = { role: r }
      expect(canAccessPiece(pieceA, user)).toBe(true)
      expect(canAccessPiece(pieceB, user)).toBe(true)
    }
  })

  it('Kassierer: musician with matching voice -> allowed', () => {
    const user = { role: Role.Kassierer, voice: 'violin', isMusician: true }
    expect(canAccessPiece(pieceA, user)).toBe(true)
  })

  it('Kassierer: not musician -> denied even if voice matches', () => {
    const user = { role: Role.Kassierer, voice: 'violin', isMusician: false }
    expect(canAccessPiece(pieceA, user)).toBe(false)
  })
})

describe('canUploadPiece', () => {
  it('Only Notenwart and Admin may upload', () => {
    expect(canUploadPiece({ role: Role.Notenwart })).toBe(true)
    expect(canUploadPiece({ role: Role.Admin })).toBe(true)

    expect(canUploadPiece({ role: Role.Mitglied })).toBe(false)
    expect(canUploadPiece({ role: Role.Dirigent })).toBe(false)
    expect(canUploadPiece({ role: Role.Vorstand })).toBe(false)
    expect(canUploadPiece({ role: Role.Kassierer })).toBe(false)
  })
})

describe('canAccessCalendar', () => {
  it('All roles have calendar access', () => {
    const roles = [
      Role.Mitglied,
      Role.Dirigent,
      Role.Notenwart,
      Role.Vorstand,
      Role.Kassierer,
      Role.Admin,
    ]
    for (const r of roles) {
      expect(canAccessCalendar({ role: r })).toBe(true)
    }
  })
})
