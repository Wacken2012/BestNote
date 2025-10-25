import { describe, it, expect } from 'vitest'
import { canAccessPiece, canAccessCalendar, Role, filterMemberForViewer } from '../../src/services/PermissionService'

describe('PermissionService', () => {
  describe('canAccessPiece', () => {
    it('allows Admin to access any piece', () => {
      const user = { roles: [Role.Admin] }
      const piece = { voice: 'Tenor', title: 'Teststück' }
      expect(canAccessPiece(piece, user)).toBe(true)
    })

    it('denies Mitglied access to other voices', () => {
      const user = { roles: [Role.Mitglied], voice: 'Sopran' }
      const piece = { voice: 'Tenor', title: 'Anderes Stück' }
      expect(canAccessPiece(piece, user)).toBe(false)
    })
  })

  describe('canAccessCalendar', () => {
    it('allows Vorstand to access calendar', () => {
      const user = { roles: [Role.Vorstand] }
      expect(canAccessCalendar(user)).toBe(true)
    })

    it('denies access for undefined/unknown role', () => {
      // simulate an unknown role at runtime
      // non-functional comment added to trigger PR labeler test
      const user = { roles: ['gast' as unknown as Role] }
      expect(canAccessCalendar(user)).toBe(false)
    })
  })

  describe('filterMemberForViewer', () => {
    const member = { id: 'm1', name: 'Max', email: 'max@example.com', phone: '0123', membershipNumber: '1001' }
    it('admin sees sensitive', () => {
      const viewer = { roles: [Role.Admin], id: 'admin' }
      const out: any = filterMemberForViewer(member as any, viewer as any)
      expect(out.email).toBe('max@example.com')
    })
    it('member sees own data', () => {
      const viewer = { roles: [Role.Mitglied], id: 'm1' }
      const out: any = filterMemberForViewer(member as any, viewer as any)
      expect(out.email).toBe('max@example.com')
    })
    it('other member redacted', () => {
      const viewer = { roles: [Role.Mitglied], id: 'm2' }
      const out: any = filterMemberForViewer(member as any, viewer as any)
      expect(out.email).toBeUndefined()
    })
  })
})
