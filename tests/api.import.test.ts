import fs from 'fs'
import path from 'path'
import request from 'supertest'
import app from '../server/src/index'

const outPath = path.join(__dirname, '..', 'server', 'data', 'imported_members.json')
const backupsDir = path.join(__dirname, '..', 'server', 'data', 'backups')

describe('POST /api/members/import', () => {
  const sample = [{ id: 'x1', name: 'Test One' }, { id: 'x2', name: 'Test Two' }]

  beforeEach(() => {
    // ensure clean state before each test
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
    if (fs.existsSync(backupsDir)) {
      const files = fs.readdirSync(backupsDir)
      for (const f of files) fs.unlinkSync(path.join(backupsDir, f))
    }
  })

  afterEach(() => {
    // cleanup file if created
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
    if (fs.existsSync(backupsDir)) {
      const files = fs.readdirSync(backupsDir)
      for (const f of files) fs.unlinkSync(path.join(backupsDir, f))
    }
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
    // there should be no backups when backup wasn't requested
    if (fs.existsSync(backupsDir)) {
      const files = fs.readdirSync(backupsDir)
      expect(files.length).toBe(0)
    }
  })

  test('commit with backup creates backup file', async () => {
    const res = await request(app).post('/api/members/import').set('x-user-role', 'admin').send({ members: sample, backup: true })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('dry', false)
    // backup dir should exist and contain at least one file matching our pattern
    expect(fs.existsSync(backupsDir)).toBe(true)
    const files = fs.readdirSync(backupsDir)
    expect(files.length).toBeGreaterThanOrEqual(1)
    const match = files.some(f => /imported_members\.backup\.|db\.backup\.|members_snapshot\.backup\./.test(f))
    expect(match).toBe(true)
  })
})
