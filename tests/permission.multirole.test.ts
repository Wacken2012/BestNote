import { describe, it, expect } from 'vitest'
import { filterMemberForViewer, Role } from '../src/services/PermissionService'

describe('filterMemberForViewer multi-role', () => {
  const member = { id: '42', firstname: 'Anna', lastname: 'Example', email: 'a@example.org', membershipNumber: 'A42' }

  it('admin sees all fields', () => {
    const viewer = { id: '1', roles: [Role.Admin] }
    const out = filterMemberForViewer(member as any, viewer as any)
    expect((out as any).email).toBe('a@example.org')
  })

  it('mitglied sees own record', () => {
    const viewer = { id: '42', roles: [Role.Mitglied] }
    const out = filterMemberForViewer(member as any, viewer as any)
    expect((out as any).email).toBe('a@example.org')
  })

  it('multi-role user including admin sees all', () => {
    const viewer = { id: '99', roles: [Role.Mitglied, Role.Admin] }
    const out = filterMemberForViewer(member as any, viewer as any)
    expect((out as any).email).toBe('a@example.org')
  })

  it('non-admin non-self has email redacted', () => {
    const viewer = { id: '10', roles: [Role.Mitglied] }
    const out = filterMemberForViewer(member as any, viewer as any)
    expect((out as any).email).toBeUndefined()
  })
})
