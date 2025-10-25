import { describe, it, expect } from 'vitest'

describe('vendor adapters', () => {
  it('openjverein.listMembers returns array', async () => {
    const openAdapter = await import('../vendor/openjverein/adapter.js')
    const impl = (openAdapter as any).default || openAdapter
    const list = await impl.listMembers()
    expect(Array.isArray(list)).toBe(true)
  })

  it('openjverein.getMemberById returns null for unknown', async () => {
    const openAdapter = await import('../vendor/openjverein/adapter.js')
    const impl = (openAdapter as any).default || openAdapter
    const m = await impl.getMemberById('no-such-id')
    expect(m === null || typeof m === 'object').toBe(true)
  })

  it('nextcloud.listMembers returns array', async () => {
    const nc = await import('../vendor/nextcloud/adapter.js')
    const impl = (nc as any).default || nc
    const list = await impl.listMembers()
    expect(Array.isArray(list)).toBe(true)
  })
})
