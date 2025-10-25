#!/usr/bin/env node
"use strict";
// Export member data from server/data/db.json to JSON or CSV
// Usage:
//   node scripts/export_member_data.js [--format=json|csv] [--out=path] [--id=<memberId>] [--all]

const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
let format = 'json'
let outPath = null
let id = null
let all = false

for (const a of args) {
  if (a.startsWith('--format=')) format = a.split('=')[1]
  else if (a.startsWith('--out=')) outPath = a.split('=')[1]
  else if (a.startsWith('--id=')) id = a.split('=')[1]
  else if (a === '--all') all = true
}

if (!all && !id) {
  console.error('Specify --id=<memberId> or --all')
  process.exit(2)
}

const repoRoot = path.resolve(__dirname, '..')
const dbPath = path.join(repoRoot, 'server', 'data', 'db.json')
if (!fs.existsSync(dbPath)) {
  console.error('db.json not found at', dbPath)
  process.exit(1)
}

const raw = fs.readFileSync(dbPath, 'utf8')
let db
try { db = JSON.parse(raw) } catch (e) { console.error('Failed to parse db.json:', e.message); process.exit(1) }

if (!Array.isArray(db.members)) {
  console.error('db.json does not contain a members array')
  process.exit(1)
}

let members
if (all) members = db.members
else members = db.members.filter(m => String(m.id) === String(id) || String(m.membershipNumber || '') === String(id))

if (!members || members.length === 0) {
  console.error('No members found for the given id')
  process.exit(1)
}

if (format === 'json') {
  const out = JSON.stringify(members, null, 2) + '\n'
  if (outPath) fs.writeFileSync(outPath, out, 'utf8')
  else process.stdout.write(out)
  process.exit(0)
}

if (format === 'csv') {
  const keys = new Set()
  for (const m of members) Object.keys(m).forEach(k => keys.add(k))
  const header = Array.from(keys)
  const rows = members.map(m => header.map(h => {
    const v = m[h]
    if (v === null || v === undefined) return ''
    return String(v).replace(/"/g, '""')
  }).join(','))
  const csv = '"' + header.join('","') + '"\n' + rows.map(r => '"' + r + '"').join('\n') + '\n'
  if (outPath) fs.writeFileSync(outPath, csv, 'utf8')
  else process.stdout.write(csv)
  process.exit(0)
}

console.error('Unknown format:', format)
process.exit(2)
