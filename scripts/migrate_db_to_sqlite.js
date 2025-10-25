#!/usr/bin/env node
"use strict";
// Migration: db.json -> SQLite using better-sqlite3 for atomic transactions
const fs = require('fs')
const path = require('path')
const Database = require('better-sqlite3')

const repoRoot = path.resolve(__dirname, '..')
const defaultDbPath = path.join(repoRoot, 'server', 'data', 'db.json')
const defaultOutPath = path.join(repoRoot, 'server', 'data', 'db.sqlite')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
function getArg(name, fallback) {
  const p = args.find(a => a.startsWith(name + '='))
  if (!p) return fallback
  return p.split('=')[1]
}
const dbPath = getArg('--db', defaultDbPath)
const outPath = getArg('--out', defaultOutPath)

if (!fs.existsSync(dbPath)) {
  console.error('db.json not found at', dbPath)
  process.exit(1)
}

const raw = fs.readFileSync(dbPath, 'utf8')
let dbJson
try { dbJson = JSON.parse(raw) } catch (e) { console.error('Failed to parse db.json:', e.message); process.exit(1) }

const members = dbJson.members || []

if (dryRun) {
  console.log(`Would migrate ${members.length} members to ${outPath}`)
  if (process.env.DEBUG_MIGRATE) console.log('Sample members:', JSON.stringify(members.slice(0,5), null, 2))
  process.exit(0)
}

try {
  if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
  const db = new Database(outPath)
  db.exec('PRAGMA journal_mode = WAL;')
  db.exec(`CREATE TABLE members (
    id TEXT PRIMARY KEY,
    firstname TEXT,
    lastname TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    birthdate TEXT,
    membership_number TEXT,
    data TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`)

  const insert = db.prepare('INSERT INTO members (id, firstname, lastname, email, phone, address, birthdate, membership_number, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const insertMany = db.transaction((rows) => {
    for (const m of rows) {
      insert.run(String(m.id || ''), m.firstname || '', m.lastname || '', m.email || '', m.phone || '', m.address || '', m.birthdate || '', m.membershipNumber || '', JSON.stringify(m))
    }
  })

  insertMany(members)
  const count = db.prepare('SELECT COUNT(*) as c FROM members').get().c
  console.log(`Migrated ${count} members to ${outPath}`)
  db.close()
} catch (e) {
  console.error('Migration failed:', e && e.message ? e.message : e)
  process.exit(1)
}
