import { describe, it, expect } from 'vitest'
import request from 'supertest'

import app from '../server/src/index'

describe('/api/vendor/members', () => {
  it('returns members for default vendor', async () => {
    const res = await request(app).get('/api/vendor/members').set('x-user-role', 'admin')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('ok', true)
    expect(Array.isArray(res.body.members)).toBe(true)
  })
})
