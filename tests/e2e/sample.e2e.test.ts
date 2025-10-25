import { describe, it, expect } from 'vitest'
import { can } from '../../src/services/PermissionService'

describe('E2E sample', () => {
  it('mock admin can perform admin actions', () => {
    const roles = ['admin'] as any
    expect(can('add_piece', roles)).toBe(true)
  })
})
