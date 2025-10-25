// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import membersRouter from '../server/src/routes/members'
import { signTestToken } from '../server/src/middleware/auth'
import fs from 'fs'
import path from 'path'

function createApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/members', membersRouter)
  return app
}

const repoRoot = path.resolve(__dirname, '..')
const dbPath = path.join(repoRoot, 'server', 'data', 'db.json')
let dbBackup: string | null = null

beforeAll(() => {
  if (fs.existsSync(dbPath)) {
    dbBackup = fs.readFileSync(dbPath, 'utf8')
  }
  // Seed a minimal db
  const seed = { members: [ { id: '1', firstname: 'Max', lastname: 'Mustermann', membershipNumber: 'M001', email: 'max@example.org' }, { id: '2', firstname: 'Erika', lastname: 'Mustermann', membershipNumber: 'M002' } ] }
  fs.writeFileSync(dbPath, JSON.stringify(seed, null, 2) + '\n', 'utf8')
})

afterAll(() => {
  if (dbBackup !== null) fs.writeFileSync(dbPath, dbBackup, 'utf8')
})

describe('Members API', () => {
  const app = createApp()

  it('GET /api/members - forbidden without admin role', async () => {
    const res = await request(app).get('/api/members')
    expect(res.status).toBe(403)
  })

  it('GET /api/members - allowed with admin role header', async () => {
    const res = await request(app).get('/api/members').set('x-user-role', 'admin')
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(Array.isArray(res.body.members)).toBe(true)
    expect(res.body.members.length).toBeGreaterThanOrEqual(2)
  })

  it('GET /api/members/:id - returns filtered member for anonymous viewer', async () => {
    const res = await request(app).get('/api/members/1')
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    const m = res.body.member
    expect(m).toBeDefined()
    // email should be redacted for non-admin
    expect(m.email).toBeUndefined()
  })

  it('GET /api/members/:id - members can see their own email when id matches via header', async () => {
    const res = await request(app).get('/api/members/1').set('x-user-id', '1').set('x-user-role', 'mitglied')
    expect(res.status).toBe(200)
    expect(res.body.member.email).toBe('max@example.org')
  })

  it('DELETE /api/members/:id - forbidden for non-admin', async () => {
    const res = await request(app).delete('/api/members/1')
    expect(res.status).toBe(403)
  })

  it('DELETE /api/members/:id - allowed for admin and removes member', async () => {
    const before = JSON.parse(fs.readFileSync(dbPath, 'utf8')).members.length
    const res = await request(app).delete('/api/members/1').set('x-user-role', 'admin')
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    const after = JSON.parse(fs.readFileSync(dbPath, 'utf8')).members.length
    expect(after).toBe(before - 1)
  })
})
