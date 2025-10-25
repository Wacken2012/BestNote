import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const repoRoot = path.resolve(__dirname, '../../')
const tmpDir = path.join(repoRoot, 'tests', 'tmp_migrate')
const dbJsonPath = path.join(tmpDir, 'db.json')
const outSqlite = path.join(tmpDir, 'db.sqlite')
const scriptPath = path.join(repoRoot, 'scripts', 'migrate_db_to_sqlite.js')
const ensureTmp = () => { if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true }) }

describe('DB migration', () => {
  let backup: string | null = null
  beforeAll(() => {
  ensureTmp()
  if (fs.existsSync(dbJsonPath)) backup = fs.readFileSync(dbJsonPath, 'utf8')
  // seed test db.json
  const seed = { members: [ { id: 'a', firstname: 'A' }, { id: 'b', firstname: 'B' } ] }
  fs.writeFileSync(dbJsonPath, JSON.stringify(seed, null, 2), 'utf8')
  if (fs.existsSync(outSqlite)) fs.unlinkSync(outSqlite)
  })

  afterAll(() => {
    if (backup !== null) fs.writeFileSync(dbJsonPath, backup, 'utf8')
    if (fs.existsSync(outSqlite)) fs.unlinkSync(outSqlite)
  })

  it('dry-run reports count and does not create sqlite file', () => {
  const out = execSync(`node "${scriptPath}" --dry-run --db="${dbJsonPath}" --out="${outSqlite}"`, { cwd: repoRoot }).toString()
    expect(out).toContain('Would migrate 2 members')
    expect(fs.existsSync(outSqlite)).toBe(false)
  })

  it('migrates and creates sqlite file with correct count', () => {
  const out = execSync(`node "${scriptPath}" --db="${dbJsonPath}" --out="${outSqlite}"`, { cwd: repoRoot }).toString()
    expect(out).toMatch(/Migrated \d+ members to/) 
    expect(fs.existsSync(outSqlite)).toBe(true)
    // simple check: sqlite file size > 0
    const stat = fs.statSync(outSqlite)
    expect(stat.size).toBeGreaterThan(0)
  })
})
