import fs from 'fs'
import path from 'path'
import request from 'supertest'
import app from '../server/src/index'

const outPath = path.join(__dirname, '..', 'server', 'data', 'imported_members.json')

describe('POST /api/members/import', () => {
  const sample = [{ id: 'x1', name: 'Test One' }, { id: 'x2', name: 'Test Two' }]

  beforeEach(() => {
    // ensure clean state before each test
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
  })

  afterEach(() => {
    // cleanup file if created
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
  })

  test('dry-run returns counts and does not write file', async () => {
    const res = await request(app).post('/api/members/import?dry=true').set('x-user-role', 'admin').send({ members: sample })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('dry', true)
    expect(typeof res.body.created).toBe('number')
    expect(typeof res.body.updated).toBe('number')
    expect(fs.existsSync(outPath)).toBe(false)
  })

  test('commit writes imported_members.json', async () => {
    const res = await request(app).post('/api/members/import').set('x-user-role', 'admin').send({ members: sample })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('dry', false)
    expect(res.body.created).toBeGreaterThanOrEqual(1)
    expect(fs.existsSync(outPath)).toBe(true)
    const content = JSON.parse(fs.readFileSync(outPath, 'utf8'))
    expect(Array.isArray(content)).toBe(true)
  })
})
