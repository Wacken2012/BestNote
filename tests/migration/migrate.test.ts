import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const dataDir = path.join(__dirname, '..', '..', 'server', 'data')
const dbPath = path.join(dataDir, 'db.json')
const importedPath = path.join(dataDir, 'imported_members.json')
const script = path.join(__dirname, '..', '..', 'scripts', 'migrate_imported_members.js')

function runMigration(args = []) {
  const spawn = require('child_process').spawnSync
  const res = spawn('node', [script, ...args], { encoding: 'utf8' })
  return res
}

describe('migration script', () => {
  it('skips duplicates by id with default strategy', () => {
    // prepare
    const originalDb = { members: [{ id: 'm1', name: 'Alice' }] }
    const imp = [{ id: 'm1', name: 'Alice New' }, { id: 'm2', name: 'Bob' }]
    fs.writeFileSync(dbPath, JSON.stringify(originalDb, null, 2))
    fs.writeFileSync(importedPath, JSON.stringify(imp, null, 2))
    const res = runMigration([])
    const out = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    expect(out.members.find((m: any) => m.id === 'm1').name).toBe('Alice')
    expect(out.members.find((m: any) => m.id === 'm2').name).toBe('Bob')
    expect(res.status).toBe(0)
  })

  it('overwrites duplicates when strategy=overwrite', () => {
    const originalDb = { members: [{ id: 'm10', name: 'Charlie' }] }
    const imp = [{ id: 'm10', name: 'Charlie Over' }]
    fs.writeFileSync(dbPath, JSON.stringify(originalDb, null, 2))
    fs.writeFileSync(importedPath, JSON.stringify(imp, null, 2))
  const res = runMigration(['--strategy=overwrite','--confirm'])
    const out = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    expect(out.members.find((m: any) => m.id === 'm10').name).toBe('Charlie Over')
    expect(res.status).toBe(0)
  })

  it('handles empty imported_members.json gracefully', () => {
    const originalDb = { members: [{ id: 'm20', name: 'Dora' }] }
    fs.writeFileSync(dbPath, JSON.stringify(originalDb, null, 2))
    fs.writeFileSync(importedPath, JSON.stringify([], null, 2))
    const res = runMigration([])
    // should exit with non-zero because importer is empty; script currently exits
    expect(res.status).not.toBe(0)
  })

  it('creates db.json when missing/empty', () => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
    const imp = [{ id: 'm30', name: 'Eve' }]
    fs.writeFileSync(importedPath, JSON.stringify(imp, null, 2))
    const res = runMigration(['--confirm'])
    const out = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    expect(out.members.find((m: any) => m.id === 'm30').name).toBe('Eve')
    expect(res.status).toBe(0)
  })

  it('deduplicates by name case-insensitive when key=name', () => {
    const originalDb = { members: [{ id: 'm40', name: 'Frank Muller' }] }
    const imp = [{ id: 'x1', name: 'frank muller' }, { id: 'x2', name: 'FRANK  MULLER' }, { id: 'x3', name: 'George' }]
    fs.writeFileSync(dbPath, JSON.stringify(originalDb, null, 2))
    fs.writeFileSync(importedPath, JSON.stringify(imp, null, 2))
    const res = runMigration(['--strategy=skip', '--key=name'])
    const out = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    // only original + George should be present
    expect(out.members.some((m: any) => m.name === 'George')).toBe(true)
    const matches = out.members.filter((m: any) => m.name.toLowerCase().includes('frank'))
    expect(matches.length).toBe(1)
    expect(res.status).toBe(0)
  })

  it('handles malformed db.json gracefully', () => {
    fs.writeFileSync(dbPath, '{ this is : not json }')
    const imp = [{ id: 'm50', name: 'Helen' }]
    fs.writeFileSync(importedPath, JSON.stringify(imp, null, 2))
    const res = runMigration(['--confirm'])
    // should create a new db.json with Helen
    const out = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    expect(out.members.find((m: any) => m.name === 'Helen')).toBeTruthy()
    expect(res.status).toBe(0)
  })

  it('imports large file (500 members)', () => {
    const large = []
    for (let i = 0; i < 520; i++) large.push({ id: `L${i}`, name: `Member ${i}` })
    fs.writeFileSync(importedPath, JSON.stringify(large, null, 2))
    // remove db
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
    const res = runMigration(['--confirm'])
    const out = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    expect(out.members.length).toBeGreaterThanOrEqual(520)
    expect(res.status).toBe(0)
  })

  it('allows concurrent migrations (basic concurrency smoke test)', async () => {
    const imp1 = [{ id: 'C1', name: 'Concurrent One' }]
    const imp2 = [{ id: 'C2', name: 'Concurrent Two' }]
    fs.writeFileSync(path.join(dataDir, 'imported_members.json'), JSON.stringify(imp1, null, 2))
    const spawn = require('child_process').spawn
    const p1 = spawn('node', [script, '--confirm'])
    // quickly write another imported file and run second migration
    fs.writeFileSync(path.join(dataDir, 'imported_members.json'), JSON.stringify(imp2, null, 2))
    const p2 = spawn('node', [script, '--confirm'])
    const res = await Promise.all([
      new Promise(r => p1.on('close', r)),
      new Promise(r => p2.on('close', r))
    ])
    const out = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    expect(out.members.some((m: any) => m.name === 'Concurrent One' || m.name === 'Concurrent Two')).toBe(true)
  })
})
