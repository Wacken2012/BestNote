#!/usr/bin/env node
"use strict";
// Delete a member from server/data/db.json by id or membershipNumber
// Usage: node scripts/delete_member.js <id|membershipNumber>

const fs = require('fs')
const path = require('path')

const arg = process.argv[2]
if (!arg) {
  console.error('Usage: node scripts/delete_member.js <id|membershipNumber>')
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

const before = db.members.length
const id = arg
// remove by id or membershipNumber
db.members = db.members.filter(m => String(m.id) !== id && String(m.membershipNumber || '') !== id)
const after = db.members.length

if (after === before) {
  console.log('No member removed (no match)')
  process.exit(0)
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8')
console.log(`Removed ${before - after} member(s). db.json updated.`)
process.exit(0)
