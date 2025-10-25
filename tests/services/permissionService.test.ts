import { describe, it, expect } from 'vitest'
import { canAccessPiece, canAccessCalendar, Role } from '../../src/services/PermissionService'

describe('PermissionService', () => {
  describe('canAccessPiece', () => {
    it('allows Admin to access any piece', () => {
      const user = { role: Role.Admin }
      const piece = { voice: 'Tenor', title: 'Teststück' }
      expect(canAccessPiece(piece, user)).toBe(true)
    })

    it('denies Mitglied access to other voices', () => {
      const user = { role: Role.Mitglied, voice: 'Sopran' }
      const piece = { voice: 'Tenor', title: 'Anderes Stück' }
      expect(canAccessPiece(piece, user)).toBe(false)
    })
  })

  describe('canAccessCalendar', () => {
    it('allows Vorstand to access calendar', () => {
      const user = { role: Role.Vorstand }
      expect(canAccessCalendar(user)).toBe(true)
    })

    it('denies access for undefined/unknown role', () => {
      // simulate an unknown role at runtime
      const user = { role: 'gast' as unknown as Role }
      expect(canAccessCalendar(user)).toBe(false)
    })
  })
})
